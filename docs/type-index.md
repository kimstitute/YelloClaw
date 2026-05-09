# YellowClaw Type Index

This document points to the working type source for implementation.

## Canonical References

- Kakao contracts: `docs/kakao-contracts.md`
- TypeScript drafts: `docs/typescript-interfaces.md`
- Type lock checklist: `docs/types-to-lock.md`
- Plugin config: `docs/plugin-config.md`
- Storage schema: `docs/storage-schema.md`
- Session manager: `docs/session-manager.md`
- App flow: `docs/app-flow.md`
- Callback flow: `docs/callback-flow.md`
- Policy draft: `docs/policy.md`
- Rendering draft: `docs/rendering.md`
- Rendering contract check: `docs/rendering-contract-check.md`
- Kakao schema check: `docs/kakao-schema-check.md`
- Quick replies draft: `docs/quick-replies.md`
- Plugin bootstrap: `docs/plugin-bootstrap.md`
- Plugin entrypoint: `docs/plugin-entrypoint.md`
- Entrypoint runtime: `docs/entrypoint-runtime.md`
- Entrypoint runtime check: `docs/entrypoint-runtime-check.md`
- Entrypoint entrypoint check: `docs/entrypoint-entrypoint-check.md`
- App-entrypoint integration: `docs/app-entrypoint-integration.md`
- MVP call chain: `docs/mvp-call-chain.md`
- MVP example: `docs/mvp-example.md`
- README examples: `docs/README-examples.md`
- MVP checklist: `docs/mvp-checklist.md`
- Final MVP guide: `docs/final-mvp-guide.md`
- Final MVP check: `docs/final-mvp-check.md`
- Checkpoint status: `docs/checkpoint-status.md`
- Runtime contract alignment: `docs/runtime-contract-alignment.md`
- Runtime code alignment: `docs/runtime-code-alignment.md`
- Runtime code review: `docs/runtime-code-review.md`
- Plugin runtime contract: `docs/plugin-runtime-contract.md`
- Implementation plan: `IMPLEMENTATION_PLAN.md`

## Runtime Source

- Implementation type source: `src/types.ts`

## Runtime Files in Progress

- `src/index.ts`
- `src/channel-adapters/kakao/index.ts`
- `src/renderers/index.ts`
- `src/policy/index.ts`
- `src/types.ts`

## Rule

When the docs and code diverge, update the docs first, then update `src/types.ts` to match.
