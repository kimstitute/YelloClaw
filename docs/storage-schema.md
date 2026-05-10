# Storage Schema

## Purpose

Define the storage records YellowClaw keeps in memory today and may persist later.

## Canonical records

### YellowClawUserProfile
Purpose: auth snapshot per user.

Required fields:
- `userId`
- `role`
- `paired`
- `allowed`

Optional fields:
- `displayName`

Stored by current runtime:
- yes

Not stored here:
- policy decisions
- session TTL metadata

### YellowClawSessionRecord
Purpose: in-memory session state per channel + user.

Required fields:
- `sessionId`
- `userId`
- `channel`
- `createdAt`
- `updatedAt`
- `state`

Optional fields:
- `expiresAt`

Stored by current runtime:
- yes

Not stored here:
- auth policy evaluation
- message history

### YellowClawMessageRecord
Purpose: future replay/debug history for inbound/outbound messages.

Required fields:
- `messageId`
- `sessionId`
- `userId`
- `channel`
- `text`
- `createdAt`
- `direction`

Optional fields:
- none

Stored by current runtime:
- no

Not stored here:
- session TTL
- callback delivery status

### YellowClawCallbackJob
Purpose: future callback delivery tracking.

Required fields:
- `callbackUrl`
- `payload`
- `status`
- `createdAt`

Optional fields:
- `updatedAt`

Stored by current runtime:
- no

Not stored here:
- session state
- auth state

### YellowClawTransportEnvelope
Purpose: future transport envelope for inbound + callback pairing.

Required fields:
- `inbound`

Optional fields:
- `callback`

Stored by current runtime:
- no

Not stored here:
- policy decisions
- rendering results

## Notes

- Keep records explicit and minimal.
- Avoid storing secrets or derived policy decisions in history records.
- If a record is not stored today, mark it as reserved instead of draft.
