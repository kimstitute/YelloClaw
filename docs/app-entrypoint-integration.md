# App + Entrypoint Integration

## Purpose

Define how the YellowClaw app and entrypoint relate.

## App

`YellowClawApp` owns:
- inbound handling
- session updates
- policy evaluation
- rendering coordination
- callback payload building

## Entrypoint

The entrypoint owns:
- receiving the Kakao skill payload
- invoking shared runtime orchestration
- returning the immediate callback-mode ACK
- delegating callback delivery when needed

## Flow

1. `handleSkillRequest(payload)` enters through the entrypoint
2. The entrypoint uses `plugin-runtime.ts` as the shared orchestration source
3. `YellowClawApp.handleInbound(payload)` creates the inbound message and updates session state
4. `handleSkillRequest` returns the minimal callback-mode response
5. `handleCallbackRequest(payload, result)` delegates to `handleCallbackFlow(payload, result)`
6. `handleCallbackFlow(payload, result)` builds and posts the callback payload

## Notes

App logic stays reusable, entrypoint logic stays thin, and callback delivery stays separate from rendering.
