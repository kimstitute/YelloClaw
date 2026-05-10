# Entrypoint Runtime

## Stable API

- `handleSkillRequest(payload)`
- `handleCallbackRequest(payload, result)`
- `bootstrap(config?)`
- `getApp()`

## Internal helper

- `handleCallbackFlow(payload, result)` stays inside `src/plugin-runtime.ts`

## Behavior

- `handleSkillRequest` passes the Kakao payload through the shared runtime
- `handleCallbackRequest` delegates callback delivery to the shared helper
- `callbackUrl` missing means callback delivery is skipped
- `src/callback.ts` builds the Kakao callback envelope from `YellowClawRenderResult`

## Notes

Keep the entrypoint thin and keep callback delivery separate from rendering.
