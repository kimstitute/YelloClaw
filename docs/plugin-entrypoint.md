# Plugin Entrypoint Draft

## Purpose

Define the file that OpenClaw loads as the YellowClaw runtime entrypoint.

## Draft responsibilities

- Expose the app orchestration surface
- Accept Kakao skill payloads
- Produce immediate callback-mode responses
- Leave final callback delivery to a later stage

## Current draft files

- `src/index.ts`
- `src/plugin-bootstrap.ts`
- `src/channel-adapters/kakao/index.ts`
- `src/callback.ts`

## Notes

- This document is intentionally minimal.
- The final plugin runtime shape should align with OpenClaw plugin conventions.
