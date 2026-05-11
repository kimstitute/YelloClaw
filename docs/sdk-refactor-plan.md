# YellowClaw SDK 리팩터링 계획

## 개요

현재 yellow-claw는 OpenClaw의 플러그인 SDK를 사용하지 않고, 함수 export + 자체 HTTP 서버(`server.ts`) 방식으로 구현되어 있다. 이를 OpenClaw 공식 SDK 기반(`defineChannelPluginEntry` 등)으로 전면 리팩터링한다.

### 목표

- KakaoTalk: 데이터 송수신 + 렌더링만 담당
- OpenClaw SDK: 대화기록, 메모리, AI처리, 컨텍스트, 세션 자동 관리
- yellow-claw: 카카오 페이로드 변환 + 렌더러 + 채널 어댑터만 담당

---

## 실제 SDK API (타입 파일 직접 확인)

### `defineChannelPluginEntry` (from `openclaw/plugin-sdk/channel-core`)

```typescript
defineChannelPluginEntry({
  id: string;
  name: string;
  description: string;
  plugin: ChannelPlugin;
  configSchema?: ...;
  setRuntime?: (runtime: PluginRuntime) => void;   // runtime 캡처용
  registerCliMetadata?: (api: OpenClawPluginApi) => void;
  registerFull?: (api: OpenClawPluginApi) => void; // HTTP 라우트 등록 위치
})
```

### `createChatChannelPlugin` (from `openclaw/plugin-sdk/channel-core`)

```typescript
createChatChannelPlugin({
  base: ChatChannelPluginBase;     // 필수: id, meta, setup 포함
  security?: ChannelSecurityAdapter | ChatChannelSecurityOptions;
  pairing?: ChannelPairingAdapter | ChatChannelPairingOptions;
  threading?: ChannelThreadingAdapter | ChatChannelThreadingOptions;
  outbound?: ChannelOutboundAdapter | ChatChannelAttachedOutboundOptions;
})
```

`ChatChannelPluginBase`는 `ChannelPlugin`에서 `security`, `pairing`, `threading`, `outbound`를 제외한 나머지. 최소 필요: `id`, `meta`, `setup`, `config`.

### `ChannelSetupAdapter` (필수 필드)

```typescript
type ChannelSetupAdapter = {
  applyAccountConfig: (params: { cfg, accountId, input }) => OpenClawConfig;  // 필수
  resolveAccountId?: ...;
  validateInput?: ...;
  // ...
}
```

### `ChannelConfigAdapter<ResolvedAccount>` (필수 필드)

```typescript
type ChannelConfigAdapter<ResolvedAccount> = {
  listAccountIds: (cfg: OpenClawConfig) => string[];       // 필수
  resolveAccount: (cfg: OpenClawConfig, accountId?) => ResolvedAccount; // 필수
  // ...
}
```

### `ChannelOutboundAdapter` (필수 필드)

```typescript
type ChannelOutboundAdapter = {
  deliveryMode: "direct" | "gateway" | "hybrid";  // 필수
  sendText?: (ctx: ChannelOutboundContext) => Promise<OutboundDeliveryResult>;
  // ...
}
```

`ChannelOutboundContext`는 `to` (userId)를 갖지만 `callbackUrl`은 없음 → 별도 Map 브리지 필요.

### `ChannelSecurityAdapter`

```typescript
type ChannelSecurityAdapter<ResolvedAccount> = {
  resolveDmPolicy?: (ctx: ChannelSecurityContext<ResolvedAccount>) => ChannelSecurityDmPolicy | null;
  collectWarnings?: ...;
  collectAuditFindings?: ...;
}
```

### `api.registerHttpRoute`

```typescript
api.registerHttpRoute({
  path: string;
  handler: (req: IncomingMessage, res: ServerResponse) => Promise<boolean|void> | boolean | void;
  auth: "gateway" | "plugin";
  match?: "exact" | "prefix";
  replaceExisting?: boolean;
})
```

---

## 현재 구조 vs 목표 구조

### 현재 (함수 export 방식)

```
카카오톡
  └─ POST /skill (server.ts)
       ├─ handleSkillRequest()       entrypoint.ts
       │    └─ YellowClawRuntime     plugin-runtime.ts
       │         └─ YellowClawApp    index.ts
       │              ├─ SessionManager
       │              └─ isUserAllowed (policy/)
       └─ resolveCallback()          server.ts 플레이스홀더
            └─ handleCallbackRequest()
                 └─ postKakaoCallback()
```

