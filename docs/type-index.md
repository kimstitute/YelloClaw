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
- Quick replies draft: `docs/quick-replies.md`
- Plugin bootstrap: `docs/plugin-bootstrap.md`
- Plugin entrypoint: `docs/plugin-entrypoint.md`
- Entrypoint runtime: `docs/entrypoint-runtime.md`
- App-entrypoint integration: `docs/app-entrypoint-integration.md`
- MVP call chain: `docs/mvp-call-chain.md`
- MVP example: `docs/mvp-example.md`
- README examples: `docs/README-examples.md`
- MVP checklist: `docs/mvp-checklist.md`
- Final MVP guide: `docs/final-mvp-guide.md`
- Runtime contract alignment: `docs/runtime-contract-alignment.md`
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
