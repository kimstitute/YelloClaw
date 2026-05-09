# YellowClaw App Flow

## Current orchestration

1. Receive Kakao `SkillPayload`
2. Create / update session state
3. Check policy access
4. Render response for Kakao
5. Build callback payload
6. Send callback to Kakao

## Runtime entry

`YellowClawApp` in `src/index.ts` currently coordinates the flow in memory.

## Notes

- This is still an early orchestration draft.
- Session management and policy checks will likely become more detailed later.
- Callback sending is still separated from payload building.
