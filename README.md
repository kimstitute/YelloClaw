<p align="center">
  <img src="./assets/mascot.png" alt="YellowClaw mascot" width="420" />
</p>

# YellowClaw

[OpenClaw](https://openclaw.ai)용 카카오톡 채널 플러그인. OpenClaw Plugin SDK 기반.

## 역할 분담

| 레이어 | 담당 |
|---|---|
| KakaoTalk | 입출력, 렌더링 |
| OpenClaw SDK | 컨텍스트, 메모리, AI, 세션, 정책 |
| YellowClaw | 얇은 브릿지 — 페이로드 변환, 채널 어댑터 |

## 동작 방식

카카오톡은 **콜백 모드** 방식으로 동작합니다. 스킬 서버는 5초 안에 ACK를 반환하고, 실제 응답은 콜백 URL로 비동기 전송합니다.

```
KakaoTalk POST /skill
  → OpenClaw 게이트웨이 POST /webhook/kakao   ← ngrok → port 4000
       → ACK { version:"2.0", useCallback:true } → KakaoTalk
       → runtime.channel.turn.run(adapter)
            → AI + 세션 처리 (OpenClaw)
                 → ChannelOutboundAdapter.sendText
                      → POST callbackUrl → KakaoTalk
```

## 소스 구조

```
src/
  plugin.ts                     플러그인 진입점 (defineChannelPluginEntry)
  types.ts                      카카오톡 와이어 포맷 타입
  callback.ts                   buildCallbackPayload + postKakaoCallback
  config.ts                     릴레이 URL 유틸리티
  constants.ts
  channel/
    inbound.ts                  registerHttpRoute('/webhook/kakao') + ChannelTurnAdapter
    outbound.ts                 ChannelOutboundAdapter + callbackUrl Map 브릿지
    config.ts                   ChannelConfigAdapter + ChannelSetupAdapter
    security.ts                 ChannelSecurityAdapter (DM 페어링 정책)
  renderers/
    index.ts                    카카오톡 응답 렌더링 (텍스트, 카드, 빠른 답장)
    validation.ts
  channel-adapters/kakao/
    index.ts                    resolveConversationKey

tools/mock-relay/               카카오톡 스킬 서버를 로컬에서 에뮬레이트하는 FastAPI 서버
configs/
  sample.plugin.config.json     이 플러그인용 OpenClaw 설정 스니펫
```

## 설치

### 1. OpenClaw에 플러그인 설치

```bash
openclaw plugins install /path/to/yellow-claw
```

### 2. `~/.openclaw/openclaw.json`에 채널 설정 추가

`configs/sample.plugin.config.json` 내용을 병합합니다.

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

`externalId`는 `pf.kakao.com/_XXXXX`의 `_XXXXX` 부분입니다.

### 3. 카카오톡 스킬 서버 URL 설정

카카오 OpenBuilder에서 스킬 서버 URL을 OpenClaw 게이트웨이 주소로 설정합니다.

```
https://<ngrok-또는-도메인>/webhook/kakao
```

게이트웨이 기본 포트는 **4000**입니다.

## 로컬 개발 (실제 카카오톡 없이)

mock-relay로 카카오톡 스킬 서버를 로컬에서 시뮬레이션합니다.

```bash
pip install -e ./tools/mock-relay
RELAY_TOKEN=dev uvicorn app.main:app --port 3000 --app-dir tools/mock-relay
```

OpenClaw 게이트웨이로 포워딩하려면:

```bash
OPENCLAW_GATEWAY_URL=http://localhost:4000 RELAY_TOKEN=dev uvicorn app.main:app --port 3000 --app-dir tools/mock-relay
```

## 개발 명령어

```bash
# 타입 체크
npm run build

# 테스트 실행
npm run test:run

# 감시 모드
npm test
```

## 설정 스키마

| 필드 | 타입 | 설명 |
|---|---|---|
| `relayUrl` | string | mock-relay 주소 (로컬 개발용) |
| `relayToken` | string | 릴레이와 플러그인 간 공유 시크릿 |
| `externalId` | string | 카카오 채널 URL ID (`pf.kakao.com/_XXXXX`) |
| `pairingRequired` | boolean | DM 수신 전 페어링 요구 여부 (기본값: `true`) |
| `allowFrom` | string[] | 허용된 카카오 사용자 ID 목록 |
