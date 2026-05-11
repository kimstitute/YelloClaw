import { buildCallbackPayload } from '../../callback';
import type {
  KakaoCallbackRequest,
  KakaoSkillPayload,
  KakaoSkillResponse,
  YellowClawInboundMessage,
  YellowClawRenderResult,
} from '../../types';

export function toYellowClawInboundMessage(
  payload: KakaoSkillPayload,
): YellowClawInboundMessage {
  const userId = payload.userRequest.user?.id ?? 'unknown';
  return {
    channel: 'kakao',
    userId,
    text: payload.userRequest.utterance,
    raw: payload,
    callbackUrl: payload.userRequest.callbackUrl,
  };
}

export function resolveConversationKey(
  payload: KakaoSkillPayload,
  channelId?: string,
): string {
  const userId = payload.userRequest.user?.id ?? 'unknown';
  const resolvedChannelId = channelId ?? payload.userRequest.block?.id ?? 'kakao';
  return `${resolvedChannelId}:${userId}`;
}

export function toKakaoImmediateResponse(text: string): KakaoSkillResponse {
  return {
    version: '2.0',
    useCallback: true,
    template: {
      outputs: [
        {
          textCard: {
            title: text,
          },
        },
      ],
    },
  };
}

export function toKakaoCallbackRequest(
  result: YellowClawRenderResult,
): KakaoCallbackRequest {
  return buildCallbackPayload(result);
}

export async function postKakaoCallback(
  callbackUrl: string,
  request: KakaoCallbackRequest,
): Promise<Response> {
  return fetch(callbackUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(request),
  });
}
