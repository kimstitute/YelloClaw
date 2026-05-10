# Runtime Code Review

## Summary

- `plugin-runtime.ts` owns the app singleton and shared orchestration.
- `entrypoint.ts` stays thin and delegates to runtime helpers.
- Immediate response construction is centralized in the runtime module.

## Rule

If the entrypoint grows logic again, move that logic back into `plugin-runtime.ts`.