### 목표 (SDK 방식)

```
카카오톡
  └─ 중계 서버 (공개)
       └─ registerFull → api.registerHttpRoute("/webhook/kakao")    [plugin.ts]
            ├─ 즉시 ACK 반환 (res.end)
            ├─ callbackUrl을 Map<userId, callbackUrl>에 저장
            └─ PluginRuntime.channel.turn.run(...)   OpenClaw Turn Kernel 진입
                 └─ (AI처리, 세션, 메모리 → OpenClaw 자동)
                      └─ ChannelOutboundAdapter.sendText(ctx)
                           ├─ ctx.to로 Map에서 callbackUrl 조회
                           └─ postKakaoCallback(callbackUrl, payload)
```

---

## 파일 변경 계획

### 삭제할 파일

| 파일 | 이유 |
|---|---|
| `server.ts` | `api.registerHttpRoute`로 대체 |
| `src/entrypoint.ts` | SDK entry point로 대체 |
| `src/plugin-runtime.ts` | OpenClaw Turn Kernel이 담당 |
| `src/plugin-bootstrap.ts` | SDK `register()` 콜백으로 대체 |
| `src/index.ts` (YellowClawApp) | `createChatChannelPlugin`으로 대체 |
| `src/session-manager.ts` | OpenClaw 세션 관리로 대체 |
| `src/policy/index.ts` | SDK security adapter로 대체 |
| `src/adapters/relay.ts` | 중계 서버 연동 방식 변경으로 대체 |
| `src/core/index.ts` | 불필요 |

### 유지할 파일

| 파일 | 이유 |
|---|---|
| `src/types.ts` | 카카오 페이로드 타입 (여전히 필요) |
| `src/renderers/index.ts` | 카카오 응답 렌더링 로직 |
| `src/renderers/validation.ts` | 렌더링 유효성 검사 |
| `src/channel-adapters/kakao/index.ts` | 카카오 포맷 변환 유틸 |
| `src/callback.ts` | callbackUrl POST 로직 |
| `src/config.ts` | 환경변수 로딩 |
| `src/constants.ts` | 상수 |

### 새로 추가할 파일

| 파일 | 역할 |
|---|---|
| `src/plugin.ts` | 플러그인 메인 엔트리포인트 |
| `src/channel/inbound.ts` | 웹훅 라우트 핸들러 (카카오 → OpenClaw) |
| `src/channel/outbound.ts` | `ChannelOutboundAdapter` (OpenClaw → 카카오) |
| `src/channel/security.ts` | DM 정책 어댑터 |
| `src/channel/config.ts` | `ChannelConfigAdapter` + `ChannelSetupAdapter` |

---

## 단계별 구현 계획

---

### Phase 1: 의존성 및 매니페스트 정비 ✅ (조사 완료)

**목적:** SDK를 쓸 수 있는 환경 구성

#### 1-1. `package.json` 수정

```json
{
  "peerDependencies": {
    "openclaw": ">=2026.1.29"
  },
  "devDependencies": {
    "openclaw": "^2026.5.7"
  }
}
```

- `tsx` devDependency 유지 (로컬 dev 용)
- `openclaw` SDK를 peer + dev dependency로 추가

#### 1-2. `openclaw.plugin.json` 재작성

```json
{
  "name": "@openclaw/yellow-claw",
  "version": "0.1.0",
  "description": "KakaoTalk channel plugin for OpenClaw",
  "openclaw": {
    "extensions": ["./src/plugin.ts"],
    "runtimeExtensions": ["./dist/plugin.js"]
  }
}
```

기존 `plugins.entries` 섹션은 OpenClaw 설정 파일(`openclaw.config.json`)에 속하므로 플러그인 매니페스트에서 제거.

---

### Phase 2: 채널 플러그인 엔트리포인트 작성

**목적:** `defineChannelPluginEntry`로 OpenClaw에 플러그인 등록

#### 2-1. `src/plugin.ts` 작성

