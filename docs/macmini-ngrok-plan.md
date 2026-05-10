# MacMini + ngrok 실행 계획

## 목표
카카오 봇 ↔ OpenClaw 연결을 맥미니 + ngrok 조합으로 안정적으로 성공시키기.

## 체크리스트

### 1) 준비물 먼저 확인
- 릴레이 서버 실행 파일/레포 준비
- PostgreSQL / Redis 필요 여부 확인
- 관리자 계정 1개, allowlist 대상 정하기
- 카카오 오픈빌더 접근 권한 확인

### 2) 릴레이 서버 로컬 기동
- 맥미니에서 서버 실행
- `/health` 확인
- `/admin/` 접속 확인
- DB/Redis 연결 확인

### 3) ngrok 공개 URL 만들기
- 릴레이 서버 포트를 ngrok에 연결
- 외부 HTTPS URL 확보
- 이 URL이 `relayUrl` 후보
- 변경되면 `relayUrl`만 다시 갱신

### 4) 카카오 쪽 설정
- 스킬 URL: `https://.../kakao-talkchannel/webhook`
- 폴백 블록에 스킬 연결
- Callback 활성화
- 저장 후 배포

### 5) relayToken 발급
- Admin UI에서 OpenClaw account 생성
- `relayToken` 1회 발급분 저장
- 관리자/일반 사용자 권한 확인

### 6) OpenClaw 설정 반영
- `relayUrl` = ngrok URL
- `relayToken` = 발급 토큰
- allowlist / pairing 정책 반영

### 7) 검증
- `/health`
- `GET /openclaw/messages`
- `POST /openclaw/reply`
- callback 전달
- `/pair`, 일반 메시지 확인

### 8) 롤백/실패 대응
- ngrok 주소 바뀌면 `relayUrl`만 업데이트
- DB 마이그레이션 실패 시 롤백 SQL/백업으로 복구
- 설정 꼬이면 OpenClaw 플러그인 config만 원복
- 실패 로그는 `/health`와 relay 로그부터 확인

## 추천 실행 순서
1. 준비물 확인
2. 릴레이 서버 로컬 기동
3. ngrok 공개 URL 생성
4. 카카오 쪽 설정
5. relayToken 발급
6. OpenClaw 설정 반영
7. end-to-end 검증
8. 실패 대응 절차 점검
