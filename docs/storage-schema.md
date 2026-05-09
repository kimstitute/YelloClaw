# Storage Schema Draft

## Purpose

This document drafts the persistent records YellowClaw may need for sessions, messages, and authorization.

## Draft records

### YellowClawUserProfile
- userId
- displayName
- role
- paired
- allowed

### YellowClawSessionRecord
- sessionId
- userId
- channel
- createdAt
- updatedAt
- expiresAt
- state

### YellowClawMessageRecord
- messageId
- sessionId
- userId
- channel
- text
- createdAt
- direction

### YellowClawCallbackJob
- callbackUrl
- payload
- status
- createdAt
- updatedAt

## Notes

- Keep session data small and explicit.
- Avoid storing secrets in message history.
- Store only what is needed for replay, debugging, and policy enforcement.
