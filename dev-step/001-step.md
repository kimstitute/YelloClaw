# 다음 구현 계획

## 목표
- KakaoTalk 1인 allowlist MVP를 끝까지 안정화한다.
- 현재 남은 핵심 계약 2개를 잠그고, 엔드투엔드 흐름을 검증한다.

## 진행 순서
1. Kakao skill payload 계약 정리
   - `SkillPayload` 입력 형식과 필수/선택 필드를 확정한다.
   - 예외 케이스(빈 메시지, 잘못된 컨텍스트, callback 누락)를 정리한다.

2. skill response / callback 계약 정리
   - 즉시 ACK 응답과 최종 callback 응답의 책임을 분리한다.
   - callback payload 형식, 실패 처리, 재시도 기준을 고정한다.

3. 엔드투엔드 플로우 검증
   - `entrypoint -> runtime -> renderers -> callback` 흐름을 하나의 allowlisted 사용자 기준으로 확인한다.
   - text / card / quick replies 응답이 모두 동작하는지 테스트한다.

4. 문서와 예제 동기화
   - `README.md`, MVP 문서, 계약 문서를 실제 코드 흐름과 맞춘다.
   - 최종 체크리스트를 기준으로 완료 여부를 판단한다.

## 완료 기준
- allowlisted 1명 기준으로 callback 모드가 정상 동작한다.
- text, card, quick replies가 깨지지 않는다.
- 핵심 계약과 문서가 서로 어긋나지 않는다.