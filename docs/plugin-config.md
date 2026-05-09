# Plugin Configuration

## OpenClaw plugin entry

YellowClaw is configured as an OpenClaw plugin entry named `yellow-claw`.

## Plugin config shape

```json
{
  "kakao": {
    "enabled": true,
    "channelId": "",
    "relayUrl": "",
    "relayToken": ""
  },
  "auth": {
    "pairingRequired": true,
    "adminUserId": ""
  },
  "policy": {
    "adminOnlyTools": true,
    "allowlistOnly": true,
    "allowedUsers": []
  }
}
```

## Semantics

- `kakao.enabled`: whether the Kakao adapter is active
- `kakao.channelId`: Kakao channel identifier
- `kakao.relayUrl`: optional relay endpoint
- `kakao.relayToken`: relay auth token if needed
- `auth.pairingRequired`: whether pairing is mandatory
- `auth.adminUserId`: admin identity for privileged actions
- `policy.adminOnlyTools`: restrict sensitive tools to admin
- `policy.allowlistOnly`: restrict access to allowlisted users only
- `policy.allowedUsers`: explicit allowlist

## Usage rule

This document is the source of truth for local sample config and should stay aligned with `openclaw.plugin.json`.
