# Rendering Draft

## Purpose

Translate YellowClaw core output into Kakao-friendly response payloads.

## Current behavior

- Markdown is normalized into plain text first.
- Empty input falls back to `DEFAULT_FALLBACK_TEXT`.
- Text mode returns a text card with the resolved text.
- Card mode returns a text card plus only valid extra cards.
- Basic cards are only kept when a real image URL exists.
- List cards are only kept when they have valid items.
- Quick replies are derived only from non-empty string-valued render data entries.
- `buildCallbackPayload()` only wraps an already-rendered `YellowClawRenderResult` into Kakao callback shape.
- `renderTextOnly(text)` uses the same fallback text constant.

## Notes

- Keep rendering separate from policy and session logic.
- The renderer should be replaceable without changing the core app flow.
- Card output should never leak placeholder cards.
