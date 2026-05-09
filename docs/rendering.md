# Rendering Draft

## Purpose

Translate YellowClaw core output into Kakao-friendly response payloads.

## Current behavior

- Markdown is normalized into plain text first.
- Text mode returns a text card with the normalized text.
- Card mode currently returns a text card, a basic card placeholder, and a list card placeholder.
- Quick replies can be derived from string-valued render data keys.

## Notes

- Keep rendering separate from policy and session logic.
- The renderer should be replaceable without changing the core app flow.
- The current card output is still MVP-oriented and should be refined against the official Kakao schema.
