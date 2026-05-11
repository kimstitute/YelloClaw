# 002-step: Kakao skill payload 계약 정리

## 목표
- Kakao `SkillPayload`의 입력 구조를 코드와 문서에서 더 분명하게 잠근다.
- MVP에서 실제로 쓰는 필드와, 앞으로 확장할 필드를 구분한다.
- 잘못된 입력이 들어와도 현재 runtime이 어디까지 허용하는지 명시한다.

## 진행 순서
1. 현재 타입 점검
   - `src/types.ts`의 `KakaoSkillPayload` / `KakaoUserRequest` / 관련 nested 타입을 확인한다.
   - `docs/kakao-contracts.md`, `docs/types-to-lock.md`, `docs/kakao-schema-check.md`와 어긋나는 부분을 찾는다.

2. 계약 경계 정리
   - top-level 필수 필드와 선택 필드를 구분한다.
   - `userRequest` 내부에서 반드시 필요한 값과 MVP에서 optional로 둘 값을 나눈다.
   - `bot` / `intent` / `action` / `contexts`는 확장 필드로 유지할지 결정한다.

3. 최소 검증 또는 정규화 추가
   - runtime이 실제로 참조하는 값(`utterance`, `user.id`, `callbackUrl`, `block.id`)의 기본 처리 규칙을 정한다.
   - 필요하면 테스트를 추가해 계약이 깨지지 않게 고정한다.

4. 문서 동기화
   - 코드에서 확정된 계약을 `docs/kakao-contracts.md`와 관련 체크 문서에 반영한다.
   - `README.md`나 MVP 문서에 영향을 주면 같이 맞춘다.

## 완료 기준
- `SkillPayload`를 읽는 사람이 필수/선택 필드를 바로 알 수 있다.
- 현재 runtime 동작과 문서가 서로 어긋나지 않는다.
- 계약 변경이 있으면 테스트로 확인된다.