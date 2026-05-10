# Minimum MVP Call Chain

## Goal

This document describes the smallest end-to-end chain that should work before expanding YellowClaw.

## MVP chain

1. Kakao sends `SkillPayload`
2. Entrypoint receives payload
3. App creates inbound message and updates session state
4. Policy checks determine whether the user can proceed
5. Renderer creates a Kakao-ready response
6. Entrypoint returns immediate callback-mode ACK
7. Callback payload is built
8. Callback payload is POSTed to `callbackUrl`
9. Kakao returns a callback delivery result

## Contract notes

- Policy checks happen before rendering decisions are finalized.
- The immediate ACK is not the final user-facing response.
- The callback payload carries the final rendered message.
- Core flow should remain valid even when relay is absent.

## MVP invariants

- One user, one session scope
- Allowlist-only access
- Admin-only sensitive tools
- Plain text fallback always available
- Card response support included in the MVP

## Notes

- This chain is intentionally minimal.
- Any additional tool execution should happen after this chain is stable.
