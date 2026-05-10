# Entrypoint Runtime Draft

## Purpose

The entrypoint exposes stable functions that a future OpenClaw plugin runtime can call.

## Stable API

- `handleSkillRequest(payload)`
- `handleCallbackRequest(payload, result)`
- `bootstrap(config?)`
- `getApp()`

## Internal runtime helper

- `handleCallbackFlow(payload, result)` remains an internal shared helper on `src/plugin-runtime.ts`
- The entrypoint should not expose callback delivery internals directly

## Behavior

- Instantiates or uses the current YellowClaw app state
- Accepts a Kakao skill payload
- Produces a callback-mode immediate response
- Builds and sends the final callback response when a callback URL is present
- Uses `plugin-runtime.ts` as the shared orchestration source

## Notes

- This is still a draft and may be renamed to match the final OpenClaw plugin runtime contract.
- The callback URL check is explicit so the runtime can safely skip delivery when absent.
