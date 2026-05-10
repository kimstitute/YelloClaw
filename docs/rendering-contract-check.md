# Rendering Contract Check

## Code vs example alignment

### renderForKakao(card)
Current code returns:
- `textCard.title = resolved text`
- `basicCard` only when a real image URL is provided
- `listCard` only when valid items are provided
- `quickReplies` only from non-empty string data values
- empty input falls back to `DEFAULT_FALLBACK_TEXT`

### Rules

- Plain text fallback is always valid.
- Placeholder cards must not escape the renderer.
- Card mode may collapse to a text card when extras are invalid.

## Rule

When the renderer changes, update this file and the README examples together.
