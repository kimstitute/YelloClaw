# Entrypoint Check

## Expected behavior

- `handleSkillRequest(payload)` returns the immediate callback-mode response.
- `handleCallbackRequest(payload, result)` delegates to the shared runtime helper.
- `getApp()` is available for consumers that need access to the shared app instance.

## Notes

Keep this file in sync with `src/entrypoint.ts`.
