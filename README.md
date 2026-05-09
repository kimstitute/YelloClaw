# YellowClaw

KakaoTalk channel plugin for OpenClaw.

## Roles

- KakaoTalk: input/output and rendering only
- OpenClaw: context, memory, tools, and policy
- YellowClaw: thin bridge between them

## Workspace

- `docs/` — design notes, contracts, and flow docs
- `src/` — plugin source and runtime drafts
- `configs/` — sample plugin config
- `kakao-spec/` — Kakao-specific notes

## Current docs

- `IMPLEMENTATION_PLAN.md`
- `docs/kakao-contracts.md`
- `docs/typescript-interfaces.md`
- `docs/types-to-lock.md`
- `docs/type-index.md`
- `docs/plugin-config.md`
- `docs/storage-schema.md`
- `docs/session-manager.md`
- `docs/app-flow.md`
- `docs/callback-flow.md`
- `docs/policy.md`
- `docs/plugin-bootstrap.md`

## Current runtime drafts

- `src/types.ts`
- `src/index.ts`
- `src/session-manager.ts`
- `src/policy/index.ts`
- `src/renderers/index.ts`
- `src/channel-adapters/kakao/index.ts`
- `src/callback.ts`
- `src/plugin-bootstrap.ts`

## Current status

YellowClaw is in early scaffold / contract-locking mode.
The next step is to refine the actual plugin entrypoint and wire the bootstrap to the OpenClaw plugin runtime.
