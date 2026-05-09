# YellowClaw Type Index

This document points to the working type source for implementation.

## Canonical References

- Kakao contracts: `docs/kakao-contracts.md`
- TypeScript drafts: `docs/typescript-interfaces.md`
- Type lock checklist: `docs/types-to-lock.md`
- Plugin config: `docs/plugin-config.md`
- Storage schema: `docs/storage-schema.md`
- Session manager
## Runtime Source

- Implementation type source: `src/types.ts`

## Runtime Files in Progress

- `src/index.ts`
- `src/channel-adapters/kakao/index.ts`
- `src/renderers/index.ts`
- `src/policy/index.ts`
- `src/types.ts`

## Type Notes

- `src/types.ts` is the canonical implementation type source.
- Kakao payload types are intentionally MVP-tolerant: top-level `bot` / `intent` / `action` use explicit nested interfaces, and `userRequest.user` allows optional Kakao identity fields.

## Rule

When the docs and code diverge, update the docs first, then update `src/types.ts` to match.
