# Runtime Contract Alignment

## Purpose

Keep the README, runtime contract, app flow, and entrypoint drafts aligned.

## Alignment points

1. `src/plugin-runtime.ts`
2. `src/entrypoint.ts`
3. `docs/plugin-runtime-contract.md`
4. `docs/plugin-entrypoint.md`
5. `docs/entrypoint-runtime.md`
6. `docs/app-entrypoint-integration.md`

## Rules

- The entrypoint should remain thin.
- The app should own orchestration.
- The runtime contract should describe the actual entry surfaces.
- The README should reflect the final MVP and runtime responsibilities.
- The shared orchestration surface should be `src/plugin-runtime.ts`.
- The public handler surface should be `src/entrypoint.ts`.
- `getApp()` may be re-exported from the entrypoint when needed by runtime consumers.
