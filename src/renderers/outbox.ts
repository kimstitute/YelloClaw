import type { OutboxMessage } from '../outbox.js';
import type { KakaoOutput, YellowClawRenderResult } from '../types.js';
import { renderTextOnly } from './index.js';

export function renderOutboxMessages(messages: OutboxMessage[]): YellowClawRenderResult {
  if (messages.length === 0) {
    return renderTextOnly('대기 중인 메시지가 없습니다.');
  }

  const cards: KakaoOutput[] = messages.map((msg) => ({
    textCard: {
      title: msg.title ?? '에이전트 알림',
      description: msg.message,
    },
  }));

  return {
    text: `대기 중인 알림 ${messages.length}건`,
    cards,
    quickReplies: [],
  };
}
