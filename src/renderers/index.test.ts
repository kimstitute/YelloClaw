import { describe, expect, it } from 'vitest';
import { DEFAULT_FALLBACK_TEXT } from '../constants';
import { renderForKakao, renderTextOnly } from './index';

describe('renderForKakao', () => {
  it('uses fallback text for empty input', () => {
    const result = renderForKakao({});

    expect(result.text).toBe(DEFAULT_FALLBACK_TEXT);
    expect(result.quickReplies).toEqual([]);
    expect(result.cards).toHaveLength(1);
    const output = result.cards?.[0] as any;
    expect(output.textCard?.title).toBe(DEFAULT_FALLBACK_TEXT);
  });

  it('returns only a text card when card mode has no extra valid cards', () => {
    const result = renderForKakao({ format: 'card', markdown: 'test' });

    expect(result.text).toBe('test');
    expect(result.cards).toHaveLength(1);
    const output = result.cards?.[0] as any;
    expect(output.textCard?.title).toBe('test');
  });

  it('filters invalid basic/list cards and keeps text fallback', () => {
    const result = renderForKakao({
      format: 'card',
      text: 'hello',
      imageUrl: 'https://placehold.co/600x400/png',
      listItems: [],
    });

    expect(result.cards).toHaveLength(1);
    const output = result.cards?.[0] as any;
    expect(output.textCard?.title).toBe('hello');
  });

  it('derives quick replies only from non-empty string data values', () => {
    const result = renderForKakao({
      data: {
        first: 'one',
        second: '',
        third: 3,
        '   ': 'skip-me',
      },
    });

    expect(result.quickReplies).toEqual([
      {
        label: 'first',
        action: 'message',
        messageText: 'one',
      },
    ]);
  });
});

describe('renderTextOnly', () => {
  it('uses fallback text when input is empty', () => {
    const result = renderTextOnly('');

    expect(result.text).toBe(DEFAULT_FALLBACK_TEXT);
    expect(result.cards).toHaveLength(1);
  });
});
