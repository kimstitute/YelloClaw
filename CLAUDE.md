# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**YellowClaw** is a KakaoTalk channel plugin for OpenClaw built on the OpenClaw Plugin SDK. Responsibility split:
- **KakaoTalk**: input/output and rendering only
- **OpenClaw SDK**: context, memory, AI, session, and policy management
- **YellowClaw**: thin bridge — Kakao payload conversion, renderer, channel adapters

## Commands

```bash
# Type check (no emit)
npm run build

# Run tests once
npm run test:run

# Run tests in watch mode
npm test

# Run a single test file
npx vitest run src/callback.test.ts

# Run mock relay (for local E2E testing)
pip install -e ./tools/mock-relay
RELAY_TOKEN=dev uvicorn app.main:app --port 3000 --app-dir tools/mock-relay

# Forward relay to OpenClaw gateway (SDK 방식 — /webhook/kakao 포워딩)
OPENCLAW_GATEWAY_URL=http://localhost:4000 RELAY_TOKEN=dev uvicorn app.main:app --port 3000 --app-dir tools/mock-relay
```

## Architecture

### Inbound call chain (SDK 방식)

```
KakaoTalk POST /skill
  → mock-relay POST /skill              (tools/mock-relay)
    → ACK { version:"2.0", useCallback:true } → KakaoTalk
    → [optional] forward to OpenClaw gateway /webhook/kakao
         → api.registerHttpRoute handler (src/channel/inbound.ts)
              → callbackUrlMap.set(userId, callbackUrl)
              → ACK to KakaoTalk immediately
              → runtime.channel.turn.run(adapter)  ← OpenClaw Turn Kernel
                   → AI처리, 세션, 메모리 (OpenClaw 자동)
                        → ChannelOutboundAdapter.sendText (src/channel/outbound.ts)
                             → callbackUrlMap.get(userId) → postKakaoCallback()
```

### Key module roles

| File | Role |
|---|---|
| `src/plugin.ts` | Plugin entry point — `defineChannelPluginEntry` + `createChatChannelPlugin` |
| `src/channel/inbound.ts` | `registerHttpRoute('/webhook/kakao')` + `ChannelTurnAdapter` |
| `src/channel/outbound.ts` | `ChannelOutboundAdapter` + callbackUrl Map bridge |
| `src/channel/config.ts` | `ChannelConfigAdapter` + `ChannelSetupAdapter` |
| `src/channel/security.ts` | `ChannelSecurityAdapter` — DM pairing policy |
| `src/types.ts` | KakaoTalk wire format types only |
| `src/callback.ts` | `buildCallbackPayload` + `postKakaoCallback` |
| `src/renderers/index.ts` | KakaoTalk response rendering (text/basic/list cards, quick replies) |
| `src/channel-adapters/kakao/index.ts` | Kakao payload conversion utilities |
| `src/config.ts` | Config loading from environment variables |

### callbackUrl bridge

`ChannelOutboundContext.to` = userId이지만 `callbackUrl`은 없음.
→ `inbound.ts`에서 `Map<userId, callbackUrl>`에 저장, `outbound.ts`의 `sendText`에서 꺼낸 후 삭제.

### OpenClaw Plugin SDK subpaths used

- `openclaw/plugin-sdk/channel-core` — `defineChannelPluginEntry`, `createChatChannelPlugin`, `ChannelPlugin`, `PluginRuntime`, `OpenClawConfig`, `OpenClawPluginApi`
- `openclaw/plugin-sdk/channel-setup` — `ChannelSetupAdapter`
- `openclaw/plugin-sdk/core` — `ChannelOutboundAdapter`, `DEFAULT_ACCOUNT_ID`

### Plugin manifest

`openclaw.plugin.json` declares the plugin entry point (`src/plugin.ts`).
OpenClaw loads this at startup and calls `register` → `registerFull` for HTTP routes.

## Docs

- `docs/sdk-refactor-plan.md` — SDK 리팩터링 계획 (완료 상태 포함)
- `docs/kakao-contracts.md` — Kakao payload contracts
- `docs/rendering.md` — rendering rules and card types

Development progress tracked in `dev-step/`.
