import type { KakaoCallbackRequest, YellowClawRenderResult } from './types';
import { renderForKakao } from './renderers';

export function buildCallbackPayload(
  result: YellowClawRenderResult,
): KakaoCallbackRequest {
  const rendered = renderForKakao({
    format: result.cards && result.cards.length > 0 ? 'card' : 'text',
    text: result.text,
    data: result.text ? { text: result.text } : undefined,
  });

  return {
    version: '2.0',
    useCallback: true,
    template: {
      outputs: rendered.cards ?? [],
      quickReplies: rendered.quickReplies ?? [],
    },
    data: rendered.text ? { text: rendered.text } : undefined,
  };
}
