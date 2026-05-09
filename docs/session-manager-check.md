# Session Manager Check

## Expected state

- SessionManager is in-memory for the draft.
- User profiles are keyed by userId.
- Sessions are keyed by channel + userId.
- Session state is merged on update.
- Conversation context can be derived from session records.

## Notes

This document should stay aligned with `src/session-manager.ts` and `docs/app-flow.md`.
