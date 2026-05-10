# Policy Draft

## Purpose

Define access control and privilege rules for YellowClaw.

## Current rules

- `allowlistOnly` is the default posture.
- Sensitive tools are admin-only.
- Admin identity is explicit.
- Only allowlisted users may interact when allowlist mode is enabled.
- `evaluateAuthState(userId, policy)` derives `allowed`, `paired`, and `role` consistently.

## Draft helpers

- `isAdminUser(userId, policy)`
- `isUserAllowed(userId, policy)`
- `evaluateAuthState(userId, policy)`

## Boundary

- Policy decides access.
- SessionManager only stores snapshots.
- Runtime can inject the configured admin identity into policy, but policy remains the source of truth for role evaluation.

## Notes

- Do not infer admin from message content.
- Do not infer allowlist membership from channel metadata alone.
- Keep policy decisions separate from rendering.
