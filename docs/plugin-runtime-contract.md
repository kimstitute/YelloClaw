# Plugin Runtime Contract

## Purpose

Define the runtime contract YellowClaw satisfies as an OpenClaw plugin.

## Runtime responsibilities

- Expose a plugin entrypoint
- Accept Kakao channel payloads
- Orchestrate app/session/policy/rendering logic
- Support callback-mode responses
- Keep channel-specific code isolated from core logic

## Stable surfaces

- Public handler surface: `src/entrypoint.ts`
- Shared orchestration surface: `src/plugin-runtime.ts`
- Internal callback helper: `handleCallbackFlow(payload, result)`

## Optional surfaces

Relay and ngrok are optional adapter concerns and must not be required by the core runtime contract.

## Notes

Keep this file aligned with the actual exported runtime surfaces and prefer code-level contracts over prose duplication.
