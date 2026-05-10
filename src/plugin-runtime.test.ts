import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { YellowClawRuntime } from './plugin-runtime';
import type { KakaoSkillPayload } from './types';

describe('YellowClawRuntime', () => {
  beforeEach(() => {
    YellowClawRuntime.reset();
  });

  afterEach(() => {
    YellowClawRuntime.reset();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('getApp', () => {
    it('should return singleton instance', () => {
      const app1 = YellowClawRuntime.getApp();
      const app2 = YellowClawRuntime.getApp();

      expect(app1).toBe(app2);
    });

    it('should create new instance after reset', () => {
      const app1 = YellowClawRuntime.getApp();
      YellowClawRuntime.reset();
      const app2 = YellowClawRuntime.getApp();

      expect(app1).not.toBe(app2);
    });
  });

  describe('buildImmediateResponse', () => {
    it('should build immediate response with provided text', () => {
      const response = YellowClawRuntime.buildImmediateResponse('hello world');

      expect(response.version).toBe('2.0');
      expect(response.useCallback).toBe(true);
      expect(response.template.outputs).toHaveLength(1);
      expect(response.template.outputs[0]).toHaveProperty('textCard');
      const output = response.template.outputs[0] as any;
      expect(output.textCard?.title).toBe('hello world');
    });

    it('should build immediate response with default text if empty', () => {
      const response = YellowClawRuntime.buildImmediateResponse('');

      const output = response.template.outputs[0] as any;
      expect(output.textCard?.title).toBe('잠시만 기다려줘.');
    });

    it('should always enable callback mode', () => {
      const response = YellowClawRuntime.buildImmediateResponse('test');

      expect(response.useCallback).toBe(true);
    });
  });

  describe('handleSkillRequest', () => {
    it('should process skill payload and return immediate response', () => {
      const payload: KakaoSkillPayload = {
        userRequest: {
          utterance: 'test message',
          user: {
            id: 'user123',
          },
        },
      };

      const response = YellowClawRuntime.handleSkillRequest(payload);

      expect(response.version).toBe('2.0');
      expect(response.useCallback).toBe(true);
      const output = response.template.outputs[0] as any;
      expect(output.textCard?.title).toBe('test message');
    });

    it('should handle payload without user id', () => {
      const payload: KakaoSkillPayload = {
        userRequest: {
          utterance: 'test message',
        },
      };

      const response = YellowClawRuntime.handleSkillRequest(payload);

      const output = response.template.outputs[0] as any;
      expect(output.textCard?.title).toBe('test message');
    });

    it('should use singleton app instance', () => {
      const app1 = YellowClawRuntime.getApp();

      YellowClawRuntime.handleSkillRequest({
        userRequest: {
          utterance: 'test',
          user: { id: 'user1' },
        },
      });

      const app2 = YellowClawRuntime.getApp();

      expect(app1).toBe(app2);
    });
  });

  describe('handleCallbackFlow', () => {
    it('should return undefined if no callback URL provided', async () => {
      const payload: KakaoSkillPayload = {
        userRequest: {
          utterance: 'test',
        },
      };

      const result = {
        text: 'response',
        cards: [{ textCard: { title: 'response' } }],
      };

      const response = await YellowClawRuntime.handleCallbackFlow(payload, result);

      expect(response).toBeUndefined();
    });

    it('should attempt to post callback if URL provided', async () => {
      const payload: KakaoSkillPayload = {
        userRequest: {
          utterance: 'test',
          callbackUrl: 'https://example.com/callback',
        },
      };

      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', fetchMock);

      const result = {
        text: 'response',
        cards: [{ textCard: { title: 'response' } }],
      };

      await YellowClawRuntime.handleCallbackFlow(payload, result);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });


  describe('relay inbox', () => {
    it('should map relay messages to inbound messages', async () => {
      YellowClawRuntime.configure({
        kakao: {
          enabled: true,
          channelId: 'kakao',
          relayUrl: 'https://relay.example',
          relayToken: 'token-123',
        },
        auth: {
          pairingRequired: true,
          adminUserId: 'admin-1',
        },
        policy: {
          adminOnlyTools: true,
          allowlistOnly: true,
          allowedUsers: [],
        },
      });

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          messages: [
            {
              id: 'msg-1',
              conversationKey: 'kakao:user-1',
              timestamp: 123,
              kakaoPayload: {
                userRequest: {
                  utterance: 'hello',
                  user: { id: 'user-1' },
                },
              },
              normalized: {
                userId: 'user-1',
                text: 'hello',
                channelId: 'kakao',
              },
              callbackUrl: 'https://example.com/callback',
              callbackExpiresAt: 456,
            },
          ],
          hasMore: false,
        }),
      }));

      const inbox = await YellowClawRuntime.pollRelayInbox();
      expect(inbox).toHaveLength(1);
      expect(inbox[0]).toMatchObject({
        channel: 'kakao',
        userId: 'user-1',
        text: 'hello',
        callbackUrl: 'https://example.com/callback',
      });
    });

    it('should process relay inbox through core flow', async () => {
      YellowClawRuntime.configure({
        kakao: {
          enabled: true,
          channelId: 'kakao',
          relayUrl: 'https://relay.example',
          relayToken: 'token-123',
        },
        auth: {
          pairingRequired: true,
          adminUserId: 'admin-1',
        },
        policy: {
          adminOnlyTools: true,
          allowlistOnly: true,
          allowedUsers: [],
        },
      });

      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            messages: [
              {
                id: 'msg-1',
                conversationKey: 'kakao:user-1',
                timestamp: 123,
                kakaoPayload: {
                  userRequest: {
                    utterance: 'hello',
                    user: { id: 'user-1' },
                  },
                },
                normalized: {
                  userId: 'user-1',
                  text: 'hello',
                  channelId: 'kakao',
                },
                callbackUrl: 'https://example.com/callback',
                callbackExpiresAt: 456,
              },
            ],
            hasMore: false,
          }),
        })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, deliveredAt: 1 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ acknowledged: 1 }) });
      vi.stubGlobal('fetch', fetchMock);

      const result = await YellowClawRuntime.processRelayInbox();

      expect(result).toEqual({ processed: 1, messageIds: ['msg-1'] });
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });
});
