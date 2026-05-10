import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SessionManager } from './session-manager';

describe('SessionManager', () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager(10); // 10 seconds TTL for testing
  });

  describe('getOrCreateSession', () => {
    it('should create a new session with expiration time', () => {
      const session = manager.getOrCreateSession('user123', 'kakao');

      expect(session).toMatchObject({
        sessionId: 'kakao:user123',
        userId: 'user123',
        channel: 'kakao',
        state: {},
      });
      expect(session.createdAt).toBeDefined();
      expect(session.updatedAt).toBeDefined();
      expect(session.expiresAt).toBeDefined();
    });

    it('should return existing session if not expired', () => {
      const session1 = manager.getOrCreateSession('user123', 'kakao');
      const session2 = manager.getOrCreateSession('user123', 'kakao');

      expect(session1.sessionId).toBe(session2.sessionId);
      expect(session1.createdAt).toBe(session2.createdAt);
    });

    it('should create new session if previous one expired', () => {
      // Mock Date.now to simulate time passage
      let currentTime = 0;

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

      // Create session at T=0
      const session1 = manager.getOrCreateSession('user123', 'kakao');
      const createdAt1 = session1.createdAt;

      // Advance time by 15 seconds (past the 10-second TTL)
      currentTime = 15000;

      // Next call should create a new session
      const session2 = manager.getOrCreateSession('user123', 'kakao');

      expect(session1.createdAt).toBe(createdAt1);
      expect(session2.createdAt).not.toBe(createdAt1);
      // Verify new session was created at the mocked time
      expect(session2.createdAt).toBeDefined();

      vi.restoreAllMocks();
    });
  });

  describe('updateSessionState', () => {
    it('should merge state and refresh TTL', async () => {
      const session1 = manager.getOrCreateSession('user123', 'kakao');
      const updatedAt1 = session1.updatedAt;
      const expiresAt1 = session1.expiresAt;

      // Add a small delay to ensure timestamp differs
      await new Promise(resolve => setTimeout(resolve, 10));

      // Update state
      const updated = manager.updateSessionState('user123', 'kakao', {
        lastUtterance: 'hello',
      });

      expect(updated.state).toEqual({
        lastUtterance: 'hello',
      });
      expect(updated.updatedAt).not.toBe(updatedAt1);
      expect(updated.expiresAt).not.toBe(expiresAt1); // TTL refreshed
    });

    it('should merge state without overwriting existing fields', () => {
      manager.updateSessionState('user123', 'kakao', {
        field1: 'value1',
      });

      const updated = manager.updateSessionState('user123', 'kakao', {
        field2: 'value2',
      });

      expect(updated.state).toEqual({
        field1: 'value1',
        field2: 'value2',
      });
    });
  });

  describe('toConversationContext', () => {
    it('should convert session to conversation context with TTL', () => {
      const session = manager.getOrCreateSession('user123', 'kakao');
      const context = manager.toConversationContext(session);

      expect(context).toMatchObject({
        userId: 'user123',
        channel: 'kakao',
        sessionId: 'kakao:user123',
        state: {},
      });
      expect(context.ttlSeconds).toBeDefined();
      expect(context.ttlSeconds).toBeGreaterThan(0);
      expect(context.ttlSeconds).toBeLessThanOrEqual(10);
    });

    it('should calculate remaining TTL correctly', () => {
      const originalNow = Date.now;
      let currentTime = 0;

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

      const session = manager.getOrCreateSession('user123', 'kakao');

      // Advance time by 3 seconds
      currentTime = 3000;

      const context = manager.toConversationContext(session);

      expect(context.ttlSeconds).toBeLessThanOrEqual(7); // ~7 seconds left
      expect(context.ttlSeconds).toBeGreaterThan(6); // At least 6 seconds

      vi.restoreAllMocks();
    });
  });

  describe('clearSession', () => {
    it('should remove session from memory', () => {
      manager.getOrCreateSession('user123', 'kakao');
      manager.clearSession('user123', 'kakao');

      const newSession = manager.getOrCreateSession('user123', 'kakao');
      expect(newSession.state).toEqual({});
    });
  });

  it('should recreate a fresh session after expiration without preserving old state', () => {
    let currentTime = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

    manager.updateSessionState('user123', 'kakao', {
      lastUtterance: 'hello',
    });

    currentTime = 11000;
    const fresh = manager.getOrCreateSession('user123', 'kakao');

    expect(fresh.state).toEqual({});
    expect(fresh.createdAt).toBeDefined();

    vi.restoreAllMocks();
  });

  it('should calculate ttlSeconds as floor seconds remaining', () => {
    let currentTime = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

    const session = manager.getOrCreateSession('user123', 'kakao');
    currentTime = 2500;

    const context = manager.toConversationContext(session);
    expect(context.ttlSeconds).toBe(7);

    vi.restoreAllMocks();
  });

  describe('cleanupExpiredSessions', () => {
    it('should remove expired sessions and return count', () => {
      const originalNow = Date.now;
      let currentTime = 0;

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

      // Create 3 sessions at T=0
      manager.getOrCreateSession('user1', 'kakao');
      manager.getOrCreateSession('user2', 'kakao');
      manager.getOrCreateSession('user3', 'kakao');

      expect(manager.getSessionCount()).toBe(3);

      // Advance time past TTL
      currentTime = 15000;

      const removed = manager.cleanupExpiredSessions();

      expect(removed).toBe(3);
      expect(manager.getSessionCount()).toBe(0);

      vi.restoreAllMocks();
    });

    it('should only remove expired sessions', () => {
      const originalNow = Date.now;
      let currentTime = 0;

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

      // Create session at T=0
      manager.getOrCreateSession('user1', 'kakao');

      // Advance time by 5 seconds (before 10-second TTL)
      currentTime = 5000;

      // Create another session at T=5
      manager.getOrCreateSession('user2', 'kakao');

      // Advance time to T=12 (user1 expired, user2 not yet)
      currentTime = 12000;

      const removed = manager.cleanupExpiredSessions();

      expect(removed).toBe(1);
      expect(manager.getSessionCount()).toBe(1);

      vi.restoreAllMocks();
    });
  });

  describe('getAuthState', () => {
    it('should return auth state for user', () => {
      const state = manager.getAuthState('user123');

      expect(state.userId).toBe('user123');
      expect(state.role).toBe('user');
      expect(state.paired).toBe(false);
      expect(state.allowed).toBe(false);
    });
  });

  it('should reflect stored profile changes in auth snapshots', () => {
    manager.setUserProfile({
      userId: 'user123',
      role: 'admin',
      paired: true,
      allowed: true,
    });

    expect(manager.getAuthState('user123')).toMatchObject({
      userId: 'user123',
      role: 'admin',
      paired: true,
      allowed: true,
    });
  });

  describe('setUserProfile', () => {
    it('should update user profile', () => {
      manager.setUserProfile({
        userId: 'user123',
        role: 'admin',
        paired: true,
        allowed: true,
      });

      const state = manager.getAuthState('user123');

      expect(state.role).toBe('admin');
      expect(state.paired).toBe(true);
      expect(state.allowed).toBe(true);
    });
  });
});
