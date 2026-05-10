# Rendering Validation

## Purpose

Ensure all Kakao card outputs conform to the official schema and MVP requirements.

## Validation Rules (from kakao-schema-check.md)

### textCard

- `title` or `description` must be present (at least one)
- Text length must not exceed Kakao limits (~1000 chars recommended for MVP)
- `buttons` is optional

**Current issue:** Only `title` is set, never `description`.

### basicCard

- `thumbnail` is **required**
- `thumbnail.imageUrl` must be a valid URL or provided by caller
- `fixedRatio` is optional but should be explicit
- `description` can complement `title`
- `buttons` is optional

**Current issue:** `thumbnail.imageUrl` is hardcoded to `'https://placehold.co/600x400/png'`. Should accept real image URL or skip basicCard if no image available.

### listCard

- `header` is **required**, and `header.title` is required
- `items` is **required**, must not be empty
- Each item's `title` is **required**
- `action: "message"` **must** carry `messageText`
- `action: "block"` **must** carry `blockId`
- `buttonLayout` should be explicit
- Total items should not exceed ~10 items (Kakao limit)

**Current issue:** Always creates a single placeholder item with description "YellowClaw rendered this list item as a placeholder for the MVP." Should accept real list data.

### quickReplies

- Derived from render data (string values only)
- Should not exceed ~10 items (Kakao limit)
- Each reply's `label` and `action` are required
- `action: "message"` must carry `messageText`

**Current implementation:** Correct pattern. String values → quick reply messages.

## MVP Rendering Strategy

### Text Mode (`format: 'text'`)

Return only a text card with the normalized text.

```
Input: { format: 'text', markdown: '**hello**' }
Output:
{
  text: 'hello',
  cards: [{ textCard: { title: 'hello' } }],
  quickReplies: []
}
```

### Card Mode (`format: 'card'`)

Return text card + optional additional cards (basicCard or listCard) based on provided data.

**Current behavior:** Always returns 3 cards (text + basic + list), even if data is incomplete.

**Better behavior:** Return only valid cards. Skip basicCard if no real image. Skip listCard if no real list data.

## Validation Checklist

- [ ] `textCard`: Must have `title` or `description`
- [ ] `textCard`: Text length within limits
- [ ] `basicCard`: Must have valid `thumbnail.imageUrl` (not placeholder)
- [ ] `basicCard`: If included, must follow Kakao schema
- [ ] `listCard`: Must have `header.title` and non-empty `items`
- [ ] `listCard`: All items must have required fields
- [ ] `quickReplies`: No more than ~10 items
- [ ] All cards: `buttonLayout` explicit when buttons present

## Next Steps

1. Create `src/renderers/validation.ts` with schema validators
2. Update `renderForKakao()` to skip invalid cards
3. Add tests for each card type
4. Update README examples to match validated output
