import type {
  YellowClawAuthState,
  YellowClawConversationContext,
  YellowClawSessionRecord,
  YellowClawUserProfile,
} from './types';

/**
 * Default session TTL in seconds (1 hour for MVP)
 */
const DEFAULT_SESSION_TTL_SECONDS = 3600;

export class SessionManager {
  private sessions = new Map<string, YellowClawSessionRecord>();
  private users = new Map<string, YellowClawUserProfile>();
  private sessionTtlSeconds: number;

  constructor(sessionTtlSeconds: number = DEFAULT_SESSION_TTL_SECONDS) {
    this.sessionTtlSeconds = sessionTtlSeconds;
  }

  /**
   * Checks if a session has expired.
   */
  private isSessionExpired(session: YellowClawSessionRecord): boolean {
    if (!session.expiresAt) {
      // No expiration set; session is valid
      return false;
    }

    const expirationTime = new Date(session.expiresAt).getTime();
    const now = Date.now();

    return now > expirationTime;
  }

  /**
   * Calculates the expiration time for a new or refreshed session.
   */
  private calculateExpiresAt(ttlSeconds: number = this.sessionTtlSeconds): string {
    const expiresAtTime = Date.now() + ttlSeconds * 1000;
    return new Date(expiresAtTime).toISOString();
  }

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

  /**
   * Gets or creates a session, checking for expiration.
   * If the session has expired, it is removed and a new one is created.
   */
  getOrCreateSession(
    userId: string,
    channel: 'kakao',
  ): YellowClawSessionRecord {
    const sessionId = `${channel}:${userId}`;
    const existing = this.sessions.get(sessionId);

    if (existing) {
      // Check if expired
      if (this.isSessionExpired(existing)) {
        // Remove expired session
        this.sessions.delete(sessionId);
      } else {
        // Session is valid; return it
        return existing;
      }
    }

    // Create new session (either didn't exist or was expired)
    const now = new Date(Date.now()).toISOString();
    const created: YellowClawSessionRecord = {
      sessionId,
      userId,
      channel,
      createdAt: now,
      updatedAt: now,
      expiresAt: this.calculateExpiresAt(),
      state: {},
    };
    this.sessions.set(sessionId, created);
    return created;
  }

  /**
   * Updates session state and refreshes the TTL.
   */
  updateSessionState(
    userId: string,
    channel: 'kakao',
    statePatch: Record<string, unknown>,
  ): YellowClawSessionRecord {
    const session = this.getOrCreateSession(userId, channel);

    const updated: YellowClawSessionRecord = {
      ...session,
      updatedAt: new Date(Date.now()).toISOString(),
      expiresAt: this.calculateExpiresAt(), // Refresh TTL on update
      state: {
        ...session.state,
        ...statePatch,
      },
    };

    this.sessions.set(updated.sessionId, updated);
    return updated;
  }

  /**
   * Converts a session record to a conversation context.
   * Includes the remaining TTL for the client.
   */
  toConversationContext(session: YellowClawSessionRecord): YellowClawConversationContext {
    let ttlSeconds: number | undefined;

    if (session.expiresAt) {
      const expirationTime = new Date(session.expiresAt).getTime();
      const now = Date.now();
      ttlSeconds = Math.max(0, Math.floor((expirationTime - now) / 1000));
    }

    return {
      userId: session.userId,
      channel: session.channel,
      sessionId: session.sessionId,
      updatedAt: session.updatedAt,
      ttlSeconds,
      state: session.state,
    };
  }

  /**
   * Explicitly clears a session (e.g., on logout or auth failure).
   */
  clearSession(userId: string, channel: 'kakao'): void {
    const sessionId = `${channel}:${userId}`;
    this.sessions.delete(sessionId);
  }

  /**
   * Cleans up expired sessions from memory.
   * Returns the count of sessions removed.
   */
  cleanupExpiredSessions(): number {
    let removed = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (this.isSessionExpired(session)) {
        this.sessions.delete(sessionId);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Returns the current session count (including potentially expired ones not yet cleaned up).
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Returns the current user count.
   */
  getUserCount(): number {
    return this.users.size;
  }
}
