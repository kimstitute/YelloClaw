# Runtime Code Alignment

## Goal

Keep `src/plugin-runtime.ts` and `src/entrypoint.ts` aligned so they describe the same runtime flow.

## Current alignment

- `plugin-runtime.ts` owns the app instance and low-level callback flow helper.
- `entrypoint.ts` imports from `plugin-runtime.ts` and exposes the public skill handler surface.
- The entrypoint remains thin.
- The runtime module remains the shared orchestration surface.

## Notes

- If either file changes shape, update this document and the runtime contract docs.
- Keep the public handler names stable until the plugin runtime is finalized.
