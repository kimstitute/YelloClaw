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

  it('derives quick replies only from non-empty string data values and keeps first label wins', () => {
    const result = renderForKakao({
      data: {
        first: 'one',
        second: '',
        third: 3,
        '   ': 'skip-me',
        button: 'shared',
        ' button ': 'ignored',
        other: 'shared',
      },
    });

    expect(result.quickReplies).toEqual([
      {
        label: 'first',
        action: 'message',
        messageText: 'one',
      },
      {
        label: 'button',
        action: 'message',
        messageText: 'shared',
      },
      {
        label: 'other',
        action: 'message',
        messageText: 'shared',
      },
    ]);
  });

  it('keeps quick replies in card mode too', () => {
    const result = renderForKakao({
      format: 'card',
      text: 'hello',
      data: {
        yes: 'yes',
      },
    });

    expect(result.quickReplies).toEqual([
      {
        label: 'yes',
        action: 'message',
        messageText: 'yes',
      },
    ]);
  });
});

describe('renderTextOnly', () => {
  it('uses fallback text when input is empty', () => {
    const result = renderTextOnly('');

    expect(result.text).toBe(DEFAULT_FALLBACK_TEXT);
    expect(result.cards).toHaveLength(1);
    expect(result.quickReplies).toEqual([]);
  });
});
