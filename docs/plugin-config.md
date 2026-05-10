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

## Manifest path mapping

- `plugins.entries.yellow-claw.config.kakao.enabled`
- `plugins.entries.yellow-claw.config.kakao.channelId`
- `plugins.entries.yellow-claw.config.kakao.relayUrl`
- `plugins.entries.yellow-claw.config.kakao.relayToken`
- `plugins.entries.yellow-claw.config.auth.pairingRequired`
- `plugins.entries.yellow-claw.config.auth.adminUserId`
- `plugins.entries.yellow-claw.config.policy.adminOnlyTools`
- `plugins.entries.yellow-claw.config.policy.allowlistOnly`
- `plugins.entries.yellow-claw.config.policy.allowedUsers`

## Semantics

- `kakao.enabled`: whether the Kakao adapter is active
- `kakao.channelId`: Kakao channel identifier
- `kakao.relayUrl`: optional relay endpoint under the Kakao config block
- `kakao.relayToken`: relay auth token under the Kakao config block
- `auth.pairingRequired`: whether pairing is mandatory
- `auth.adminUserId`: admin identity for privileged actions
- `policy.adminOnlyTools`: restrict sensitive tools to admin
- `policy.allowlistOnly`: restrict access to allowlisted users only
- `policy.allowedUsers`: explicit allowlist

## Usage rule

This document is the source of truth for local sample config and should stay aligned with `openclaw.plugin.json`.
