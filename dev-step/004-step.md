# 004-step: Real Kakao Relay E2E 준비

## 목표
- 로컬/실서버 relay를 통해 Kakao 메시지가 실제로 오가게 만든다.
- YellowClaw core와 relay adapter의 경계를 유지한 채 end-to-end 흐름을 검증한다.
- allowlisted 1명 기준으로 inbox poll → reply → ack → callback 흐름을 확인한다.

## 진행 순서
1. relay 준비 상태 확인
   - `relayUrl`, `relayToken`, `channelId`가 실제 환경과 맞는지 확인한다.
   - `/health`와 관리자/인증 관련 최소 접점을 점검한다.
   - ngrok/외부 HTTPS 주소가 바뀌었는지 확인한다.

2. core vs relay 경계 재확인
   - core는 payload handling, session, policy, rendering, callback만 책임지는지 확인한다.
   - relay는 health probing, inbox polling, reply, ack, pairing code까지만 담당하는지 확인한다.
   - core가 relay에 직접 의존하지 않도록 유지한다.

3. 실제 E2E 검증
   - relay inbox poll이 실제 메시지를 받아오는지 확인한다.
   - `YellowClawApp.handleInbound` → `render` → `sendRelayReply` → `ackRelayMessages` 순서를 검증한다.
   - callback mode가 실제 전달 경로에서도 유지되는지 확인한다.

4. 실패/롤백 점검
   - relay URL 변경 시 설정만 갱신하면 되는지 확인한다.
   - 인증/토큰 누락, health 실패, reply 실패 시 어디서 멈추는지 정리한다.
   - 문제 발생 시 core와 relay 설정을 분리해서 되돌릴 수 있게 한다.

## 완료 기준
- 실제 relay 환경에서 메시지 수신/응답/ack가 한 사이클 이상 성공한다.
- allowlisted 사용자 기준으로 정책과 세션이 유지된다.
- core와 relay 책임이 문서와 코드에서 어긋나지 않는다.