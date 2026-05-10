# Plugin Entrypoint

## Purpose

Define the stable public surface OpenClaw loads for YellowClaw.

## Public surface

- `handleSkillRequest(payload)`
- `handleCallbackRequest(payload, result)`
- `bootstrap(config?)`
- `getApp()`

## Responsibilities

- Accept Kakao skill payloads
- Return the immediate callback-mode response
- Delegate callback delivery to the shared runtime helper
- Keep relay and other optional adapter concerns outside the public surface

## Related files

- `src/entrypoint.ts`
- `src/plugin-runtime.ts`
- `src/plugin-bootstrap.ts`
- `src/callback.ts`

## Notes

The entrypoint should stay thin and stable.
