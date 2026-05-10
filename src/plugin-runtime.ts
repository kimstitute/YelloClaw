import { YellowClawApp } from './index';
import {
  toKakaoImmediateResponse,
} from './channel-adapters/kakao';
import { buildCallbackPayload, postKakaoCallback } from './callback';
import type {
  KakaoSkillPayload,
  KakaoSkillResponse,
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

  static getApp(): YellowClawApp {
    if (!this.instance) {
      this.instance = new YellowClawApp();
    }
    return this.instance;
  }

  static reset(): void {
    this.instance = null;
  }

  static buildImmediateResponse(inboundText: string): KakaoSkillResponse {
    return toKakaoImmediateResponse(inboundText || '잠시만 기다려줘.');
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
