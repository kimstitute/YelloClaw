# Plugin Runtime Contract Draft

## Purpose

Define the runtime contract that YellowClaw should satisfy as an OpenClaw plugin.

## Runtime responsibilities

- Expose a plugin entrypoint
- Accept Kakao channel payloads
- Orchestrate app/session/policy/rendering logic
- Support callback-mode responses
- Keep channel-specific code isolated from core logic

## Suggested runtime surfaces

- `handleSkillRequest(payload)`
- `handleCallbackFlow(payload, result)`
- `createApp()`
- `YellowClawApp`

## Current code drafts

- `src/plugin-runtime.ts`
- `src/entrypoint.ts`
- `src/plugin-bootstrap.ts`
- `src/callback.ts`
- `src/index.ts`

## Alignment checklist

- App flow matches the MVP call chain
- Entrypoint remains thin
- Callback delivery stays isolated
- Rendering stays separate from policy and session management
- `plugin-runtime.ts` is the shared orchestration surface
- `entrypoint.ts` is the public-facing handler surface

## Notes

- This draft should stay aligned with OpenClaw plugin conventions.
- If the final OpenClaw runtime contract changes, this file should be updated first.
