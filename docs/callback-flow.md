# Callback Flow

## Goal

Use Kakao callback mode to separate fast acknowledgment from final response delivery.

## Flow

1. Receive `SkillPayload`
2. Convert it into `YellowClawInboundMessage`
3. Return a fast `SkillResponse` with `useCallback: true`
4. Process the message in YellowClaw/OpenClaw core
5. Render the final response
6. Build `KakaoCallbackRequest`
7. POST it to `userRequest.callbackUrl`
8. Record the callback result as `KakaoCallbackResponse`

## Data model

- `YellowClawTransportEnvelope`
  - contains the inbound message
  - optionally tracks the callback job
- `YellowClawCallbackJob`
  - tracks callback URL, payload, and delivery status

## Notes

- The immediate response should stay minimal.
- The final user-facing response belongs in the callback step.
- Keep callback transport separate from rendering and policy.
