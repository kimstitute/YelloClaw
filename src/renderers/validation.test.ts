import { describe, it, expect } from 'vitest';
import {
  isValidTextCard,
  isValidBasicCard,
  isValidListCard,
  isValidQuickReply,
  filterValidCards,
  filterValidQuickReplies,
} from './validation';
import type {
  KakaoTextCardOutput,
  KakaoBasicCardOutput,
  KakaoListCardOutput,
  KakaoQuickReply,
} from '../types';

describe('Rendering Validation', () => {
  describe('isValidTextCard', () => {
    it('should return true for valid text card with title', () => {
      const card: KakaoTextCardOutput = {
        textCard: {
          title: 'Hello World',
        },
      };
      expect(isValidTextCard(card)).toBe(true);
    });

    it('should return true for valid text card with description', () => {
      const card: KakaoTextCardOutput = {
        textCard: {
          description: 'This is a description',
        },
      };
      expect(isValidTextCard(card)).toBe(true);
    });

    it('should return false for text card with empty title and no description', () => {
      const card: KakaoTextCardOutput = {
        textCard: {
          title: '   ',
        },
      };
      expect(isValidTextCard(card)).toBe(false);
    });

    it('should return false for text card with no title or description', () => {
      const card: KakaoTextCardOutput = {
        textCard: {},
      };
      expect(isValidTextCard(card)).toBe(false);
    });

    it('should return false for text card exceeding length limit', () => {
      const longText = 'a'.repeat(1001);
      const card: KakaoTextCardOutput = {
        textCard: {
          title: longText,
        },
      };
      expect(isValidTextCard(card)).toBe(false);
    });
  });

  describe('isValidBasicCard', () => {
    it('should return true for valid basic card with real image URL', () => {
      const card: KakaoBasicCardOutput = {
        basicCard: {
          title: 'Card Title',
          thumbnail: {
            imageUrl: 'https://example.com/image.jpg',
            fixedRatio: false,
          },
        },
      };
      expect(isValidBasicCard(card)).toBe(true);
    });

    it('should return false for basic card with placeholder image URL', () => {
      const card: KakaoBasicCardOutput = {
        basicCard: {
          title: 'Card Title',
          thumbnail: {
            imageUrl: 'https://placehold.co/600x400/png',
            fixedRatio: false,
          },
        },
      };
      expect(isValidBasicCard(card)).toBe(false);
    });

    it('should return false for basic card without thumbnail', () => {
      const card: KakaoBasicCardOutput = {
        basicCard: {
          title: 'Card Title',
          thumbnail: {
            imageUrl: '',
          },
        },
      };
      expect(isValidBasicCard(card)).toBe(false);
    });

    it('should return false for basic card without title or description', () => {
      const card: KakaoBasicCardOutput = {
        basicCard: {
          thumbnail: {
            imageUrl: 'https://example.com/image.jpg',
          },
        },
      };
      expect(isValidBasicCard(card)).toBe(false);
    });
  });

  describe('isValidListCard', () => {
    it('should return true for valid list card with proper items', () => {
      const card: KakaoListCardOutput = {
        listCard: {
          header: {
            title: 'List Header',
          },
          items: [
            {
              title: 'Item 1',
              action: 'message',
              messageText: 'Item 1 clicked',
            },
          ],
        },
      };
      expect(isValidListCard(card)).toBe(true);
    });

    it('should return false for list card without header', () => {
      const card: KakaoListCardOutput = {
        listCard: {
          header: {
            title: '',
          },
          items: [
            {
              title: 'Item 1',
              action: 'message',
              messageText: 'Item 1',
            },
          ],
        },
      };
      expect(isValidListCard(card)).toBe(false);
    });

    it('should return false for list card with empty items', () => {
      const card: KakaoListCardOutput = {
        listCard: {
          header: {
            title: 'Header',
          },
          items: [],
        },
      };
      expect(isValidListCard(card)).toBe(false);
    });

    it('should return false for list card item with action message but no messageText', () => {
      const card: KakaoListCardOutput = {
        listCard: {
          header: {
            title: 'Header',
          },
          items: [
            {
              title: 'Item 1',
              action: 'message',
              // missing messageText
            },
          ],
        },
      };
      expect(isValidListCard(card)).toBe(false);
    });

    it('should return false for list card item with action block but no blockId', () => {
      const card: KakaoListCardOutput = {
        listCard: {
          header: {
            title: 'Header',
          },
          items: [
            {
              title: 'Item 1',
              action: 'block',
              // missing blockId
            },
          ],
        },
      };
      expect(isValidListCard(card)).toBe(false);
    });

    it('should return false for list card with placeholder item description', () => {
      const card: KakaoListCardOutput = {
        listCard: {
          header: {
            title: 'Header',
          },
          items: [
            {
              title: 'Item 1',
              description: 'YellowClaw rendered this list item as a placeholder for the MVP.',
              action: 'message',
              messageText: 'Item 1',
            },
          ],
        },
      };
      expect(isValidListCard(card)).toBe(false);
    });

    it('should return false for list card exceeding item limit', () => {
      const items = Array.from({ length: 11 }, (_, i) => ({
        title: `Item ${i + 1}`,
        action: 'message' as const,
        messageText: `Item ${i + 1}`,
      }));

      const card: KakaoListCardOutput = {
        listCard: {
          header: {
            title: 'Header',
          },
          items,
        },
      };
      expect(isValidListCard(card)).toBe(false);
    });
  });

  describe('isValidQuickReply', () => {
    it('should return true for valid message quick reply', () => {
      const reply: KakaoQuickReply = {
        label: 'Yes',
        action: 'message',
        messageText: 'yes',
      };
      expect(isValidQuickReply(reply)).toBe(true);
    });

    it('should return false for empty label', () => {
      const reply: KakaoQuickReply = {
        label: '   ',
        action: 'message',
        messageText: 'yes',
      };
      expect(isValidQuickReply(reply)).toBe(false);
    });

    it('should return false for missing messageText', () => {
      const reply: KakaoQuickReply = {
        label: 'Yes',
        action: 'message',
        messageText: '   ',
      };
      expect(isValidQuickReply(reply)).toBe(false);
    });
  });

  describe('filterValidQuickReplies', () => {
    it('should filter out invalid quick replies', () => {
      const replies = [
        { label: 'One', action: 'message', messageText: 'one' },
        { label: '   ', action: 'message', messageText: 'two' },
      ];

      const result = filterValidQuickReplies(replies as KakaoQuickReply[]);
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('One');
    });
  });

  describe('filterValidCards', () => {
    it('should filter out invalid cards', () => {
      const cards = [
        {
          textCard: {
            title: 'Valid',
          },
        },
        {
          basicCard: {
            title: 'Invalid',
            thumbnail: {
              imageUrl: 'https://placehold.co/600x400/png',
            },
          },
        },
        {
          textCard: {
            title: 'Also Valid',
          },
        },
      ];

      const result = filterValidCards(cards as any);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('textCard');
      expect(result[1]).toHaveProperty('textCard');
    });
  });
});
