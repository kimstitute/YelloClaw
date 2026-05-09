import type { KakaoCallbackRequest, YellowClawRenderResult } from './types';

export function buildCallbackPayload(
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
