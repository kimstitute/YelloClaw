# Final MVP Guide

## Goal

Make the smallest KakaoTalk -> YellowClaw -> callback -> Kakao loop work for one allowlisted user.

## Flow

1. Kakao sends a skill payload.
2. The runtime receives the payload.
3. YellowClaw creates or updates the session.
4. Policy checks allow access.
5. The app renders a response.
6. The runtime returns a callback-mode ACK.
7. The callback payload is built.
8. The callback payload is POSTed to Kakao.
9. Kakao displays the final response.

## MVP output

- Plain text fallback
- Text card
- Basic card placeholder
- List card placeholder
- Quick replies from string-valued render data

## MVP constraints

- KakaoTalk only
- One allowlisted user
- Admin-only sensitive tools
- Per-user context separation
- Callback mode only

## Notes

This guide should be used as the final implementation checklist before expanding to richer behavior.
