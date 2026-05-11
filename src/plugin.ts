import {
  defineChannelPluginEntry,
  createChatChannelPlugin,
} from 'openclaw/plugin-sdk/channel-core';
import type { PluginRuntime } from 'openclaw/plugin-sdk/channel-core';
import { kakaoConfigAdapter, kakaoSetupAdapter } from './channel/config.js';
import { kakaoSecurityAdapter } from './channel/security.js';
import { kakaoOutboundAdapter } from './channel/outbound.js';
import { registerInboundRoute } from './channel/inbound.js';
import { notifyUserToolFactory } from './tools/notify.js';

let runtime: PluginRuntime | undefined;

const kakaoPlugin = createChatChannelPlugin({
  base: {
    id: 'kakao-talkchannel',
    meta: {
      id: 'kakao-talkchannel',
      label: 'KakaoTalk',
      selectionLabel: 'KakaoTalk Channel',
      blurb: 'KakaoTalk 채널 플러그인',
      docsPath: '',
    },
    capabilities: { chatTypes: ['direct'] },
    config: kakaoConfigAdapter,
    setup: kakaoSetupAdapter,
  },
  security: kakaoSecurityAdapter,
  outbound: kakaoOutboundAdapter,
});

export default defineChannelPluginEntry({
  id: 'yellow-claw',
  name: 'YellowClaw - KakaoTalk',
  description: 'KakaoTalk channel plugin for OpenClaw',
  plugin: kakaoPlugin,
  setRuntime: (rt) => {
    runtime = rt;
  },
  registerFull: (api) => {
    registerInboundRoute(api, () => runtime);
    api.registerTool(notifyUserToolFactory);
  },
});
