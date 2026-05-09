# Policy Draft

## Purpose

Define access control and privilege rules for YellowClaw.

## Current rules

- `allowlistOnly` is the default posture.
- Sensitive tools are admin-only.
- The admin identity must be explicit.
- Only allowlisted users may interact when allowlist mode is enabled.
- `evaluateAuthState(userId, policy)` should derive `allowed`, `paired`, and `role` consistently.

## Draft helpers

- `isAdminUser(userId, policy)`
- `isUserAllowed(userId, policy)`
- `evaluateAuthState(userId, policy)`

## Notes

- Do not infer admin from message content.
- Do not infer allowlist membership from channel metadata alone.
- Keep policy decisions separate from rendering.
