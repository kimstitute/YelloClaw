# Entrypoint Runtime Check

## Expected state

- `src/plugin-runtime.ts` is the shared orchestration source.
- `src/entrypoint.ts` imports from `plugin-runtime.ts`.
- `handleSkillRequest` is thin at the entrypoint layer.
- `handleCallbackFlow` remains isolated as the callback helper.

## Notes

If these files diverge, update this document and the runtime contract documents together.
