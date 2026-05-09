# Session Manager Draft

## Purpose

SessionManager is responsible for in-memory state for YellowClaw while the system is still being designed.

## Responsibilities

- Create and fetch user profiles
- Store auth state
- Create and fetch sessions
- Update session state
- Convert session records into conversation context objects

## Notes

- This is a draft in-memory manager.
- Persistent storage can be added later after the schema is finalized.
- Use channel + user as the session key for the first version.
