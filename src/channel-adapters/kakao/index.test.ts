import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  resolveConversationKey,
  toKakaoCallbackRequest,
  toKakaoImmediateResponse,
  toYellowClawInboundMessage,
  postKakaoCallback,
} from './index';
import type { KakaoSkillPayload, YellowClawRenderResult } from '../../types';

describe('kakao channel adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves conversation keys from payload and channel id', () => {
    const payload: KakaoSkillPayload = {
      userRequest: {
        utterance: 'hello',
        user: { id: 'user-1' },
      },
    };

    expect(resolveConversationKey(payload, 'channel-1')).toBe('channel-1:user-1');
  });

  it('maps payload to inbound message', () => {
    const payload: KakaoSkillPayload = {
      userRequest: {
        utterance: 'hello',
        user: { id: 'user-1' },
      },
    };

    expect(toYellowClawInboundMessage(payload)).toMatchObject({
      channel: 'kakao',
      userId: 'user-1',
      text: 'hello',
    });
  });

  it('builds immediate response', () => {
    const response = toKakaoImmediateResponse('hello');
    expect(response.useCallback).toBe(true);
    const output = response.template.outputs[0] as any;
    expect(output.textCard?.title).toBe('hello');
  });

  it('builds callback request', () => {
    const result: YellowClawRenderResult = {
      text: 'response',
      context: { values: [{ name: 'flow', lifeSpan: 1 }] },
      cards: [{ textCard: { title: 'response' } }],
    };

    expect(toKakaoCallbackRequest(result)).toMatchObject({
      version: '2.0',
      useCallback: true,
      context: { values: [{ name: 'flow', lifeSpan: 1 }] },
      data: { text: 'response' },
    });
  });

  it('posts callback to callback url', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    globalThis.fetch = fetchMock as typeof fetch;

    await postKakaoCallback('https://example.com/callback', {
      version: '2.0',
      useCallback: true,
      template: { outputs: [] },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
