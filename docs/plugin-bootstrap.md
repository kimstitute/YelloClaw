# Plugin Bootstrap

## Purpose

The bootstrap layer initializes YellowClaw runtime configuration.

## Responsibilities

- Load or receive plugin config
- Configure runtime policy
- Initialize optional relay adapter state

## Not responsible for

- request handling
- rendering
- callback delivery

## Current implementation

- `bootstrap(config?)` wires config into runtime state.
- Relay initialization remains optional.

## Notes

Keep bootstrap thin; request flow belongs in the runtime/entrypoint surface.
