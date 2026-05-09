import type {
  KakaoBasicCardOutput,
  KakaoListCardItem,
  KakaoListCardOutput,
  KakaoOutput,
  KakaoQuickReply,
  KakaoTextCardOutput,
  YellowClawRenderRequest,
  YellowClawRenderResult,
} from '../types';

function normalizeMarkdown(markdown: string): string {
  return markdown
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/`(.+?)`/g, '$1');
}

function toTextCard(text: string): KakaoTextCardOutput {
  return {
    textCard: {
      title: text,
    },
  };
}

function toQuickRepliesFromData(data?: Record<string, unknown>): KakaoQuickReply[] {
  if (!data) return [];

  const replies: KakaoQuickReply[] = [];
  for (const [label, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      replies.push({
        label,
        action: 'message',
        messageText: value,
      });
    }
  }

  return replies;
}

function toBasicCard(text: string): KakaoBasicCardOutput {
  return {
    basicCard: {
      title: text,
      thumbnail: {
        imageUrl: 'https://placehold.co/600x400/png',
        fixedRatio: false,
      },
    },
  };
}

function buildListCardItems(text: string): KakaoListCardItem[] {
  return [
    {
      title: text,
      description: 'YellowClaw rendered this list item as a placeholder for the MVP.',
      action: 'message',
      messageText: text,
    },
  ];
}

function toListCard(text: string): KakaoListCardOutput {
  return {
    listCard: {
      header: {
        title: text,
      },
      items: buildListCardItems(text),
      buttonLayout: 'vertical',
    },
  };
}

export function renderForKakao(
  request: YellowClawRenderRequest,
): YellowClawRenderResult {
  const text = request.text ?? (request.markdown ? normalizeMarkdown(request.markdown) : '');
  const quickReplies = toQuickRepliesFromData(request.data);

  if (request.format === 'card') {
    const cards: KakaoOutput[] = [toTextCard(text), toBasicCard(text), toListCard(text)];
    return {
      text,
      cards,
      quickReplies,
    };
  }

  return {
    text,
    cards: [toTextCard(text)],
    quickReplies,
  };
}
