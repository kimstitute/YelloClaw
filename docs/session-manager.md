# Session Manager Draft

## Purpose

SessionManager is the in-memory storage layer for YellowClaw.

## Responsibilities

- Create and fetch user profiles
- Store auth snapshots as user profile records
- Create and fetch sessions
- Update session state
- Convert session records into conversation context objects
- Use channel + user as the session key for the first version

## Boundary

- SessionManager stores data.
- It does not decide policy.
- `getAuthState()` returns a snapshot of stored profile state, not a policy evaluation.

## Notes

- This is a draft in-memory manager.
- Persistent storage can be added later after the schema is finalized.
- Use channel + user as the session key for the first version.