```typescript
import { defineChannelPluginEntry, createChatChannelPlugin } from 'openclaw/plugin-sdk/channel-core';
import type { PluginRuntime } from 'openclaw/plugin-sdk/channel-core';
import { registerInboundRoute } from './channel/inbound.js';
import { kakaoOutboundAdapter } from './channel/outbound.js';
import { kakaoSecurityAdapter } from './channel/security.js';
import { kakaoConfigAdapter, kakaoSetupAdapter } from './channel/config.js';

let runtime: PluginRuntime | undefined;

const kakaoPlugin = createChatChannelPlugin({
  base: {
    id: 'kakao-talkchannel',
    meta: {
      name: 'KakaoTalk',
      label: 'KakaoTalk Channel',
    },
    config: kakaoConfigAdapter,
    setup: kakaoSetupAdapter,
  },
  security: kakaoSecurityAdapter,
  outbound: kakaoOutboundAdapter,
});

export default defineChannelPluginEntry({
  id: 'yellow-claw',
  name: 'YellowClaw - KakaoTalk',
  description: 'KakaoTalk 채널 플러그인',
  plugin: kakaoPlugin,
  setRuntime: (r) => { runtime = r; },
  registerFull: (api) => {
    registerInboundRoute(api, () => runtime);
  },
});
```

---

### Phase 3: 인바운드 처리 (카카오 → OpenClaw)

**목적:** 카카오 스킬 요청을 받아 OpenClaw Turn Kernel에 전달

#### 3-1. `src/channel/inbound.ts` 작성

핵심 책임:
1. `POST /webhook/kakao` 엔드포인트 등록 (`api.registerHttpRoute`)
2. 즉시 ACK 반환 (`res.end`)
3. `callbackUrl`을 Map에 저장
4. `runtime.channel.turn.run(...)` 호출 (비동기)

```typescript
import type { OpenClawPluginApi, PluginRuntime } from 'openclaw/plugin-sdk/channel-core';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { KakaoSkillPayload } from '../types.js';
import { kakaoTurnAdapter } from './turn-adapter.js';

// callbackUrl 브리지: sendText에서 userId로 조회
export const callbackUrlMap = new Map<string, string>();

export function registerInboundRoute(
  api: OpenClawPluginApi,
  getRuntime: () => PluginRuntime | undefined,
): void {
  api.registerHttpRoute({
    path: '/webhook/kakao',
    auth: 'gateway',
    handler: async (req: IncomingMessage, res: ServerResponse) => {
      const body = await readBody(req);
      const payload = JSON.parse(body) as KakaoSkillPayload;
      const userId = payload.userRequest.user?.id ?? 'unknown';
      const callbackUrl = payload.userRequest.callbackUrl;

      // 즉시 ACK (5초 제한)
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ version: '2.0', useCallback: true }));

      const rt = getRuntime();
      if (!rt) return;

      if (callbackUrl) callbackUrlMap.set(userId, callbackUrl);

      rt.channel.turn.run({
        channel: 'kakao-talkchannel',
        raw: payload,
        adapter: kakaoTurnAdapter,
      }).catch((err: unknown) => console.error('[inbound] turn error', err));
    },
  });
}
```

#### 3-2. `src/channel/turn-adapter.ts` 작성

`ChannelTurnAdapter<KakaoSkillPayload>` 구현:
- `ingest`: KakaoSkillPayload → NormalizedTurnInput
- `resolveTurn`: AssembledChannelTurn 반환 (delivery는 kakaoOutboundAdapter 위임)

---

### Phase 4: 아웃바운드 처리 (OpenClaw → 카카오)

**목적:** OpenClaw가 AI 응답을 만들면 카카오 callbackUrl로 전송

#### 4-1. `src/channel/outbound.ts` 작성

```typescript
import type { ChannelOutboundAdapter } from 'openclaw/plugin-sdk/channel-core';
import { callbackUrlMap } from './inbound.js';
import { renderTextOnly } from '../renderers/index.js';
import { buildCallbackPayload, postKakaoCallback } from '../callback.js';

export const kakaoOutboundAdapter: ChannelOutboundAdapter = {
  deliveryMode: 'direct',  // 필수
  sendText: async (ctx) => {
    const callbackUrl = callbackUrlMap.get(ctx.to);
    if (!callbackUrl) throw new Error(`no callbackUrl for ${ctx.to}`);
    callbackUrlMap.delete(ctx.to);  // 1회 사용 후 삭제

    const result = renderTextOnly(ctx.text);
    const callbackPayload = buildCallbackPayload(result);
    await postKakaoCallback(callbackUrl, callbackPayload);

    return {
      channel: 'kakao-talkchannel',
      messageId: `kakao-${Date.now()}`,
    };
  },
};
```

