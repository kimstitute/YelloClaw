# Plugin Entrypoint Draft

## Purpose

Define the file that OpenClaw loads as the YellowClaw runtime entrypoint.

## Stable public surface

- `handleSkillRequest(payload)`
- `handleCallbackRequest(payload, result)`
- `bootstrap(config?)`
- `getApp()`

## Draft responsibilities

- Expose the app orchestration surface
- Accept Kakao skill payloads
- Produce immediate callback-mode responses
- Delegate callback delivery to the shared runtime helper
- Keep relay/helper concerns outside the public surface

## Current draft files

- `src/entrypoint.ts`
- `src/plugin-bootstrap.ts`
- `src/plugin-runtime.ts`
- `src/channel-adapters/kakao/index.ts`
- `src/callback.ts`

## Notes

- This document is intentionally minimal.
- The final plugin runtime shape should align with OpenClaw plugin conventions.
