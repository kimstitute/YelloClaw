# MVP Example Flow

## Example

1. User sends a Kakao message.
2. YellowClaw receives the `SkillPayload`.
3. `YellowClawApp` creates or updates the session.
4. Policy checks whether the user is allowed.
5. Renderer converts the response into text/card output.
6. Entrypoint returns a callback-mode immediate response.
7. Callback payload is generated from the rendered result.
8. Callback payload is POSTed to Kakao.

## Example render outcome

- Plain text fallback is always included.
- Card mode may include:
  - text card
  - basic card
  - list card
- Quick replies may be derived from render data.

## Notes

This is the smallest version of the end-to-end flow that should work before adding richer behavior.
