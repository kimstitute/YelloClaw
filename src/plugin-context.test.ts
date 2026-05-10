import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { YellowClawApp } from './index';
import { defaultYellowClawConfig, mergeYellowClawConfig } from './config';
import { bootstrap } from './entrypoint';
import { getRelayAdapter } from './adapters/relay';
import type { YellowClawPluginConfig } from './types';

const originalFetch = globalThis.fetch;

function okResponse(body: unknown, status = 200, statusText = 'OK') {
  return {
    ok: true,
    status,
    statusText,
    json: async () => body,
  };
}

function createConfig(): YellowClawPluginConfig {
  return mergeYellowClawConfig(defaultYellowClawConfig, {
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
}

function seedRelayMessage() {
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
});

describe('plugin context integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('boots through the public entrypoint and configures relay adapter state', async () => {
    await bootstrap(createConfig());

    const adapter = getRelayAdapter();
    expect(adapter).toBeDefined();
    expect(adapter?.getStatus()).toMatchObject({
      configured: true,
      hasRelayClient: true,
      relayUrl: 'https://relay.example',
      relayTokenConfigured: true,
      channelId: 'kakao',
    });
  });

  it('runs a mock relay flow after public bootstrap', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okResponse({ status: 'ok', timestamp: 123, version: '1.0.0' }))
      .mockResolvedValueOnce(
        okResponse({
          messages: [seedRelayMessage()],
          hasMore: false,
        }),
      )
      .mockResolvedValueOnce(okResponse({ success: true, deliveredAt: 111 }))
      .mockResolvedValueOnce(okResponse({ acknowledged: 1 }));
    globalThis.fetch = fetchMock as typeof fetch;

    await bootstrap(createConfig());
    const adapter = getRelayAdapter();
    expect(adapter).toBeDefined();

    const app = new YellowClawApp();
    const handleSpy = vi.spyOn(app, 'handleInbound');
    const renderSpy = vi.spyOn(app, 'render').mockReturnValue({
      text: 'bot reply',
    });

    const run = await adapter!.runRelayOnce(app);

    expect(run).toEqual({
      readiness: expect.objectContaining({
        canProbeHealth: true,
        issues: [],
      }),
      processed: 1,
      messageIds: ['msg-1'],
    });
    expect(handleSpy).toHaveBeenCalledTimes(1);
    expect(renderSpy).toHaveBeenCalledWith({ text: 'hello' });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
