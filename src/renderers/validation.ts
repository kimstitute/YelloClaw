import type {
  KakaoBasicCardOutput,
  KakaoListCardOutput,
  KakaoOutput,
  KakaoTextCardOutput,
} from '../types';

/**
 * Validates a textCard against Kakao schema requirements.
 * Returns true if valid, false otherwise.
 */
export function isValidTextCard(card: KakaoTextCardOutput): boolean {
  const { textCard } = card;
  if (!textCard) return false;

  // Must have title or description
  const hasTitle = textCard.title && textCard.title.trim().length > 0;
  const hasDescription = textCard.description && textCard.description.trim().length > 0;

  if (!hasTitle && !hasDescription) {
    return false;
  }

  // Text length check (~1000 chars recommended for MVP)
  const textLength = (textCard.title?.length ?? 0) + (textCard.description?.length ?? 0);
  if (textLength > 1000) {
    return false;
  }

  return true;
}

/**
 * Validates a basicCard against Kakao schema requirements.
 * Returns true if valid, false otherwise.
 */
export function isValidBasicCard(card: KakaoBasicCardOutput): boolean {
  const { basicCard } = card;
  if (!basicCard) return false;

  // thumbnail is required
  if (!basicCard.thumbnail) return false;

  // imageUrl must be present and not a placeholder
  const { imageUrl } = basicCard.thumbnail;
  if (!imageUrl) return false;

  // Reject placeholder URLs for MVP
  const isPlaceholder =
    imageUrl.includes('placehold.co') ||
    imageUrl.includes('via.placeholder.com') ||
    imageUrl.includes('placeholder');

  if (isPlaceholder) {
    return false;
  }

  // Must have title or description
  const hasTitle = basicCard.title && basicCard.title.trim().length > 0;
  const hasDescription = basicCard.description && basicCard.description.trim().length > 0;

  if (!hasTitle && !hasDescription) {
    return false;
  }

  return true;
}

/**
 * Validates a listCard against Kakao schema requirements.
 * Returns true if valid, false otherwise.
 */
export function isValidListCard(card: KakaoListCardOutput): boolean {
  const { listCard } = card;
  if (!listCard) return false;

  // header and items are required
  if (!listCard.header || !listCard.header.title || !listCard.items) {
    return false;
  }

  // header.title must not be empty
  if (listCard.header.title.trim().length === 0) {
    return false;
  }

  // items must not be empty
  if (listCard.items.length === 0) {
    return false;
  }

  // Check each item
  for (const item of listCard.items) {
    // title is required
    if (!item.title || item.title.trim().length === 0) {
      return false;
    }

    // action must be set
    if (!item.action) {
      return false;
    }

    // action: "message" must have messageText
    if (item.action === 'message' && !item.messageText) {
      return false;
    }

    // action: "block" must have blockId
    if (item.action === 'block' && !item.blockId) {
      return false;
    }

    // Check for placeholder description (MVP-specific)
    if (item.description?.includes('YellowClaw rendered this list item as a placeholder')) {
      return false;
    }
  }

  // Items should not exceed ~10 items (Kakao limit)
  if (listCard.items.length > 10) {
    return false;
  }

  return true;
}

/**
 * Validates any KakaoOutput card.
 * Returns true if the card is valid for its type.
 */
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

/**
 * Filters out invalid cards from a list.
 * Returns only cards that pass validation.
 */
export function filterValidCards(cards: KakaoOutput[]): KakaoOutput[] {
  return cards.filter(isValidKakaoOutput);
}
