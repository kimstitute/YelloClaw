import type { IncomingMessage, ServerResponse } from 'node:http';
import type { OpenClawPluginApi, PluginRuntime, OpenClawConfig } from 'openclaw/plugin-sdk/channel-core';
import type { KakaoSkillPayload } from '../types.js';
import { callbackUrlMap, kakaoOutboundAdapter } from './outbound.js';
import { buildCallbackPayload, postKakaoCallback } from '../callback.js';
import { renderTextOnly } from '../renderers/index.js';
import { renderOutboxMessages } from '../renderers/outbox.js';
import { fetchPendingMessages, isOutboxEnabled, markPulled } from '../outbox.js';

const PULL_PHRASES = new Set([
  '.', '확인', '알림 확인', '새 메시지 확인', '대기 메시지 확인',
  '업데이트 확인', '뭐 온 거 있어?', '/pull',
]);

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function buildTurnAdapter(raw: KakaoSkillPayload, rt: PluginRuntime) {
  const userId = raw.userRequest.user?.id ?? 'unknown';
  const utterance = raw.userRequest.utterance;

  return {
    ingest: () => ({
      id: `kakao-msg-${Date.now()}`,
      rawText: utterance,
      timestamp: Date.now(),
    }),

    classify: () => ({
      kind: 'message' as const,
      canStartAgentTurn: true,
    }),

    resolveTurn: async (input: { rawText: string }) => {
      const cfg = rt.config.current() as OpenClawConfig;

      const route = rt.channel.routing.resolveAgentRoute({
        cfg,
        channel: 'kakao-talkchannel',
        peer: { kind: 'direct', id: userId },
      });

      const storePath = rt.channel.session.resolveStorePath(undefined, {
        agentId: route.agentId,
      });

      const ctxPayload = rt.channel.turn.buildContext({
        channel: 'kakao-talkchannel',
        accountId: route.accountId,
        from: userId,
        sender: { id: userId },
        conversation: {
          kind: 'direct',
          id: userId,
          routePeer: { kind: 'direct', id: userId },
        },
        route: {
          agentId: route.agentId,
          accountId: route.accountId,
          routeSessionKey: route.sessionKey,
        },
        reply: {
          to: userId,
          originatingTo: userId,
        },
        message: {
          rawBody: input.rawText,
          envelopeFrom: userId,
        },
      });

      return {
        cfg,
        channel: 'kakao-talkchannel',
        accountId: route.accountId,
        agentId: route.agentId,
        routeSessionKey: route.sessionKey,
        storePath,
        ctxPayload,
        recordInboundSession: rt.channel.session.recordInboundSession,
        dispatchReplyWithBufferedBlockDispatcher:
          rt.channel.reply.dispatchReplyWithBufferedBlockDispatcher,
        delivery: {
          deliver: async (payload: { text?: string }, _info: unknown) => {
            if (!payload.text) return;
            const result = await kakaoOutboundAdapter.sendText!({
              cfg,
              to: userId,
              text: payload.text,
            });
            return { messageIds: [result.messageId], visibleReplySent: true };
          },
          onError: (err: unknown) => {
            console.error('[outbound] delivery error', err);
            callbackUrlMap.delete(userId);
          },
        },
      };
    },
  };
}

export function registerInboundRoute(
  api: OpenClawPluginApi,
  getRuntime: () => PluginRuntime | undefined,
): void {
  api.registerHttpRoute({
    path: '/webhook/kakao',
    auth: 'plugin',
    handler: async (req: IncomingMessage, res: ServerResponse) => {
      const body = await readBody(req);

      let payload: KakaoSkillPayload;
      try {
        payload = JSON.parse(body) as KakaoSkillPayload;
      } catch {
        res.writeHead(400);
        res.end('Bad Request');
        return;
      }

      const userId = payload.userRequest.user?.id ?? 'unknown';
      const callbackUrl = payload.userRequest.callbackUrl;

      // Immediate ACK — must respond within 5 seconds
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ version: '2.0', useCallback: true }));

      const rt = getRuntime();
      if (!rt) {
        console.error('[inbound] runtime not ready yet');
        return;
      }
      if (!callbackUrl) {
        console.warn(`[inbound] no callbackUrl for userId=${userId} — kakao callback mode off`);
        return;
      }

      // allowFrom 차단: pairingRequired=true 이고 allowFrom 목록이 있으면 목록에 없는 사용자는 무시
      const cfg = rt.config.current() as OpenClawConfig;
      const ch = (cfg as Record<string, unknown>)['channels'] as Record<string, unknown> | undefined;
      const section = ch?.['kakao-talkchannel'] as Record<string, unknown> | undefined;
      const entry = section?.['default'] as Record<string, unknown> | undefined;
      const pairingRequired = entry?.['pairingRequired'] !== false;
      const allowFrom = (entry?.['allowFrom'] as string[] | undefined) ?? [];
      if (pairingRequired && allowFrom.length > 0 && !allowFrom.includes(userId)) {
        console.warn(`[inbound] blocked userId=${userId} (not in allowFrom)`);
        postKakaoCallback(callbackUrl, buildCallbackPayload(renderTextOnly('이 채널은 허가된 사용자만 이용할 수 있습니다.'))).catch(() => {});
        return;
      }

      // pull phrase: outbox 조회 후 콜백 직접 응답 (AI turn 없음)
      if (isOutboxEnabled() && PULL_PHRASES.has(payload.userRequest.utterance.trim())) {
        try {
          const messages = await fetchPendingMessages(userId);
          const rendered = renderOutboxMessages(messages);
          await postKakaoCallback(callbackUrl, buildCallbackPayload(rendered));
          await Promise.all(messages.map((m) => markPulled(m.id)));
        } catch (err) {
          console.error('[inbound] pull error', err);
          postKakaoCallback(callbackUrl, buildCallbackPayload(renderTextOnly('알림을 불러오는 데 실패했습니다.'))).catch(() => {});
        }
        return;
      }

      callbackUrlMap.set(userId, callbackUrl);

      rt.channel.turn.run({
        channel: 'kakao-talkchannel',
        raw: payload,
        adapter: buildTurnAdapter(payload, rt),
      }).catch((err: unknown) => {
        console.error('[inbound] turn error', err);
        callbackUrlMap.delete(userId);
      });
    },
  });
}
