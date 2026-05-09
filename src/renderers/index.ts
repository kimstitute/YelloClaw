import type {
  KakaoBasicCardOutput,
  KakaoButton,
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
  return [];
}

function toBasicCard(text: string): KakaoBasicCardOutput {
  return {
    basicCard: {
      title: text,
      thumbnail: {
        imageUrl: 'https://placehold.co/600x400/png',
      },
    },
  };
}

function buildListCardItems(text: string): KakaoListCardItem[] {
  return [
    {
      title: text,
      description: 'YellowClaw rendered this list item as a placeholder for the MVP.',
    },
  ];
}

export function renderForKakao(
  request: YellowClawRenderRequest,
): YellowClawRenderResult {
  const text = request.text ?? (request.markdown ? normalizeMarkdown(request.markdown) : '');

  if (request.format === 'card') {
    const cards: KakaoOutput[] = [toTextCard(text), toBasicCard(text)];
    return {
      text,
      cards,
      quickReplies: toQuickRepliesFromData(request.data),
    };
  }

  return {
    text,
    cards: [toTextCard(text)],
    quickReplies: toQuickRepliesFromData(request.data),
  };
}
