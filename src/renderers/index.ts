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
import { filterValidCards } from './validation';

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

/**
 * Creates a basicCard from text and optional image URL.
 * Returns the card only if a valid image URL is provided.
 */
function toBasicCard(text: string, imageUrl?: string): KakaoBasicCardOutput | null {
  // MVP: Skip basicCard if no real image URL provided
  if (!imageUrl) {
    return null;
  }

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

/**
 * Creates list card items from data or falls back to a simple text-based item.
 */
function buildListCardItems(
  text: string,
  items?: Array<{ title: string; description?: string; messageText?: string }>,
): KakaoListCardItem[] {
  if (!items || items.length === 0) {
    // Return null to indicate invalid list card, not a placeholder
    return [];
  }

  return items.map((item) => ({
    title: item.title,
    description: item.description,
    action: 'message',
    messageText: item.messageText || item.title,
  }));
}

/**
 * Creates a listCard from text and optional item data.
 * Returns the card only if valid items are provided.
 */
function toListCard(
  text: string,
  items?: Array<{ title: string; description?: string; messageText?: string }>,
): KakaoListCardOutput | null {
  const listItems = buildListCardItems(text, items);

  // Skip listCard if no valid items
  if (listItems.length === 0) {
    return null;
  }

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

export interface YellowClawRenderRequestExtended extends YellowClawRenderRequest {
  imageUrl?: string;
  listItems?: Array<{ title: string; description?: string; messageText?: string }>;
}

/**
 * Renders content for Kakao, ensuring all outputs conform to schema.
 *
 * - Text mode: Returns only a text card
 * - Card mode: Returns text card + optional basicCard (if imageUrl provided) + optional listCard (if items provided)
 * - All cards are validated; invalid cards are filtered out
 */
export function renderForKakao(
  request: YellowClawRenderRequestExtended,
): YellowClawRenderResult {
  const text = request.text ?? (request.markdown ? normalizeMarkdown(request.markdown) : '');
  const quickReplies = toQuickRepliesFromData(request.data);

  if (request.format === 'card') {
    const cards: (KakaoOutput | null)[] = [
      toTextCard(text),
      toBasicCard(text, request.imageUrl || undefined),
      toListCard(text, request.listItems || undefined),
    ];

    // Filter out null and invalid cards
    const validCards = filterValidCards(cards.filter((c): c is KakaoOutput => c !== null));

    return {
      text,
      cards: validCards.length > 0 ? validCards : [toTextCard(text)], // Fallback to text card
      quickReplies,
    };
  }

  // Text mode: Always return at least a text card
  return {
    text,
    cards: [toTextCard(text)],
    quickReplies,
  };
}

/**
 * Renders plain text only, suitable for fallback cases.
 */
export function renderTextOnly(text: string): YellowClawRenderResult {
  return {
    text,
    cards: [toTextCard(text)],
    quickReplies: [],
  };
}
