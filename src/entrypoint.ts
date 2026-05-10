import { YellowClawRuntime } from './plugin-runtime';
import { bootstrap as bootstrapRelayAdapter } from './plugin-bootstrap';
import type {
  KakaoSkillPayload,
  KakaoSkillResponse,
  YellowClawPluginConfig,
  YellowClawRenderResult,
} from './types';

/**
 * Public entrypoint for OpenClaw plugin interface.
 * All calls from OpenClaw should go through these functions.
 */
export async function handleSkillRequest(
  payload: KakaoSkillPayload,
): Promise<KakaoSkillResponse> {
  return YellowClawRuntime.handleSkillRequest(payload);
}

export async function handleCallbackRequest(
  payload: KakaoSkillPayload,
  result: YellowClawRenderResult,
): Promise<Response | undefined> {
  return YellowClawRuntime.handleCallbackFlow(payload, result);
}

export async function bootstrap(config?: YellowClawPluginConfig): Promise<void> {
  await bootstrapRelayAdapter(config);
}

export const getApp = YellowClawRuntime.getApp;
