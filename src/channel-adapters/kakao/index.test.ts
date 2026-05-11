import { describe, expect, it } from 'vitest';
import { resolveConversationKey } from './index';
import type { KakaoSkillPayload } from '../../types';

describe('kakao channel adapter', () => {
  it('resolves conversation key from payload and explicit channel id', () => {
    const payload: KakaoSkillPayload = {
      userRequest: { utterance: 'hello', user: { id: 'user-1' } },
    };
    expect(resolveConversationKey(payload, 'channel-1')).toBe('channel-1:user-1');
  });

  it('falls back to block id when channel id is not provided', () => {
    const payload: KakaoSkillPayload = {
      userRequest: { utterance: 'hello', user: { id: 'user-1' }, block: { id: 'block-abc' } },
    };
    expect(resolveConversationKey(payload)).toBe('block-abc:user-1');
  });

  it('falls back to "kakao" when neither channel nor block id is available', () => {
    const payload: KakaoSkillPayload = {
      userRequest: { utterance: 'hello', user: { id: 'user-1' } },
    };
    expect(resolveConversationKey(payload)).toBe('kakao:user-1');
  });

  it('uses "unknown" as user id when user is absent', () => {
    const payload: KakaoSkillPayload = {
      userRequest: { utterance: 'hello' },
    };
    expect(resolveConversationKey(payload, 'ch')).toBe('ch:unknown');
  });
});
