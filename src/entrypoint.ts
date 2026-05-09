import { createApp, handleCallbackFlow } from './plugin-runtime';
import type { KakaoSkillPayload, KakaoSkillResponse, YellowClawRenderResult } from './types';

const app = createApp();

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

export async function handleCallbackRequest(
  payload: KakaoSkillPayload,
  result: YellowClawRenderResult,
) {
  return handleCallbackFlow(payload, result);
}
