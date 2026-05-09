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
- Plugin bootstrap: `docs/plugin-bootstrap.md`
- Plugin entrypoint: `docs/plugin-entrypoint.md`
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
