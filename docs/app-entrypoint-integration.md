# App + Entrypoint Integration

## Purpose

Define how the YellowClaw app orchestration layer and the plugin entrypoint relate to each other.

## Roles

### App

`YellowClawApp` owns:
- inbound handling
- session state updates
- policy evaluation
- rendering coordination
- callback payload building

### Entrypoint

The entrypoint owns:
- receiving the Kakao skill payload
- invoking the app orchestration
- returning the immediate ACK response
- invoking callback delivery when needed

## Draft flow

1. `handleSkillRequest(payload)` is called
2. `YellowClawApp.handleInbound(payload)` creates the inbound message and updates session state
3. `handleSkillRequest` returns a minimal callback-mode response
4. `handleCallbackFlow(payload, result)` builds and sends the callback payload

## Notes

- App logic should stay reusable outside the transport layer.
- Entrypoint logic should stay thin.
- Callback delivery should remain separate from rendering logic.
