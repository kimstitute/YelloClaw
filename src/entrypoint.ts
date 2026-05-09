import { buildImmediateResponse, getApp, handleCallbackFlow } from './plugin-runtime';
import type { KakaoSkillPayload, KakaoSkillResponse, YellowClawRenderResult } from './types';

const app = getApp();

export async function handleSkillRequest(
  payload: KakaoSkillPayload,
): Promise<KakaoSkillResponse> {
  const inbound = app.handleInbound(payload);
  return buildImmediateResponse(inbound.text);
}

export async function handleCallbackRequest(
  payload: KakaoSkillPayload,
  result: YellowClawRenderResult,
) {
  return handleCallbackFlow(payload, result);
}

export { getApp };
