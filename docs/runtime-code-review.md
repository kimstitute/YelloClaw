# Runtime Code Review

## What changed

- `plugin-runtime.ts` now exposes `getApp()` and `buildImmediateResponse()`.
- `entrypoint.ts` now uses the shared runtime helpers instead of duplicating response construction.

## Why this is better

- The runtime module is the shared source of orchestration logic.
- The entrypoint is thinner and delegates response construction.
- Immediate response construction is now centralized.

## Notes

If the entrypoint starts doing more work again, move that logic back into `plugin-runtime.ts`.