#### 4-2. `src/callback.ts` 유지

현재 `buildCallbackPayload`와 `postKakaoCallback`은 그대로 사용.

---

### Phase 5: 설정 및 보안 어댑터

**목적:** ChannelConfigAdapter, ChannelSetupAdapter, ChannelSecurityAdapter 구현

#### 5-1. `src/channel/config.ts` 작성

```typescript
import type { ChannelConfigAdapter, ChannelSetupAdapter } from 'openclaw/plugin-sdk/channel-core';
import type { OpenClawConfig } from 'openclaw/plugin-sdk/channel-core';
import { DEFAULT_ACCOUNT_ID } from 'openclaw/plugin-sdk/channel-core';

type KakaoAccount = { accountId: string; relayUrl: string; relayToken: string };

export const kakaoConfigAdapter: ChannelConfigAdapter<KakaoAccount> = {
  listAccountIds: (cfg: OpenClawConfig) => {
    const channel = (cfg as any).channels?.['kakao-talkchannel'];
    if (!channel) return [];
    return Object.keys(channel).filter(k => k !== '_default');
  },
  resolveAccount: (cfg: OpenClawConfig, accountId?) => {
    const id = accountId ?? DEFAULT_ACCOUNT_ID;
    const channel = (cfg as any).channels?.['kakao-talkchannel']?.[id];
    return { accountId: id, relayUrl: channel?.relayUrl ?? '', relayToken: channel?.relayToken ?? '' };
  },
};

export const kakaoSetupAdapter: ChannelSetupAdapter = {
  applyAccountConfig: ({ cfg, accountId, input }) => {
    // OpenClaw config에 카카오 계정 정보 저장
    const updated = { ...cfg } as any;
    if (!updated.channels) updated.channels = {};
    if (!updated.channels['kakao-talkchannel']) updated.channels['kakao-talkchannel'] = {};
    updated.channels['kakao-talkchannel'][accountId] = {
      relayUrl: input.relayUrl,
      relayToken: input.relayToken,
    };
    return updated;
  },
};
```

#### 5-2. `src/channel/security.ts` 작성

```typescript
import type { ChannelSecurityAdapter } from 'openclaw/plugin-sdk/channel-core';
import type { KakaoAccount } from './config.js';

export const kakaoSecurityAdapter: ChannelSecurityAdapter<KakaoAccount> = {
  resolveDmPolicy: (ctx) => {
    const channel = (ctx.cfg as any).channels?.['kakao-talkchannel']?.[ctx.accountId ?? '_default'];
    return {
      policy: channel?.pairingRequired !== false ? 'pairing' : 'open',
      allowFromPath: `channels.kakao-talkchannel.${ctx.accountId ?? '_default'}.allowFrom`,
      approveHint: '/kakao-pair <user_id>',
    };
  },
};
```

---

### Phase 6: 정리 및 마무리

#### 6-1. mock-relay에 `/skill` 엔드포인트 추가

`tools/mock-relay/app/routes.py`에 추가:

```python
@router.post("/skill")
async def receive_skill(request: Request):
    payload = await request.json()
    # OpenClaw 플러그인의 /webhook/kakao로 포워딩
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{OPENCLAW_GATEWAY_URL}/webhook/kakao",
            json=payload,
        )
    # relay가 카카오에 즉시 ACK 반환 (useCallback 모드)
    return { "version": "2.0", "useCallback": True }
```

#### 6-2. 삭제할 파일 제거

```bash
rm server.ts
rm src/entrypoint.ts
rm src/entrypoint.test.ts
rm src/plugin-runtime.ts
rm src/plugin-runtime.test.ts
rm src/plugin-runtime.core.test.ts
rm src/plugin-bootstrap.ts
rm src/plugin-bootstrap.test.ts
rm src/index.ts
rm src/index.test.ts
rm src/session-manager.ts
rm src/session-manager.test.ts
rm src/policy/index.ts
rm src/policy.test.ts
rm src/plugin-context.test.ts
rm src/adapters/relay.ts
rm src/adapters/relay.test.ts
rm src/core/index.ts
```

