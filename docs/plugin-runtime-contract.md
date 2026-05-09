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
- `YellowClawApp`

## Notes

- This draft should stay aligned with OpenClaw plugin conventions.
- If the final OpenClaw runtime contract changes, this file should be updated first.
