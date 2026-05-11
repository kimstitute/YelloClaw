# YellowClaw

KakaoTalk channel plugin for [OpenClaw](https://openclaw.ai), built on the OpenClaw Plugin SDK.

## Responsibility split

| Layer | Handles |
|---|---|
| KakaoTalk | input/output, rendering |
| OpenClaw SDK | context, memory, AI, session, policy |
| YellowClaw | thin bridge — payload conversion, channel adapters |

## How it works

KakaoTalk uses a **callback mode** flow: the skill server must ACK within 5 seconds, then send the actual response asynchronously via a callback URL.

```
KakaoTalk POST /skill
  → OpenClaw gateway POST /webhook/kakao   ← ngrok → port 4000
       → ACK { version:"2.0", useCallback:true } → KakaoTalk
       → runtime.channel.turn.run(adapter)
            → AI + session (OpenClaw)
                 → ChannelOutboundAdapter.sendText
                      → POST callbackUrl → KakaoTalk
```

## Source layout

```
src/
  plugin.ts                     Plugin entry point (defineChannelPluginEntry)
  types.ts                      KakaoTalk wire format types
  callback.ts                   buildCallbackPayload + postKakaoCallback
  config.ts                     Relay URL utilities
  constants.ts
  channel/
    inbound.ts                  registerHttpRoute('/webhook/kakao') + ChannelTurnAdapter
    outbound.ts                 ChannelOutboundAdapter + callbackUrl Map bridge
    config.ts                   ChannelConfigAdapter + ChannelSetupAdapter
    security.ts                 ChannelSecurityAdapter (DM pairing policy)
  renderers/
    index.ts                    KakaoTalk response rendering (text, cards, quick replies)
    validation.ts
  channel-adapters/kakao/
    index.ts                    resolveConversationKey

tools/mock-relay/               FastAPI server that emulates KakaoTalk skill server locally
configs/
  sample.plugin.config.json     OpenClaw config snippet for this plugin
```

## Setup

### 1. Install the plugin into OpenClaw

```bash
openclaw plugins install /path/to/yellow-claw
```

### 2. Add channel config to `~/.openclaw/openclaw.json`

Merge the contents of `configs/sample.plugin.config.json`:

```json
{
  "channels": {
    "kakao-talkchannel": {
      "default": {
        "relayUrl": "http://localhost:3000",
        "relayToken": "dev",
        "externalId": "_XXXXX",
        "pairingRequired": true,
        "allowFrom": []
      }
    }
  }
}
```

`externalId` is the channel URL ID from `pf.kakao.com/_XXXXX`.

### 3. Set KakaoTalk skill server URL

In KakaoTalk OpenBuilder, set the skill server URL to your OpenClaw gateway address:

```
https://<your-ngrok-or-domain>/webhook/kakao
```

The gateway default port is **4000**.

## Local development (without real KakaoTalk)

Run the mock relay to simulate KakaoTalk locally:

```bash
pip install -e ./tools/mock-relay
RELAY_TOKEN=dev uvicorn app.main:app --port 3000 --app-dir tools/mock-relay
```

To forward to a running OpenClaw gateway:

```bash
OPENCLAW_GATEWAY_URL=http://localhost:4000 RELAY_TOKEN=dev uvicorn app.main:app --port 3000 --app-dir tools/mock-relay
```

## Development

```bash
# Type check
npm run build

# Run tests
npm run test:run

# Watch mode
npm test
```

## Config schema

| Field | Type | Description |
|---|---|---|
| `relayUrl` | string | Mock relay address (local dev only) |
| `relayToken` | string | Shared secret between relay and plugin |
| `externalId` | string | Kakao channel URL ID (`pf.kakao.com/_XXXXX`) |
| `pairingRequired` | boolean | Require pairing before accepting DMs (default: `true`) |
| `allowFrom` | string[] | Allowlisted Kakao user IDs |
