import { YellowClawApp } from './index';
import type { KakaoSkillPayload, KakaoSkillResponse } from './types';

const app = new YellowClawApp();

export async function handleSkillRequest(
  payload: KakaoSkillPayload,
): Promise<KakaoSkillResponse> {
  const inbound = app.handleInbound(payload);
  return {
    version: '2.0',
    useCallback: true,
    template: {
      outputs: [
        {
          textCard: {
            title: inbound.text || '잠시만 기다려줘.',
          },
        },
      ],
    },
  };
}
