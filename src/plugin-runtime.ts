import { DEFAULT_FALLBACK_TEXT } from './constants';
import { YellowClawApp } from './index';
import { defaultPolicy } from './policy';
import { toKakaoImmediateResponse } from './channel-adapters/kakao';
import { buildCallbackPayload, postKakaoCallback } from './callback';
import type {
  KakaoSkillPayload,
  KakaoSkillResponse,
  YellowClawPluginConfig,
  YellowClawRenderResult,
} from './types';

/**
 * YellowClawRuntime
 *
 * Singleton orchestration layer for YellowClaw.
 * Manages the app instance and core skill request handlers.
 */
export class YellowClawRuntime {
  private static instance: YellowClawApp | null = null;
  private static policy = defaultPolicy;

  static configure(config?: YellowClawPluginConfig): void {
    if (config?.policy) {
      this.policy = {
        ...config.policy,
        adminUserId: config.auth.adminUserId,
      };
    }
    if (this.instance) {
      this.instance.setPolicy(this.policy);
    }
  }

  static getApp(): YellowClawApp {
    if (!this.instance) {
      this.instance = new YellowClawApp(this.policy);
    }
    return this.instance;
  }

  static reset(): void {
    this.instance = null;
    this.policy = defaultPolicy;
  }

  static buildImmediateResponse(inboundText: string): KakaoSkillResponse {
    return toKakaoImmediateResponse(inboundText || DEFAULT_FALLBACK_TEXT);
  }

  static handleSkillRequest(payload: KakaoSkillPayload): KakaoSkillResponse {
    const app = this.getApp();
    const inbound = app.handleInbound(payload);
    return this.buildImmediateResponse(inbound.text);
  }

  static async handleCallbackFlow(
    payload: KakaoSkillPayload,
    result: YellowClawRenderResult,
  ): Promise<Response | undefined> {
    const callbackUrl = payload.userRequest.callbackUrl;
    if (!callbackUrl) return undefined;

    const callbackPayload = buildCallbackPayload(result);
    return postKakaoCallback(callbackUrl, callbackPayload);
  }
}
