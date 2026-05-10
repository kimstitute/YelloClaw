# Runtime Code Alignment

## Goal

Keep `src/plugin-runtime.ts` and `src/entrypoint.ts` describing the same flow.

## Alignment

- `plugin-runtime.ts` owns the app singleton and shared orchestration
- `entrypoint.ts` exposes the stable public handler surface
- `buildImmediateResponse()` stays in `plugin-runtime.ts`
- `getApp()` is re-exported from the entrypoint for convenience

## Rule

If either file changes shape, update this document and the runtime contract docs together.
