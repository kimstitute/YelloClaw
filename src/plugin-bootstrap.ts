import { YellowClawApp } from './index';
import type { KakaoSkillPayload, KakaoSkillResponse } from './types';

export async function handleKakaoSkill(
  payload: KakaoSkillPayload,
): Promise<{ immediate: KakaoSkillResponse }> {
  const app = new YellowClawApp();
  const inbound = app.handleInbound(payload);
  const immediate = {
    version: '2.0' as const,
    useCallback: true as const,
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

  return { immediate };
}
