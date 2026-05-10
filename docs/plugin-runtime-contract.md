# Plugin Runtime Contract

## Purpose

Define the runtime contract that YellowClaw satisfies as an OpenClaw plugin.

## Runtime responsibilities

- Expose a plugin entrypoint
- Accept Kakao channel payloads
- Orchestrate app/session/policy/rendering logic
- Support callback-mode responses
- Keep channel-specific code isolated from core logic

## Core surfaces

- `handleSkillRequest(payload)`
- `handleCallbackFlow(payload, result)`
- `YellowClawApp`

## Public handler surface

- `src/entrypoint.ts` exports the stable public surface.

## Shared orchestration surface

- `src/plugin-runtime.ts` owns the singleton runtime and callback flow.

## Optional surfaces

- Relay and ngrok are optional adapter concerns.
- They must not be required by the core runtime contract.

## Notes

- Keep this file aligned with the actual exported runtime surfaces.
- Prefer code-level contracts over prose duplication.
