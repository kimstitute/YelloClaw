import type { KakaoSkillPayload } from '../../types.js';

export function resolveConversationKey(
  payload: KakaoSkillPayload,
  channelId?: string,
): string {
  const userId = payload.userRequest.user?.id ?? 'unknown';
  const resolvedChannelId = channelId ?? payload.userRequest.block?.id ?? 'kakao';
  return `${resolvedChannelId}:${userId}`;
}
