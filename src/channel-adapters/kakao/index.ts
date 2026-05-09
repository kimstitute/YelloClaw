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
  return {
    version: '2.0',
    useCallback: true,
    template: {
      outputs: result.cards ?? [],
      quickReplies: result.quickReplies ?? [],
    },
    data: result.text ? { text: result.text } : undefined,
  };
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
