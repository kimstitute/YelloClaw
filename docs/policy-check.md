# Policy Check

## Expected state

- `allowlistOnly` defaults to true.
- Sensitive tools are admin-only.
- Admin identity is explicit.
- Allowlist membership is required when allowlist mode is on.
- `evaluateAuthState(userId, policy)` returns a consistent role / access state.

## Draft helper expectations

- `isAdminUser` checks both admin policy and allowlist membership.
- `isUserAllowed` respects allowlist mode.
- `evaluateAuthState` derives `paired` and `allowed` together.
