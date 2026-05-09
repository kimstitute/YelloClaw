<p align="center">
  <img src="./docs/images/yellowclaw-mascot.png" alt="YellowClaw mascot" width="420" />
</p>

# YellowClaw

KakaoTalk channel plugin for OpenClaw.

## Roles

- KakaoTalk: input/output and rendering only
- OpenClaw: context, memory, tools, and policy
- YellowClaw: thin bridge between them

## Workspace

- `docs/` — design notes, contracts, flows, and schema drafts
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
- `docs/rendering.md`
- `docs/quick-replies.md`
- `docs/plugin-bootstrap.md`
- `docs/plugin-entrypoint.md`
- `docs/entrypoint-runtime.md`
- `docs/app-entrypoint-integration.md`
- `docs/mvp-call-chain.md`
- `docs/mvp-example.md`
- `docs/plugin-runtime-contract.md`

## Current runtime drafts

- `src/types.ts`
- `src/index.ts`
- `src/session-manager.ts`
- `src/policy/index.ts`
- `src/renderers/index.ts`
- `src/channel-adapters/kakao/index.ts`
- `src/callback.ts`
- `src/plugin-bootstrap.ts`
- `src/entrypoint.ts`

## Current status

YellowClaw is in early scaffold / contract-locking mode.
The next step is to refine the plugin runtime contract and align the README with the MVP call chain and response examples.

## Example docs

- `docs/README-examples.md`
