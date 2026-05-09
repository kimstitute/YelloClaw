# Entrypoint Runtime Check

## Expected state

- `src/plugin-runtime.ts` is the shared orchestration source.
- `src/entrypoint.ts` imports from `plugin-runtime.ts`.
- `handleSkillRequest` is thin at the entrypoint layer.
- `handleCallbackRequest` delegates to `handleCallbackFlow`.
- `handleCallbackFlow` remains isolated as the callback helper.
- `src/callback.ts` builds Kakao callback envelopes from `YellowClawRenderResult` without re-rendering.

## Notes

If these files diverge, update this document and the runtime contract documents together.
