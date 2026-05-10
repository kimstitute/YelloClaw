import { describe, expect, it } from 'vitest';
import { loadPluginConfigFromEnv, mergeYellowClawConfig, validateRelayUrl } from './config';

describe('config', () => {
  it('normalizes relay url', () => {
    expect(validateRelayUrl(' https://example.com/ ')).toBe('https://example.com');
  });

  it('loads plugin config from env', () => {
    const config = loadPluginConfigFromEnv({
      KAKAO_RELAY_URL: 'https://relay.example/',
      KAKAO_RELAY_TOKEN: 'token-123',
      KAKAO_ADMIN_USER_ID: 'admin-1',
      KAKAO_ALLOWED_USERS: 'u1,u2',
    });

    expect(config?.kakao.relayUrl).toBe('https://relay.example');
    expect(config?.kakao.relayToken).toBe('token-123');
    expect(config?.auth.adminUserId).toBe('admin-1');
    expect(config?.policy.allowedUsers).toEqual(['u1', 'u2']);
  });

  it('merges config overrides', () => {
    const merged = mergeYellowClawConfig(undefined, {
      kakao: {
        enabled: true,
        channelId: 'kakao',
        relayUrl: 'https://relay.example/',
        relayToken: 'token-123',
      },
      auth: {
        pairingRequired: true,
        adminUserId: 'admin-1',
      },
      policy: {
        adminOnlyTools: true,
        allowlistOnly: true,
        allowedUsers: ['u1'],
      },
    });

    expect(merged.kakao.relayUrl).toBe('https://relay.example');
    expect(merged.kakao.relayToken).toBe('token-123');
    expect(merged.policy.allowedUsers).toEqual(['u1']);
  });
});
