import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { buildCallbackPayload, postKakaoCallback } from './callback';

describe('callback', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('builds a Kakao callback payload from render result', () => {
    const payload = buildCallbackPayload({
      text: 'hello',
      cards: [{ textCard: { title: 'hello' } }],
      quickReplies: [{ label: 'Yes', action: 'message', messageText: 'yes' }],
    });

    expect(payload).toEqual({
      version: '2.0',
      useCallback: true,
      template: {
        outputs: [{ textCard: { title: 'hello' } }],
        quickReplies: [{ label: 'Yes', action: 'message', messageText: 'yes' }],
      },
      data: { text: 'hello' },
    });
    expect(Object.keys(payload).sort()).toEqual(['data', 'template', 'useCallback', 'version']);
    expect(Object.keys(payload.template).sort()).toEqual(['outputs', 'quickReplies']);
  });

  it('posts the callback payload to the callback url', async () => {
    const response = new Response('ok', { status: 200 });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);

    const request = buildCallbackPayload({ text: 'hello', cards: [] });
    const result = await postKakaoCallback('https://example.com/callback', request);

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/callback', expect.objectContaining({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    }));
    expect(result).toBe(response);
  });
});
