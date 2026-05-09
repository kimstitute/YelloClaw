# Implementation Notes

## Current state

- YellowClaw is being built as an OpenClaw plugin.
- KakaoTalk is treated as a channel adapter and renderer.
- Core context, memory, tools, and policy remain in OpenClaw.

## Files in progress

- `src/types.ts`
- `src/index.ts`
- `src/channel-adapters/kakao/index.ts`
- `src/renderers/index.ts`
- `src/policy/index.ts`

## Current rendering rule

- Markdown is normalized to plain text first.
- Card rendering can be expanded later.
- Plain text remains the fallback.
- Card mode currently emits a text card plus a basic card placeholder.

## Current policy rule

- `allowlistOnly` is the default posture.
- Admin-only sensitive tools are expected.
- The admin identity should be represented explicitly, not inferred.

## Current transport rule

- Kakao callback delivery is implemented with a POST helper.
- Callback payload construction should remain separate from rendering.
