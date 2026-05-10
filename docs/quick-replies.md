# Quick Replies Contract

## Purpose

Define how YellowClaw turns render data into Kakao quick replies.

## Contract

- Quick replies are created by `renderForKakao()` through `toQuickRepliesFromData()`.
- Source data must be a non-empty string value.
- The object key becomes the visible quick reply `label`.
- The string value becomes `messageText`.
- Labels are trimmed before use.
- Empty labels, empty values, and non-string values are skipped.
- Duplicate labels are first-wins after trim.
- Duplicate `messageText` values are allowed when labels differ.
- Invalid quick replies are removed by renderer validation.
- `renderTextOnly()` always returns `quickReplies: []`.

## Example

```ts
{
  data: {
    Yes: 'yes',
    No: 'no',
    ' Yes ': 'ignored'
  }
}
```

This renders as two quick replies:
- `Yes` → `yes`
- `No` → `no`

## Notes

Quick replies are part of the renderer contract, not policy or session logic.
