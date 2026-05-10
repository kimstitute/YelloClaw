# Checkpoint Status

## What is aligned now

- README reflects the current MVP and runtime draft structure.
- The runtime contract is split between `plugin-runtime.ts` and `entrypoint.ts`.
- The app orchestration layer, session manager, policy, callback, and rendering layers are documented.
- The Kakao payload / response contracts are documented.
- Example payloads and MVP guides are documented.
- The shared orchestration surface is clearly `plugin-runtime.ts`.
- The public handler surface is clearly `entrypoint.ts`.
- The optional relay adapter is isolated under `src/adapters/relay.ts`.
- The stable entrypoint surface is now explicitly `handleSkillRequest`, `handleCallbackRequest`, `bootstrap`, and `getApp`.

## Remaining work

- Finalize the exact OpenClaw plugin runtime shape.
- Decide whether quick replies should remain heuristic or become schema-driven.
- Reduce any remaining draft duplication between runtime files.

## Notes

This checkpoint is meant to show what is stable and what still needs polishing before implementation hardening.
