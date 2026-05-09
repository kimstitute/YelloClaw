# Types to Lock Before Implementation

This document lists the data contracts that should be finalized before implementing YellowClaw.

## 1) Kakao Skill API Contracts

### SkillPayload
Incoming request payload from Kakao.

Need to confirm:
- user identity fields
- block / scenario identifiers
- context payload shape
- callback-related fields
- raw text input location

### SkillResponse
Immediate response returned to the Kakao platform.

Need to confirm:
- `version`
- `useCallback`
- template restrictions
- minimum ACK payload shape

### CallbackRequest
Request sent to the callback URL.

Need to confirm:
- `taskId`
- callback payload shape
- expected response format from the platform

### CallbackResponse
Platform response after callback delivery.

Need to confirm:
- `status`
- `message`
- `timestamp`
- `taskId`

## 2) Response Template Contracts

### Text
- plain text
- line breaks
- links
- emphasis conventions

### Card payloads
- basic card
- text card
- list card
- buttons
- quick replies
- thumbnail / image fields

### Fallback behavior
- what happens when card rendering fails
- how to degrade to text safely

## 3) Session and Context Contracts

Need to define:
- `UserId`
- `ChannelUserId`
- `AdminId`
- `ConversationId`
- `SessionId`
- `ContextSnapshot`
- `ContextTTL`

## 4) Authentication and Policy Contracts

Need to define:
- `PairingCode`
- `AuthState`
- `AllowlistEntry`
- `Role`
- admin / non-admin distinction

## 5) OpenClaw Plugin Contracts

Need to define:
- plugin manifest shape
- runtime extension entry points
- `plugins.entries.<id>.config` shape
- plugin install / enable / inspect flow assumptions

## 6) Internal YellowClaw Bridge Contracts

Need to define:
- `InboundMessage`
- `PluginResponse`
- `ToolCall`
- `RenderRequest`
- `RenderResult`
- Kakao-to-OpenClaw event mapping
- OpenClaw-to-Kakao output mapping

## 7) Storage Contracts

Need to define:
- `users`
- `sessions`
- `pairings`
- `messages`
- `permissions`
- `toolInvocations`

## Recommended Order

1. Lock Kakao Skill API contracts
2. Lock response template contracts
3. Lock OpenClaw plugin manifest and config contracts
4. Define internal bridge types
5. Define storage schema

## Canonical Contract Documents

- Kakao-side contract reference: `docs/kakao-contracts.md`
- TypeScript draft reference: `docs/typescript-interfaces.md`
- Implementation plan: `IMPLEMENTATION_PLAN.md`
- Runtime type source: `src/types.ts`
- Type index: `docs/type-index.md`

## Notes

- Do not start implementation until the public contracts are written down.
- Keep Kakao-specific rendering separate from OpenClaw core logic.
- Treat this as the source of truth for type-first design.
