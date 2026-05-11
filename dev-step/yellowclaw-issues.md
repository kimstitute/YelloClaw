# YellowClaw 문제점 및 해결 방법

## 1. `/skill` HTTP 서버가 없음 (502 BAD_GATEWAY의 근본 원인)

### 문제
카카오 오픈빌더는 스킬 서버 URL로 `POST /skill`을 보낸다.
현재 `src/entrypoint.ts`는 HTTP 서버가 아니라 OpenClaw 플러그인 인터페이스용 **함수 export** 모음이다.
`handleSkillRequest` 등을 직접 호출하는 주체가 없으므로, 카카오 요청을 받아줄 엔드포인트 자체가 존재하지 않는다.

### 해결
프로젝트 루트에 `server.ts` 추가:

```typescript
import express from 'express'
import { handleSkillRequest } from './src/entrypoint'

const app = express()
app.use(express.json())

app.post('/skill', async (req, res) => {
  const response = await handleSkillRequest(req.body)
  res.json(response)
})

app.listen(4000, () => console.log('skill server on 4000'))
```

`package.json` scripts에 `dev` 추가:

```json
"dev": "tsx server.ts"
```

의존성 설치:

```bash
npm install express @types/express tsx --save-dev
```

---

## 2. `npm run dev` 스크립트가 없음

### 문제
`package.json`의 `scripts`에 `dev`가 없다. `build`, `test` 계열만 있고 서버 실행 스크립트가 없다.
또한 `dependencies`가 완전히 비어 있어 Express 등 런타임 의존성이 없다.

### 해결
위 1번의 `server.ts` + `"dev": "tsx server.ts"` 추가로 해결.

---

## 3. mock-relay는 카카오 facing 서버가 아님

### 문제
`tools/mock-relay`(FastAPI)를 `/skill` 수신 서버로 오해하기 쉽다.
실제로는 **OpenClaw facing 메시지 큐 서버**이며, 엔드포인트 구성은 다음과 같다:

| 엔드포인트 | 역할 |
|---|---|
| `GET /openclaw/messages` | OpenClaw가 카카오 메시지 polling |
| `POST /openclaw/reply` | OpenClaw가 처리 완료 후 응답 전달 |
| `POST /openclaw/messages/ack` | 메시지 수신 확인 |
| `POST /openclaw/pairing/generate` | 페어링 코드 생성 |
| `GET /health` | 상태 확인 |

카카오가 직접 때리는 엔드포인트가 아니다.

### 해결
mock-relay는 포트 3000에서 그대로 두고, 카카오용 `/skill` 서버는 포트 4000에 별도로 띄운다.

---

## 4. 포트 구성 정리

### 현재 (잘못됨)
```
카카오 → ngrok → localhost:3000 (아무것도 없음) → 502
```

### 목표 구성
```
카카오 → ngrok(4000) → localhost:4000  [server.ts, /skill]
                              ↓ 메시지 큐 적재
OpenClaw → localhost:3000  [mock-relay, /openclaw/*]
                              ↓ POST /openclaw/reply
                        localhost:4000 → 카카오 callbackUrl
```

ngrok 실행:
```bash
ngrok http 4000
```

mock-relay 실행:
```bash
cd tools/mock-relay
RELAY_TOKEN=your-token uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
```

스킬 서버 실행:
```bash
# 프로젝트 루트
npm run dev
```

---

## 5. `relayUrl` / `relayToken` 설정

### 문제
`openclaw.plugin.json`의 `relayUrl`이 `https://kakao.openclaw.local`(로컬 전용 플레이스홀더)로 되어 있고,
`relayToken`도 `CHANGE_ME_RELAY_TOKEN`으로 미설정 상태다.

### 해결
mock-relay 실행 후 `openclaw.plugin.json` 업데이트:

```json
"relayUrl": "http://localhost:3000",
"relayToken": "your-token"
```

`relayToken`은 발급받는 값이 아니라 직접 설정하는 임의 시크릿. mock-relay 실행 시 `RELAY_TOKEN` 환경변수와 동일한 값으로 맞추면 된다.

---

## 6. 콜백 모드 미설정 (카카오 오픈빌더)

### 문제
카카오 오픈빌더에서 "콜백 사용"을 체크하지 않으면 `SkillPayload`에 `callbackUrl`이 포함되지 않는다.
`callbackUrl` 없이는 콜백 응답 플로우 전체가 무의미해진다.

또한 스킬 서버의 즉시 ACK 응답에 `"useCallback": true`가 없으면 카카오가 콜백 대기 상태로 전환되지 않는다.

### 해결
오픈빌더 → 스킬 → 해당 스킬 → **콜백 사용 체크**.

ACK 응답 형식:
```json
{
  "version": "2.0",
  "useCallback": true
}
```

---

## 실행 순서 요약

```bash
# 1. mock-relay 설치 및 실행 (포트 3000)
pip install -e ./tools/mock-relay
cd tools/mock-relay
RELAY_TOKEN=mytoken uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload

# 2. 스킬 서버 실행 (포트 4000)
cd /home/minsang/Documents/Workspaces/yellow-claw
npm run dev

# 3. ngrok (포트 4000)
ngrok http 4000

# 4. 오픈빌더 스킬 URL 업데이트
# https://xxxx.ngrok-free.app/skill

# 5. openclaw.plugin.json 업데이트
# relayUrl: http://localhost:3000
# relayToken: mytoken
```
