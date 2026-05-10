# Core vs Relay Boundary

## Core

YellowClaw core should only own:
- Kakao payload handling
- session/state updates
- policy checks
- rendering
- callback delivery

Core files:
- `src/index.ts`
- `src/plugin-runtime.ts`
- `src/entrypoint.ts`

## Relay Adapter

Relay is optional. It should only provide:
- health probing
- inbox polling
- reply delivery
- ack delivery
- pairing code generation

Relay files:
- `src/adapters/relay.ts`
- `src/plugin-bootstrap.ts` (optional init only)

## Rule

Do not make core depend on relay.
If relay is absent, YellowClaw core should still build and operate normally.
