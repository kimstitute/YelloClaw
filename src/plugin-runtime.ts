import { YellowClawApp } from './index';
import { buildCallbackPayload, postKakaoCallback } from './callback';
import type {
  KakaoSkillPayload,
  KakaoSkillResponse,
  YellowClawRenderResult,
} from './types';

const app = new YellowClawApp();

export function getApp(): YellowClawApp {
  return app;
}

export function buildImmediateResponse(
  inboundText: string,
): KakaoSkillResponse {
  return {
    version: '2.0',
    useCallback: true,
    template: {
      outputs: [
        {
          textCard: {
            title: inboundText || '잠시만 기다려줘.',
          },
        },
      ],
    },
  };
}

export async function handleSkillRequest(
  payload: KakaoSkillPayload,
): Promise<KakaoSkillResponse> {
  const inbound = app.handleInbound(payload);
  return buildImmediateResponse(inbound.text);
}

export async function handleCallbackFlow(
  payload: KakaoSkillPayload,
  result: YellowClawRenderResult,
): Promise<Response | undefined> {
  const callbackUrl = payload.userRequest.callbackUrl;
  if (!callbackUrl) return undefined;
  const callbackPayload = buildCallbackPayload(result);
  return postKakaoCallback(callbackUrl, callbackPayload);
}
