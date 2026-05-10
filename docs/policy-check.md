# Policy Check

## Expected state

- `allowlistOnly` defaults to true.
- Sensitive tools are admin-only.
- Admin identity is explicit.
- Allowlist membership is required when allowlist mode is on.
- `evaluateAuthState(userId, policy)` returns a consistent role / access state.

## Draft helper expectations

- `isAdminUser` checks explicit admin identity and admin gating.
- `isUserAllowed` respects allowlist mode.
- `evaluateAuthState` derives `paired` and `allowed` together.
