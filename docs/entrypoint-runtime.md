# Entrypoint Runtime Draft

## Purpose

The entrypoint exposes a stable function that a future OpenClaw plugin runtime can call.

## Draft API

- `handleSkillRequest(payload)`

## Behavior

- Instantiates or uses the current YellowClaw app state
- Accepts a Kakao skill payload
- Produces a callback-mode immediate response
- Leaves final callback processing to the callback helper layer

## Notes

- This is still a draft and may be renamed to match the final OpenClaw plugin runtime contract.
