# Plugin Runtime Contract Draft

## Purpose

Define the runtime contract that YellowClaw should satisfy as an OpenClaw plugin.

## Runtime responsibilities

- Expose a plugin entrypoint
- Accept Kakao channel payloads
- Orchestrate app/session/policy/rendering logic
- Support callback-mode responses
- Keep channel-specific code isolated from core logic

## Core-only surfaces

- `handleSkillRequest(payload)`
- `handleCallbackFlow(payload, result)`
- `YellowClawApp`

## Optional surfaces

Relay and ngrok are optional adapter concerns and must not be required by the core runtime contract.

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
- `plugin-runtime.ts` is the shared core orchestration surface
- `entrypoint.ts` is the public-facing handler surface
- Relay behavior stays outside the core runtime contract

## Notes

- This draft should stay aligned with OpenClaw plugin conventions.
- If the final OpenClaw runtime contract changes, this file should be updated first.
