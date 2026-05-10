import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { YellowClawApp } from '../index';
import { defaultYellowClawConfig, mergeYellowClawConfig } from '../config';
import {
  configureRelayAdapter,
  getRelayAdapter,
  YellowClawRelayAdapter,
} from './relay';
import type {
  KakaoRelayInboundMessage,
  KakaoRelayReplyRequest,
  YellowClawPluginConfig,
  YellowClawRenderResult,
} from '../types';

const originalFetch = globalThis.fetch;

function createConfig(overrides: Partial<YellowClawPluginConfig> = {}): YellowClawPluginConfig {
  return mergeYellowClawConfig(defaultYellowClawConfig, {
    kakao: {
      enabled: true,
      channelId: 'kakao',
      relayUrl: 'https://relay.example',
      relayToken: 'token-123',
      ...overrides.kakao,
    },
    auth: {
      pairingRequired: true,
      adminUserId: 'admin-1',
      ...overrides.auth,
    },
    policy: {
      adminOnlyTools: true,
      allowlistOnly: true,
      allowedUsers: [],
      ...overrides.policy,
    },
  });
}

function okResponse(body: unknown, status = 200, statusText = 'OK') {
  return {
    ok: true,
    status,
    statusText,
    json: async () => body,
  };
}

function errorResponse(status: number, statusText: string, body: unknown = {}) {
  return {
    ok: false,
    status,
    statusText,
    json: async () => body,
  };
}

