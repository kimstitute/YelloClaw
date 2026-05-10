import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  KakaoRelayClient,
  resolveConversationKey,
  toKakaoImmediateResponse,
  toYellowClawInboundMessageFromRelay,
} from './index';
import type { KakaoRelayInboundMessage, KakaoSkillPayload } from '../../types';

describe('Kakao relay adapter', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('resolves conversation keys from payload and channel id', () => {
    const payload: KakaoSkillPayload = {
      userRequest: {
        utterance: 'hello',
        user: { id: 'user-1' },
      },
    };

    expect(resolveConversationKey(payload, 'channel-1')).toBe('channel-1:user-1');
  });

  it('builds immediate response', () => {
    const response = toKakaoImmediateResponse('hello');
    expect(response.useCallback).toBe(true);
    const output = response.template.outputs[0] as any;
    expect(output.textCard?.title).toBe('hello');
  });

  it('maps relay inbound message to yellow claw inbound message', () => {
    const relayMessage: KakaoRelayInboundMessage = {
      id: 'msg-1',
      conversationKey: 'channel-1:user-1',
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
        channelId: 'channel-1',
      },
      callbackUrl: 'https://example.com/callback',
      callbackExpiresAt: 456,
    };

    expect(toYellowClawInboundMessageFromRelay(relayMessage)).toEqual({
      channel: 'kakao',
      userId: 'user-1',
      text: 'hello',
      raw: relayMessage.kakaoPayload,
      callbackUrl: 'https://example.com/callback',
    });
  });

  it('probes relay health with auth header', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', timestamp: 123, version: '1.0.0' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new KakaoRelayClient('https://relay.example', 'token-123');
    const health = await client.probeHealth();

    expect(health.status).toBe('ok');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('https://relay.example/health');
    expect((init as RequestInit).headers).toMatchObject({ authorization: 'Bearer token-123' });
  });

  it('polls relay messages with auth header and query params', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ messages: [], hasMore: false }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new KakaoRelayClient('https://relay.example', 'token-123');
    const response = await client.pollMessages({ cursor: 'abc', waitMs: 5000, limit: 7 });

    expect(response.hasMore).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('https://relay.example/openclaw/messages?cursor=abc&wait=5000&limit=7');
    expect((init as RequestInit).headers).toMatchObject({ authorization: 'Bearer token-123' });
  });

  it('sends relay replies with request body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, deliveredAt: 123 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new KakaoRelayClient('https://relay.example', 'token-123');
    const response = await client.sendReply({
      messageId: 'msg-1',
      conversationKey: 'channel-1:user-1',
      response: {
        version: '2.0',
        useCallback: true,
        template: { outputs: [] },
      },
    });

    expect(response.success).toBe(true);
    const [, init] = fetchMock.mock.calls[0];
    expect(init).toMatchObject({
      method: 'POST',
    });
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      messageId: 'msg-1',
      conversationKey: 'channel-1:user-1',
      response: {
        version: '2.0',
        useCallback: true,
        template: { outputs: [] },
      },
    });
  });
});
