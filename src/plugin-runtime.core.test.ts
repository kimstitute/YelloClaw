import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { YellowClawRuntime } from './plugin-runtime';
import type { KakaoSkillPayload, YellowClawPluginConfig } from './types';

describe('YellowClawRuntime core contract', () => {
  beforeEach(() => {
    YellowClawRuntime.reset();
  });

  afterEach(() => {
    YellowClawRuntime.reset();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('keeps callback-mode request/response flow intact', async () => {
    const payload: KakaoSkillPayload = {
      userRequest: {
        utterance: 'hello',
        user: { id: 'user-1' },
        callbackUrl: 'https://example.com/callback',
      },
    };

    const immediate = YellowClawRuntime.handleSkillRequest(payload);
    expect(immediate.useCallback).toBe(true);

    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    globalThis.fetch = fetchMock as typeof fetch;

    await YellowClawRuntime.handleCallbackFlow(payload, {
      text: 'final response',
      cards: [{ textCard: { title: 'final response' } }],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('applies allowlist policy through configured runtime', () => {
    const config: YellowClawPluginConfig = {
      kakao: {
        enabled: true,
        channelId: 'kakao',
      },
      auth: {
        pairingRequired: true,
        adminUserId: 'admin-1',
      },
      policy: {
        adminOnlyTools: true,
        allowlistOnly: true,
        allowedUsers: ['allowed-user'],
      },
    };

    YellowClawRuntime.configure(config);
    const app = YellowClawRuntime.getApp();

    expect(app.canAccess('allowed-user')).toBe(true);
    expect(app.canAccess('blocked-user')).toBe(false);
  });

  it('keeps ACK only behavior when callbackUrl is absent', async () => {
    const payload: KakaoSkillPayload = {
      userRequest: {
        utterance: 'hello',
        user: { id: 'user-1' },
      },
    };

    const response = await YellowClawRuntime.handleCallbackFlow(payload, {
      text: 'final response',
      cards: [{ textCard: { title: 'final response' } }],
    });

    expect(response).toBeUndefined();
  });
});
