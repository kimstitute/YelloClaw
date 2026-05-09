# Quick Replies Draft

## Purpose

Generate simple Kakao quick replies from YellowClaw data.

## Current behavior

- If render data contains string values, they are converted into quick replies.
- The key becomes the label.
- The string value becomes `messageText`.

## Example

```ts
{
  data: {
    "Yes": "yes",
    "No": "no"
  }
}
```

This can render into quick replies with labels `Yes` and `No`.

## Notes

- This is a draft heuristic.
- It should be replaced or refined once the final quick reply schema is fixed.
