import { SessionManager } from './session-manager';
import { buildCallbackPayload } from './callback';
import { renderForKakao } from './renderers';
import { defaultPolicy, isUserAllowed } from './policy';
import type {
  KakaoSkillPayload,
  YellowClawInboundMessage,
  YellowClawPolicy,
  YellowClawRenderResult,
} from './types';

export * from './types';

export class YellowClawApp {
  private sessionManager = new SessionManager();
  private policy: YellowClawPolicy;

  constructor(policy: YellowClawPolicy = defaultPolicy) {
    this.policy = policy;
  }

  setPolicy(policy: YellowClawPolicy): void {
    this.policy = policy;
  }

  handleInbound(payload: KakaoSkillPayload): YellowClawInboundMessage {
    const userId = payload.userRequest.user?.id ?? 'unknown';
    this.sessionManager.getOrCreateSession(userId, 'kakao');
    this.sessionManager.updateSessionState(userId, 'kakao', {
      lastUtterance: payload.userRequest.utterance,
      allowed: this.canAccess(userId),
    });

    return {
      channel: 'kakao',
      userId,
      text: payload.userRequest.utterance,
      raw: payload,
      callbackUrl: payload.userRequest.callbackUrl,
    };
  }

  canAccess(userId: string): boolean {
    return isUserAllowed(userId, this.policy);
  }

  render(result: YellowClawRenderResult) {
    return renderForKakao({
      format: result.cards && result.cards.length > 0 ? 'card' : 'text',
      markdown: result.text,
      text: result.text,
      data: result.text ? { text: result.text } : undefined,
    });
  }

  buildCallback(result: YellowClawRenderResult) {
    return buildCallbackPayload(result);
  }
}
