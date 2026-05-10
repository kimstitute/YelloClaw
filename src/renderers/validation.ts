import type {
  KakaoBasicCardOutput,
  KakaoListCardOutput,
  KakaoOutput,
  KakaoQuickReply,
  KakaoTextCardOutput,
} from '../types';

export function isValidTextCard(card: KakaoTextCardOutput): boolean {
  const { textCard } = card;
  if (!textCard) return false;

  const hasTitle = textCard.title && textCard.title.trim().length > 0;
  const hasDescription = textCard.description && textCard.description.trim().length > 0;

  if (!hasTitle && !hasDescription) {
    return false;
  }

  const textLength = (textCard.title?.length ?? 0) + (textCard.description?.length ?? 0);
  if (textLength > 1000) {
    return false;
  }

  return true;
}

export function isValidBasicCard(card: KakaoBasicCardOutput): boolean {
  const { basicCard } = card;
  if (!basicCard) return false;
  if (!basicCard.thumbnail) return false;

  const { imageUrl } = basicCard.thumbnail;
  if (!imageUrl) return false;

  const isPlaceholder =
    imageUrl.includes('placehold.co') ||
    imageUrl.includes('via.placeholder.com') ||
    imageUrl.includes('placeholder');

  if (isPlaceholder) {
    return false;
  }

  const hasTitle = basicCard.title && basicCard.title.trim().length > 0;
  const hasDescription = basicCard.description && basicCard.description.trim().length > 0;

  if (!hasTitle && !hasDescription) {
    return false;
  }

  return true;
}

export function isValidListCard(card: KakaoListCardOutput): boolean {
  const { listCard } = card;
  if (!listCard) return false;

  if (!listCard.header || !listCard.header.title || !listCard.items) {
    return false;
  }

  if (listCard.header.title.trim().length === 0) {
    return false;
  }

  if (listCard.items.length === 0) {
    return false;
  }

  for (const item of listCard.items) {
    if (!item.title || item.title.trim().length === 0) {
      return false;
    }

    if (!item.action) {
      return false;
    }

    if (item.action === 'message' && !item.messageText) {
      return false;
    }

    if (item.action === 'block' && !item.blockId) {
      return false;
    }

    if (item.description?.includes('YellowClaw rendered this list item as a placeholder')) {
      return false;
    }
  }

  if (listCard.items.length > 10) {
    return false;
  }

  return true;
}

export function isValidQuickReply(reply: KakaoQuickReply): boolean {
  const label = reply.label.trim();
  if (!label) return false;

  if (reply.action === 'message') {
    return Boolean(reply.messageText && reply.messageText.trim().length > 0);
  }

  if (reply.action === 'block') {
    return Boolean(reply.blockId && reply.blockId.trim().length > 0);
  }

  return false;
}

export function isValidKakaoOutput(card: KakaoOutput): boolean {
  if ('textCard' in card) {
    return isValidTextCard(card as KakaoTextCardOutput);
  }

  if ('basicCard' in card) {
    return isValidBasicCard(card as KakaoBasicCardOutput);
  }

  if ('listCard' in card) {
    return isValidListCard(card as KakaoListCardOutput);
  }

  return false;
}

export function filterValidCards(cards: KakaoOutput[]): KakaoOutput[] {
  return cards.filter(isValidKakaoOutput);
}

export function filterValidQuickReplies(replies: KakaoQuickReply[]): KakaoQuickReply[] {
  return replies.filter(isValidQuickReply);
}
