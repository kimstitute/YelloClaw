import type {
  YellowClawAuthState,
  YellowClawConversationContext,
  YellowClawSessionRecord,
  YellowClawUserProfile,
} from './types';

export class SessionManager {
  private sessions = new Map<string, YellowClawSessionRecord>();
  private users = new Map<string, YellowClawUserProfile>();

  getOrCreateUserProfile(userId: string): YellowClawUserProfile {
    const existing = this.users.get(userId);
    if (existing) return existing;
    const created: YellowClawUserProfile = {
      userId,
      role: 'user',
      paired: false,
      allowed: false,
    };
    this.users.set(userId, created);
    return created;
  }

  setUserProfile(profile: YellowClawUserProfile): void {
    this.users.set(profile.userId, profile);
  }

  getAuthState(userId: string): YellowClawAuthState {
    const profile = this.getOrCreateUserProfile(userId);
    return {
      userId,
      role: profile.role,
      paired: profile.paired,
      allowed: profile.allowed,
    };
  }

  getOrCreateSession(
    userId: string,
    channel: 'kakao',
  ): YellowClawSessionRecord {
    const sessionId = `${channel}:${userId}`;
    const existing = this.sessions.get(sessionId);
    if (existing) return existing;
    const now = new Date().toISOString();
    const created: YellowClawSessionRecord = {
      sessionId,
      userId,
      channel,
      createdAt: now,
      updatedAt: now,
      state: {},
    };
    this.sessions.set(sessionId, created);
    return created;
  }

  updateSessionState(
    userId: string,
    channel: 'kakao',
    statePatch: Record<string, unknown>,
  ): YellowClawSessionRecord {
    const session = this.getOrCreateSession(userId, channel);
    const updated: YellowClawSessionRecord = {
      ...session,
      updatedAt: new Date().toISOString(),
      state: {
        ...session.state,
        ...statePatch,
      },
    };
    this.sessions.set(updated.sessionId, updated);
    return updated;
  }

  toConversationContext(session: YellowClawSessionRecord): YellowClawConversationContext {
    return {
      userId: session.userId,
      channel: session.channel,
      sessionId: session.sessionId,
      updatedAt: session.updatedAt,
      ttlSeconds: session.expiresAt ? Math.max(0, Math.floor((Date.parse(session.expiresAt) - Date.now()) / 1000)) : undefined,
      state: session.state,
    };
  }
}