#### 6-3. `src/types.ts` 정리

SDK에서 제공하는 타입과 중복되는 내부 타입 제거:
- 제거: `YellowClawPolicy`, `YellowClawSessionRecord`, `YellowClawUserProfile`, `YellowClawAuthState`, relay 관련 타입들
- 유지: 카카오 전용 타입 (`KakaoSkillPayload`, `KakaoSkillResponse`, `KakaoOutput` 등)

#### 6-4. 문서 및 CLAUDE.md 업데이트

- `CLAUDE.md`의 commands 섹션에서 `npm run dev` 제거 또는 변경
- `docs/architecture.md` 업데이트

---

## 최종 파일 구조

```
yellow-claw/
├── openclaw.plugin.json         ← 재작성
├── package.json                 ← peer dependency 추가
├── src/
│   ├── plugin.ts                ← NEW: 메인 엔트리포인트
│   ├── types.ts                 ← 카카오 타입만 유지
│   ├── constants.ts
│   ├── config.ts                ← 환경변수 로딩 (유지)
│   ├── callback.ts              ← callbackUrl POST (유지)
│   ├── channel/
│   │   ├── inbound.ts           ← NEW: 웹훅 라우트 + callbackUrl Map
│   │   ├── turn-adapter.ts      ← NEW: ChannelTurnAdapter 구현
│   │   ├── outbound.ts          ← NEW: ChannelOutboundAdapter
│   │   ├── config.ts            ← NEW: ChannelConfigAdapter + SetupAdapter
│   │   └── security.ts          ← NEW: ChannelSecurityAdapter
│   ├── channel-adapters/
│   │   └── kakao/
│   │       ├── index.ts         ← 포맷 변환 유틸 (유지)
│   │       └── index.test.ts
│   └── renderers/
│       ├── index.ts             ← 렌더링 로직 (유지)
│       ├── index.test.ts
│       ├── validation.ts
│       └── validation.test.ts
└── tools/
    └── mock-relay/              ← /skill 엔드포인트 추가
```

---

## callbackUrl 브리지 전략

`ChannelOutboundContext.to` = 카카오 userId이지만 `callbackUrl`은 없음.
→ 인바운드 핸들러에서 `Map<userId, callbackUrl>`에 저장하고, `sendText`에서 꺼낸 후 삭제.

**주의사항:**
- 동일 userId가 동시에 여러 메시지를 보낼 경우 충돌 가능 → 향후 `Map<userId, callbackUrl[]>` 큐로 개선 가능
- callbackUrl의 유효기간(60초)이 지나면 카카오 전송 실패 → 처리 지연 대응 필요

---

## 테스트 전략

### 삭제되는 테스트 (기존 구조 기반)
- `entrypoint.test.ts`, `plugin-runtime.test.ts`, `plugin-runtime.core.test.ts`
- `plugin-bootstrap.test.ts`, `plugin-context.test.ts`
- `session-manager.test.ts`, `policy.test.ts`
- `adapters/relay.test.ts`, `index.test.ts`

### 유지되는 테스트
- `renderers/index.test.ts`, `renderers/validation.test.ts`
- `channel-adapters/kakao/index.test.ts`
- `callback.test.ts`, `config.test.ts`

### 새로 작성할 테스트
- `channel/inbound.test.ts` — 웹훅 라우트 핸들러 + callbackUrl Map
- `channel/outbound.test.ts` — sendText → postKakaoCallback 흐름
- `channel/security.test.ts` — DM 정책 평가
- `plugin.test.ts` — 플러그인 등록 스모크 테스트

---

## 진행 순서 요약

```
Phase 1: 의존성/매니페스트 ✅
    ↓
Phase 2: plugin.ts 엔트리포인트 ✅
    ↓
Phase 3: inbound.ts (turn 어댑터 포함) ✅    Phase 4: outbound.ts ✅
    ↓                                              ↓
Phase 5: config.ts + security.ts ✅
    ↓
Phase 6: 기존 파일 삭제 + mock-relay 수정 + 테스트 정리 (예정)
```

Phase 3과 Phase 4는 병렬 진행 완료.
