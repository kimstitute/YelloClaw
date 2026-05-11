import type { ChannelPlugin } from 'openclaw/plugin-sdk/channel-core';
import type { KakaoAccount } from './config.js';

const SECTION_KEY = 'kakao-talkchannel';

export const kakaoSecurityAdapter: NonNullable<ChannelPlugin<KakaoAccount>['security']> = {
  resolveDmPolicy: (ctx) => {
    const channels = (ctx.cfg as Record<string, unknown>)['channels'] as Record<string, unknown> | undefined;
    const section = channels?.[SECTION_KEY] as Record<string, unknown> | undefined;
    const entry = (section?.[ctx.accountId ?? 'default'] ?? section) as Record<string, unknown> | undefined;
    const pairingRequired = entry?.['pairingRequired'] !== false;
    return {
      policy: pairingRequired ? 'pairing' : 'open',
      allowFromPath: `channels.${SECTION_KEY}.${ctx.accountId ?? 'default'}.allowFrom`,
      approveHint: '/allow kakao:<user_id>',
    };
  },
};
