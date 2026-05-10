import { beforeEach, describe, expect, it, vi } from 'vitest';
import { YellowClawApp } from '../index';
import { configureRelayAdapter, getRelayAdapter, KakaoRelayClient, YellowClawRelayAdapter } from './relay';
import type { KakaoRelayInboundMessage, YellowClawPluginConfig } from '../types';

describe('relay adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a configured adapter from config', () => {
    const config: YellowClawPluginConfig = {
      kakao: {
        enabled: true,
        channelId: 'kakao',
        relayUrl: 'https://relay.example',
        relayToken: 'token-123',
      },
      auth: {
        pairingRequired: true,
        adminUserId: 'admin-1',
      },
      policy: {
        adminOnlyTools: true,
        allowlistOnly: true,
        allowedUsers: [],
      },
    };

    const adapter = configureRelayAdapter(config);
    expect(adapter).toBeInstanceOf(YellowClawRelayAdapter);
    expect(getRelayAdapter()).toBe(adapter);
  });

  it('probes relay health', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', timestamp: 123, version: '1.0.0' }),
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const client = new KakaoRelayClient('https://relay.example', 'token-123');
    const health = await client.probeHealth();

    expect(health.status).toBe('ok');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports readiness and runs relay once', async () => {
    const adapter = new YellowClawRelayAdapter({
      kakao: {
        enabled: true,
        channelId: 'kakao',
        relayUrl: 'https://relay.example',
        relayToken: 'token-123',
      },
      auth: {
        pairingRequired: true,
        adminUserId: 'admin-1',
      },
      policy: {
        adminOnlyTools: true,
        allowlistOnly: true,
        allowedUsers: [],
      },
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok', timestamp: 123, version: '1.0.0' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok', timestamp: 123, version: '1.0.0' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          messages: [
            {
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
            },
          ],
          hasMore: false,
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, deliveredAt: 1 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ acknowledged: 1 }) });
    globalThis.fetch = fetchMock as typeof fetch;

    const report = await adapter.getRelayReadinessReport();
    expect(report.issues).toEqual([]);
    expect(report.health?.status).toBe('ok');

    const run = await adapter.runRelayOnce(new YellowClawApp());
    expect(run.processed).toBe(1);
    expect(run.messageIds).toEqual(['msg-1']);
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it('maps relay inbound messages to YellowClaw inbound messages', async () => {
    const adapter = new YellowClawRelayAdapter({
      kakao: {
        enabled: true,
        channelId: 'kakao',
        relayUrl: 'https://relay.example',
        relayToken: 'token-123',
      },
      auth: {
        pairingRequired: true,
        adminUserId: 'admin-1',
      },
      policy: {
        adminOnlyTools: true,
        allowlistOnly: true,
        allowedUsers: [],
      },
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        messages: [
          {
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
          },
        ],
        hasMore: false,
      }),
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const inbox = await adapter.pollRelayInbox();
    expect(inbox).toHaveLength(1);
    expect(inbox[0]).toMatchObject({
      channel: 'kakao',
      userId: 'user-1',
      text: 'hello',
      callbackUrl: 'https://example.com/callback',
    });
  });
});
