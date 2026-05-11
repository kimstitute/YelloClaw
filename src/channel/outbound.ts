import type { ChannelOutboundAdapter } from 'openclaw/plugin-sdk/core';
import { renderTextOnly } from '../renderers/index.js';
import { buildCallbackPayload, postKakaoCallback } from '../callback.js';

// callbackUrl bridge: inbound handler stores per-userId, sendText consumes once
export const callbackUrlMap = new Map<string, string>();

export const kakaoOutboundAdapter: ChannelOutboundAdapter = {
  deliveryMode: 'direct',
  sendText: async (ctx) => {
    const callbackUrl = callbackUrlMap.get(ctx.to);
    if (!callbackUrl) throw new Error(`[outbound] no callbackUrl for userId=${ctx.to}`);
    callbackUrlMap.delete(ctx.to);

    const rendered = renderTextOnly(ctx.text);
    const payload = buildCallbackPayload(rendered);
    const res = await postKakaoCallback(callbackUrl, payload);
    if (!res.ok) throw new Error(`[outbound] kakao callback failed: HTTP ${res.status}`);

    return {
      channel: 'kakao-talkchannel',
      messageId: `kakao-${Date.now()}`,
    };
  },
};
