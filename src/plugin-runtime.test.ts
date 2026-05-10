import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { YellowClawRuntime } from './plugin-runtime';
import type { KakaoSkillPayload } from './types';

describe('YellowClawRuntime', () => {
  beforeEach(() => {
    YellowClawRuntime.reset();
  });

  afterEach(() => {
    YellowClawRuntime.reset();
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
  });

  describe('handleSkillRequest', () => {
    it('should process skill payload and return immediate response', () => {
      const payload: KakaoSkillPayload = {
        userRequest: {
          utterance: 'test message',
          user: { id: 'user123' },
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
  });

  describe('handleCallbackFlow', () => {
    it('should return undefined if no callback URL provided', async () => {
      const payload: KakaoSkillPayload = {
        userRequest: { utterance: 'test' },
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
      globalThis.fetch = fetchMock as typeof fetch;

      const result = {
        text: 'response',
        cards: [{ textCard: { title: 'response' } }],
      };

      await YellowClawRuntime.handleCallbackFlow(payload, result);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
