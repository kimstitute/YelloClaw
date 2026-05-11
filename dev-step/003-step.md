# 003-step: Kakao skill response / callback 계약 정리

## 목표
- 즉시 ACK 응답과 callback 최종 응답의 계약을 분리해서 더 명확하게 만든다.
- Kakao callback payload가 skill response와 어떤 관계인지 문서와 타입에서 일치시킨다.
- 실패/누락 상황에서 runtime이 안전하게 동작하는 기준을 정리한다.

## 진행 순서
1. 현재 응답 타입 점검
   - `src/types.ts`의 `KakaoSkillResponse`, `KakaoCallbackRequest`, `KakaoCallbackResponse`를 다시 확인한다.
   - `src/callback.ts`와 `src/channel-adapters/kakao/index.ts`의 payload 생성 로직을 비교한다.

2. 계약 경계 정리
   - 즉시 ACK에 들어가야 하는 필드와 callback에만 필요한 필드를 구분한다.
   - `template.outputs`, `quickReplies`, `context`, `data`의 top-level 위치를 문서와 맞춘다.
   - callback 실패 시의 최소 처리 기준을 정한다.

3. 테스트 보강
   - ACK 응답이 callback 최종 응답과 섞이지 않도록 검증한다.
   - callbackUrl이 없을 때 `undefined`를 반환하는 경계를 유지한다.
   - callback payload 형태가 문서와 같게 유지되는지 확인한다.

4. 문서 동기화
   - `docs/kakao-contracts.md`, `docs/callback-flow.md`, `docs/entrypoint-runtime*.md`를 함께 맞춘다.
   - 필요하면 README의 MVP 설명도 같이 정리한다.

## 완료 기준
- ACK 응답과 callback 응답의 역할이 명확히 구분된다.
- payload shape가 코드와 문서에서 어긋나지 않는다.
- 테스트로 핵심 경계가 고정된다.