# Session Manager TTL & Expiration

## Purpose

Implement automatic session expiration and TTL (Time-To-Live) management in SessionManager.

## Current State

### What's Missing

- `YellowClawSessionRecord` has `expiresAt` field, but SessionManager never checks it
- Zombie sessions can persist indefinitely in memory
- No automatic cleanup mechanism
- `toConversationContext()` calculates TTL but doesn't prevent access to expired sessions

### What Exists

- Session creation with timestamps (`createdAt`, `updatedAt`)
- Session state merge on update
- Conversation context conversion (with TTL calculation)

## MVP Requirements

### 1. Session TTL Configuration

Each session should have a configurable TTL:

```typescript
interface YellowClawSessionRecord {
  sessionId: string;
  userId: string;
  channel: ChannelName;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;      // Explicit expiration time
  ttlSeconds?: number;     // OR: TTL duration
  state: Record<string, unknown>;
}
```

### 2. SessionManager Responsibilities

- **On access:** Check if session is expired; return fresh or null
- **On update:** Refresh `expiresAt` or set new TTL
- **On expiration:** Remove from memory or mark as stale
- **Optional:** Implement cleanup task for periodic cleanup

### 3. Expiration Check Logic

```
At every getOrCreateSession() call:
1. Lookup session by ID
2. If session exists:
   a. Check if expiresAt < now()
   b. If expired: remove from map, treat as not found
   c. If not expired: return session
3. If not found or expired: create new session
```

### 4. TTL Refresh Policy

- Session TTL should reset on every user activity (utterance)
- Default TTL: 1 hour (3600 seconds) for MVP
- Admin sessions: optional extended TTL

### Example Flow

```
User sends message at T=0
  → Session created with expiresAt = T+3600
User sends another message at T=600
  → Session TTL is refreshed: expiresAt = T+4200
User doesn't send anything; T=3700 passes
  → Session is considered expired
Next user activity triggers a new session
```

## Implementation Plan

1. Add `expiresAt` setter in SessionManager
2. Add expiration check in `getOrCreateSession()`
3. Add session cleanup method (optional periodic task)
4. Update `updateSessionState()` to refresh TTL
5. Add tests for expiration scenarios
6. Update docs: app-flow, session-manager-check, and entrypoint guide

## Schema Notes

- Use ISO string for `expiresAt` (matches `createdAt`, `updatedAt` format)
- Default TTL: 3600 seconds (1 hour)
- Admin override: configurable per user or globally
- Store TTL as timestamp, not duration, for easier comparison

## Security Notes

- Don't expose `expiresAt` to frontend; include only in `toConversationContext()` as calculated TTL
- Cleanup should run periodically to avoid memory bloat
- Clear sessions on auth failures

## Next Steps

1. Update `src/session-manager.ts` with expiration logic
2. Create `src/session-manager.test.ts` with expiration tests
3. Update `src/types.ts` if needed (clarify `expiresAt` and `ttlSeconds`)
4. Document TTL configuration in `docs/plugin-config.md`