function seedRelayMessage(): KakaoRelayInboundMessage {
  return {
    id: 'msg-1',
    conversationKey: 'kakao:user-1',
    timestamp: 123,
    kakaoPayload: {
      userRequest: {
        utterance: 'hello',
        user: { id: 'user-1' },
      },
    },
    normalized: {
      userId: 'user-1',
      text: 'hello',
      channelId: 'kakao',
    },
    callbackUrl: 'https://example.com/callback',
    callbackExpiresAt: 456,
  };
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('relay adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a configured adapter from env/config and config wins merge', () => {
    vi.stubEnv('KAKAO_RELAY_URL', 'https://env-relay.example');
    vi.stubEnv('KAKAO_RELAY_TOKEN', 'env-token');

    const adapter = YellowClawRelayAdapter.fromEnvOrConfig(
      createConfig({
        kakao: {
          enabled: true,
          relayUrl: 'https://override-relay.example',
          relayToken: 'override-token',
          channelId: 'override-channel',
        },
      }),
    );

    expect(adapter).toBeInstanceOf(YellowClawRelayAdapter);
    expect(adapter?.getStatus()).toMatchObject({
      configured: true,
      hasRelayClient: true,
      relayUrl: 'https://override-relay.example',
      relayTokenConfigured: true,
      channelId: 'override-channel',
    });
  });

  it('returns null when relay credentials are missing', () => {
    vi.stubEnv('KAKAO_RELAY_URL', '');
    vi.stubEnv('KAKAO_RELAY_TOKEN', '');

    const adapter = YellowClawRelayAdapter.fromEnvOrConfig(
      createConfig({
        kakao: {
          enabled: true,
          relayUrl: undefined,
          relayToken: undefined,
        },
      }),
    );

    expect(adapter).toBeNull();
  });

  it('configures and reads the active singleton adapter', () => {
    const adapter = configureRelayAdapter(createConfig());
    expect(adapter).toBeInstanceOf(YellowClawRelayAdapter);
    expect(getRelayAdapter()).toBe(adapter);
  });

  it('reports readiness with a healthy relay snapshot', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      okResponse({ status: 'ok', timestamp: 123, version: '1.0.0' }),
    );
    globalThis.fetch = fetchMock as typeof fetch;

    const adapter = new YellowClawRelayAdapter(createConfig());
    const report = await adapter.getRelayReadinessReport();

    expect(report.canProbeHealth).toBe(true);
    expect(report.issues).toEqual([]);
    expect(report.health).toMatchObject({
      status: 'ok',
      timestamp: 123,
      version: '1.0.0',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports a readiness issue when relay health is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      okResponse({ status: 'degraded', timestamp: 123, version: '1.0.0' }),
    );
    globalThis.fetch = fetchMock as typeof fetch;

    const adapter = new YellowClawRelayAdapter(createConfig());
    const report = await adapter.getRelayReadinessReport();

    expect(report.canProbeHealth).toBe(true);
    expect(report.issues).toContain('health-degraded');
    expect(report.health?.status).toBe('degraded');
  });

  it('pollRelayInbox maps relay messages and forwards query params', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      okResponse({
        messages: [seedRelayMessage()],
        hasMore: false,
      }),
    );
    globalThis.fetch = fetchMock as typeof fetch;

    const adapter = new YellowClawRelayAdapter(createConfig());
    const inbox = await adapter.pollRelayInbox({
      limit: 2,
      cursor: 'cursor-1',
      waitMs: 1500,
    });

    expect(inbox).toHaveLength(1);
    expect(inbox[0]).toMatchObject({
      channel: 'kakao',
      userId: 'user-1',
      text: 'hello',
      callbackUrl: 'https://example.com/callback',
    });

    const calledUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(calledUrl.pathname).toBe('/openclaw/messages');
    expect(calledUrl.searchParams.get('limit')).toBe('2');
    expect(calledUrl.searchParams.get('cursor')).toBe('cursor-1');
    expect(calledUrl.searchParams.get('wait')).toBe('1500');
  });

  it('processRelayInbox polls, handles, replies, and acks', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        okResponse({
          messages: [seedRelayMessage()],
          hasMore: false,
        }),
      )
      .mockResolvedValueOnce(okResponse({ success: true, deliveredAt: 111 }))
      .mockResolvedValueOnce(okResponse({ acknowledged: 1 }));
    globalThis.fetch = fetchMock as typeof fetch;

    const app = new YellowClawApp();
    const handleSpy = vi.spyOn(app, 'handleInbound');
    const renderSpy = vi.spyOn(app, 'render').mockReturnValue({
      text: 'bot reply',
    } satisfies YellowClawRenderResult);

    const adapter = new YellowClawRelayAdapter(createConfig());
    const run = await adapter.processRelayInbox(app);

    expect(run).toEqual({ processed: 1, messageIds: ['msg-1'] });
    expect(handleSpy).toHaveBeenCalledTimes(1);
    expect(renderSpy).toHaveBeenCalledWith({ text: 'hello' });

    const replyCall = fetchMock.mock.calls[1];
    expect(String(replyCall[0])).toContain('/openclaw/reply');
    const replyBody = JSON.parse(String(replyCall[1]?.body)) as KakaoRelayReplyRequest;
    expect(replyBody).toMatchObject({
      messageId: 'msg-1',
      conversationKey: 'kakao:user-1',
      response: {
        version: '2.0',
        useCallback: true,
        data: {
          text: 'bot reply',
        },
      },
    });

    const ackCall = fetchMock.mock.calls[2];
    expect(String(ackCall[0])).toContain('/openclaw/messages/ack');
    expect(JSON.parse(String(ackCall[1]?.body))).toEqual({ messageIds: ['msg-1'] });
  });

  it('sendRelayReply posts the callback-shaped response body', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(okResponse({ success: true, deliveredAt: 111 }));
    globalThis.fetch = fetchMock as typeof fetch;

    const adapter = new YellowClawRelayAdapter(createConfig());
    const message = seedRelayMessage();

    const response = await adapter.sendRelayReply(message, {
      text: 'bot reply',
      quickReplies: [
        {
          label: 'retry',
          action: 'message',
          messageText: 'retry',
        },
      ],
    });

    expect(response).toEqual({ success: true, deliveredAt: 111 });

    const requestBody = JSON.parse(String(fetchMock.mock.calls[0][1]?.body)) as KakaoRelayReplyRequest;
    expect(requestBody).toMatchObject({
      messageId: 'msg-1',
      conversationKey: 'kakao:user-1',
      response: {
        version: '2.0',
        useCallback: true,
        template: {
          outputs: [],
          quickReplies: [
            {
              label: 'retry',
              action: 'message',
              messageText: 'retry',
            },
          ],
        },
        data: {
          text: 'bot reply',
        },
      },
    });
  });

  it('ackRelayMessages forwards ids and reports acknowledgement count', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(okResponse({ acknowledged: 2 }));
    globalThis.fetch = fetchMock as typeof fetch;

    const adapter = new YellowClawRelayAdapter(createConfig());
    const result = await adapter.ackRelayMessages(['msg-1', 'msg-2']);

    expect(result).toEqual({ acknowledged: 2 });
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ messageIds: ['msg-1', 'msg-2'] });
  });

  it('reports empty inbox cleanly', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      okResponse({ messages: [], hasMore: false }),
    );
    globalThis.fetch = fetchMock as typeof fetch;

    const adapter = new YellowClawRelayAdapter(createConfig());
    const inbox = await adapter.pollRelayInbox();

    expect(inbox).toEqual([]);
  });

  it('surfaces 401 readiness failures for a bad token', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(errorResponse(401, 'Unauthorized'));
    globalThis.fetch = fetchMock as typeof fetch;

    const adapter = new YellowClawRelayAdapter(createConfig({ kakao: { enabled: true, relayToken: 'bad-token' } }));
    const report = await adapter.getRelayReadinessReport();

    expect(report.canProbeHealth).toBe(true);
    expect(report.issues).toContain('health-probe-failed');
  });

  it('surfaces downstream reply failures', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(errorResponse(500, 'Internal Server Error'));
    globalThis.fetch = fetchMock as typeof fetch;

    const adapter = new YellowClawRelayAdapter(createConfig());

    await expect(
      adapter.sendRelayReply(seedRelayMessage(), { text: 'bot reply' }),
    ).rejects.toThrow('Relay reply failed: 500 Internal Server Error');
  });

  it('surfaces unknown message reference errors', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(errorResponse(400, 'Bad Request'));
    globalThis.fetch = fetchMock as typeof fetch;

    const adapter = new YellowClawRelayAdapter(createConfig());

    await expect(
      adapter.sendRelayReply(seedRelayMessage(), { text: 'bot reply' }),
    ).rejects.toThrow('Relay reply failed: 400 Bad Request');
  });

  it('keeps runRelayOnce empty when readiness is not healthy', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(errorResponse(401, 'Unauthorized'));
    globalThis.fetch = fetchMock as typeof fetch;

    const adapter = new YellowClawRelayAdapter(createConfig({ kakao: { enabled: true, relayToken: 'bad-token' } }));
    const run = await adapter.runRelayOnce(new YellowClawApp());

    expect(run.processed).toBe(0);
    expect(run.messageIds).toEqual([]);
    expect(run.readiness.issues).toContain('health-probe-failed');
  });
});
