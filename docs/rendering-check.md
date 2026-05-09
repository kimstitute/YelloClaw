# Rendering Check

## Expected state

- `renderForKakao(request)` normalizes markdown into plain text.
- Card mode returns text/basic/list card placeholders.
- Quick replies are derived from string-valued render data.
- `renderTextOnly(text)` is available as the simplest fallback.

## Notes

Keep this file in sync with `src/renderers/index.ts` and `docs/README-examples.md`.
