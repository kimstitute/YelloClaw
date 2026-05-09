# Rendering Draft

## Purpose

Translate YellowClaw core output into Kakao-friendly response payloads.

## Current behavior

- Markdown is normalized into plain text first.
- Text mode returns a text card with the normalized text.
- Card mode currently returns a text card plus a basic card placeholder.
- Quick replies are reserved for future expansion.

## Notes

- Keep rendering separate from policy and session logic.
- The renderer should be replaceable without changing the core app flow.
