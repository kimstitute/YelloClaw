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

- `docs/` — design notes, contracts, flows, schema, and examples
- `src/` — plugin source and runtime
- `configs/` — sample plugin config
- `kakao-spec/` — Kakao-specific notes

## MVP summary

- KakaoTalk channel only
- Card responses supported
- Per-user context separation
- Allowlist-only access
- Admin-only sensitive tools
- Callback-mode response flow

## Runtime surfaces

- Public surface: `src/entrypoint.ts`
- Shared orchestration: `src/plugin-runtime.ts`
- Optional relay adapter: `src/adapters/relay.ts`
- Bootstrap/init: `src/plugin-bootstrap.ts`

## Call chain

1. KakaoTalk sends a `SkillPayload`
2. `src/entrypoint.ts` receives the request
3. `src/plugin-runtime.ts` orchestrates app, session, policy, rendering, and callback flow
4. `src/renderers/index.ts` shapes the Kakao response
5. `src/callback.ts` builds and posts callback payloads when a callback URL exists

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
- `docs/rendering-contract-check.md`
- `docs/quick-replies.md`
- `docs/plugin-bootstrap.md`
- `docs/plugin-entrypoint.md`
- `docs/entrypoint-runtime.md`
- `docs/entrypoint-runtime-check.md`
- `docs/app-entrypoint-integration.md`
- `docs/mvp-call-chain.md`
- `docs/mvp-example.md`
- `docs/README-examples.md`
- `docs/mvp-checklist.md`
- `docs/final-mvp-guide.md`
- `docs/runtime-contract-alignment.md`
- `docs/runtime-code-alignment.md`
- `docs/plugin-runtime-contract.md`

## Current runtime files

- `src/types.ts`
- `src/index.ts`
- `src/session-manager.ts`
- `src/policy/index.ts`
- `src/renderers/index.ts`
- `src/channel-adapters/kakao/index.ts`
- `src/callback.ts`
- `src/plugin-bootstrap.ts`
- `src/entrypoint.ts`
- `src/plugin-runtime.ts`

## Example docs

- `docs/README-examples.md`

## Runtime contract

- `docs/plugin-runtime-contract.md`
- `docs/plugin-entrypoint.md`
- `docs/entrypoint-runtime.md`
- `docs/app-entrypoint-integration.md`
- `docs/runtime-code-alignment.md`
- `docs/runtime-code-review.md`
- `docs/runtime-contract-alignment.md`
