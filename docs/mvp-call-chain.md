# MVP Call Chain

## Goal

Keep the smallest Kakao → YellowClaw → callback loop explicit.

## Chain

1. Kakao sends a `SkillPayload`
2. Entrypoint receives it
3. Runtime gets or creates the app
4. SessionManager stores session/profile snapshots
5. Policy evaluates allowed / paired / role
6. App builds render input
7. Renderer produces text/card + quick replies
8. Runtime builds the callback payload
9. Callback transport posts to `callbackUrl` when present

## Contract

- SessionManager stores state.
- Policy evaluates access.
- Runtime connects storage, policy, rendering, and callback transport.
- Callback delivery is skipped when `callbackUrl` is missing.

## Notes

This is the minimum working flow before richer behavior or persistence.
