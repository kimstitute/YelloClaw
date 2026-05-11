import { DEFAULT_FALLBACK_TEXT } from '../constants';
import type {
  KakaoBasicCardOutput,
  KakaoListCardItem,
  KakaoListCardOutput,
  KakaoOutput,
  KakaoQuickReply,
  KakaoSimpleTextOutput,
  KakaoTextCardOutput,
  YellowClawRenderRequest,
  YellowClawRenderResult,
} from '../types';
import { filterValidCards, filterValidQuickReplies } from './validation';

type RenderInput = Pick<YellowClawRenderRequest, 'text' | 'markdown' | 'data'> & {
  format?: 'text' | 'card';
  imageUrl?: string;
  listItems?: Array<{ title: string; description?: string; messageText?: string }>;
};

type PreparedListItem = {
  title: string;
  description?: string;
  action: 'message';
  messageText: string;
};

function normalizeMarkdown(markdown: string): string {
  return markdown
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/`(.+?)`/g, '$1');
}

function resolveText(request: Pick<RenderInput, 'text' | 'markdown'>): string {
  const rawText = request.text ?? (request.markdown ? normalizeMarkdown(request.markdown) : '');
  const trimmed = rawText.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_FALLBACK_TEXT;
}

const SIMPLE_TEXT_LIMIT = 1000;

function toSimpleText(text: string): KakaoSimpleTextOutput {
  return {
    simpleText: {
      text: text.length > SIMPLE_TEXT_LIMIT ? text.slice(0, SIMPLE_TEXT_LIMIT - 1) + '…' : text,
    },
  };
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
  const seenLabels = new Set<string>();

  for (const [label, value] of Object.entries(data)) {
    if (typeof value !== 'string') continue;
    const normalizedLabel = label.trim();
    const normalizedValue = value.trim();
    if (!normalizedLabel || !normalizedValue) continue;
    if (seenLabels.has(normalizedLabel)) continue;

    seenLabels.add(normalizedLabel);

    replies.push({
      label: normalizedLabel,
      action: 'message',
      messageText: normalizedValue,
    });
  }

  return filterValidQuickReplies(replies);
}

function toBasicCard(text: string, imageUrl?: string): KakaoBasicCardOutput | null {
  if (!imageUrl) return null;

  return {
    basicCard: {
      title: text,
      thumbnail: {
        imageUrl,
        fixedRatio: false,
      },
    },
  };
}

function buildListCardItems(
  items?: Array<{ title: string; description?: string; messageText?: string }>,
): PreparedListItem[] {
  if (!items || items.length === 0) return [];

  return items
    .map((item) => {
      const title = item.title?.trim() ?? '';
      if (!title) return null;
      const messageText = item.messageText?.trim() || title;
      return {
        title,
        description: item.description?.trim(),
        action: 'message' as const,
        messageText,
      } as PreparedListItem;
    })
    .filter((item): item is PreparedListItem => item !== null);
}

function toListCard(
  text: string,
  items?: Array<{ title: string; description?: string; messageText?: string }>,
): KakaoListCardOutput | null {
  const listItems: KakaoListCardItem[] = buildListCardItems(items);
  if (listItems.length === 0) return null;

  return {
    listCard: {
      header: {
        title: text,
      },
      items: listItems,
      buttonLayout: 'vertical',
    },
  };
}

export function renderForKakao(request: RenderInput): YellowClawRenderResult {
  const text = resolveText(request);
  const quickReplies = toQuickRepliesFromData(request.data);

  if (request.format === 'card') {
    const cards: (KakaoOutput | null)[] = [
      toTextCard(text),
      toBasicCard(text, request.imageUrl || undefined),
      toListCard(text, request.listItems || undefined),
    ];

    const validCards = filterValidCards(cards.filter((c): c is KakaoOutput => c !== null));

    return {
      text,
      cards: validCards.length > 0 ? validCards : [toTextCard(text)],
      quickReplies,
    };
  }

  return {
    text,
    cards: [toSimpleText(text)],
    quickReplies,
  };
}

export function renderTextOnly(text: string): YellowClawRenderResult {
  const resolved = text.trim().length > 0 ? text : DEFAULT_FALLBACK_TEXT;
  return {
    text: resolved,
    cards: [toSimpleText(resolved)],
    quickReplies: [],
  };
}
