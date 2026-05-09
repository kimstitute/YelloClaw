import { SessionManager } from './session-manager';
import { buildCallbackPayload } from './callback';
import { renderForKakao } from './renderers';
import { defaultPolicy, isUserAllowed } from './policy';
import type {
  KakaoSkillPayload,
  YellowClawInboundMessage,
  YellowClawRenderResult,
} from './types';

export * from './types';

export class YellowClawApp {
  private sessionManager = new SessionManager();

  handleInbound(payload: KakaoSkillPayload): YellowClawInboundMessage {
    const userId = payload.userRequest.user?.id ?? 'unknown';
    const session = this.sessionManager.getOrCreateSession(userId, 'kakao');
    this.sessionManager.updateSessionState(userId, 'kakao', {
      lastUtterance: payload.userRequest.utterance,
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
    return isUserAllowed(userId, defaultPolicy);
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
