import type { YellowClawPluginConfig } from './types';

export const defaultYellowClawConfig: YellowClawPluginConfig = {
  kakao: {
    enabled: true,
    channelId: 'kakao',
    relayUrl: undefined,
    relayToken: undefined,
  },
  auth: {
    pairingRequired: true,
    adminUserId: '',
  },
  policy: {
    adminOnlyTools: true,
    allowlistOnly: true,
    allowedUsers: [],
  },
};

export function normalizeRelayUrl(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\/$/, '');
}

export function validateRelayUrl(value?: string): string | undefined {
  const normalized = normalizeRelayUrl(value);
  if (!normalized) return undefined;

  try {
    const url = new URL(normalized);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('relayUrl must use http or https');
    }
    return normalized;
  } catch (error) {
    throw new Error(`Invalid relayUrl: ${normalized}`);
  }
}

export function loadPluginConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): YellowClawPluginConfig | undefined {
  const relayUrl = validateRelayUrl(env.KAKAO_RELAY_URL);
  const relayToken = env.KAKAO_RELAY_TOKEN?.trim() || undefined;
  const adminUserId = env.KAKAO_ADMIN_USER_ID?.trim() || defaultYellowClawConfig.auth.adminUserId;

  if (!relayUrl && !relayToken && !env.KAKAO_ADMIN_USER_ID) {
    return undefined;
  }

  return {
    kakao: {
      enabled: env.KAKAO_ENABLED !== 'false',
      channelId: env.KAKAO_CHANNEL_ID?.trim() || defaultYellowClawConfig.kakao.channelId,
      relayUrl,
      relayToken,
    },
    auth: {
      pairingRequired: env.KAKAO_PAIRING_REQUIRED !== 'false',
      adminUserId,
    },
    policy: {
      adminOnlyTools: env.KAKAO_ADMIN_ONLY_TOOLS !== 'false',
      allowlistOnly: env.KAKAO_ALLOWLIST_ONLY !== 'false',
      allowedUsers: env.KAKAO_ALLOWED_USERS?.split(',').map((value) => value.trim()).filter(Boolean) ?? [],
    },
  };
}

export function mergeYellowClawConfig(
  base: YellowClawPluginConfig = defaultYellowClawConfig,
  overrides?: Partial<YellowClawPluginConfig>,
): YellowClawPluginConfig {
  return {
    kakao: {
      ...base.kakao,
      ...overrides?.kakao,
      relayUrl: validateRelayUrl(overrides?.kakao?.relayUrl ?? base.kakao.relayUrl),
      relayToken: overrides?.kakao?.relayToken ?? base.kakao.relayToken,
    },
    auth: {
      ...base.auth,
      ...overrides?.auth,
    },
    policy: {
      ...base.policy,
      ...overrides?.policy,
      allowedUsers: overrides?.policy?.allowedUsers ?? base.policy.allowedUsers,
    },
  };
}
