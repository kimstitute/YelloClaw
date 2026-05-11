import type { OpenClawConfig, ChannelPlugin } from 'openclaw/plugin-sdk/channel-core';
import type { ChannelSetupAdapter } from 'openclaw/plugin-sdk/channel-setup';

export type KakaoAccount = {
  accountId: string;
  relayUrl: string;
  relayToken: string;
  /** 카카오 파트너센터 채널 URL ID (pf.kakao.com/_XXXXX의 _XXXXX 부분) */
  externalId?: string;
  pairingRequired?: boolean;
  allowFrom?: string[];
};

type KakaoChannelEntry = {
  relayUrl?: string;
  relayToken?: string;
  externalId?: string;
  pairingRequired?: boolean;
  allowFrom?: string[];
};

const SECTION_KEY = 'kakao-talkchannel';
const DEFAULT_ID = 'default';

function getSection(cfg: OpenClawConfig): Record<string, KakaoChannelEntry> {
  const ch = (cfg as Record<string, unknown>)['channels'] as Record<string, unknown> | undefined;
  return (ch?.[SECTION_KEY] as Record<string, KakaoChannelEntry>) ?? {};
}

export const kakaoConfigAdapter: NonNullable<ChannelPlugin<KakaoAccount>['config']> = {
  listAccountIds: (cfg) => Object.keys(getSection(cfg)),
  resolveAccount: (cfg, accountId?) => {
    const id = accountId ?? DEFAULT_ID;
    const entry = getSection(cfg)[id] ?? {};
    return {
      accountId: id,
      relayUrl: entry.relayUrl ?? '',
      relayToken: entry.relayToken ?? '',
      externalId: entry.externalId,
      pairingRequired: entry.pairingRequired,
      allowFrom: entry.allowFrom,
    };
  },
};

export const kakaoSetupAdapter: ChannelSetupAdapter = {
  applyAccountConfig: ({ cfg, accountId, input }) => {
    const updated = { ...(cfg as Record<string, unknown>) };
    const channels = { ...(updated['channels'] as Record<string, unknown> ?? {}) };
    const section = { ...(channels[SECTION_KEY] as Record<string, unknown> ?? {}) };
    section[accountId] = {
      ...(section[accountId] as Record<string, unknown> ?? {}),
      ...(input.token ? { relayToken: input.token } : {}),
    };
    channels[SECTION_KEY] = section;
    updated['channels'] = channels;
    return updated as OpenClawConfig;
  },
};
