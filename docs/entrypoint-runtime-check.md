# Entrypoint Runtime Check

## Expected state

- `src/plugin-runtime.ts` is the shared orchestration source
- `src/entrypoint.ts` imports from `src/plugin-runtime.ts`
- `handleSkillRequest` stays thin at the entrypoint layer
- `handleCallbackRequest` delegates to `handleCallbackFlow`
- `handleCallbackFlow` stays isolated as the callback helper
- `src/callback.ts` builds Kakao callback envelopes from `YellowClawRenderResult` without re-rendering

## Rule

If these files diverge, update this document and the runtime contract docs together.
