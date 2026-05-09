# Plugin Bootstrap Draft

## Purpose

The bootstrap layer connects the Kakao skill payload to the YellowClaw app orchestrator.

## Draft behavior

- Create a `YellowClawApp`
- Accept the Kakao payload
- Produce a minimal immediate response
- Defer full processing to callback mode

## Current implementation

- `handleKakaoSkill(payload)` returns a minimal immediate response
- The response uses callback mode
- The immediate message is intentionally simple

## Notes

- This file is a draft and may be split later into a real plugin entry and a runtime handler.
