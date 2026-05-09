# Kakao Schema Check

## Current hardening targets

### textCard
- `title` or `description` must be present
- keep text length within Kakao limits
- buttons optional

### basicCard
- `thumbnail` is required
- `fixedRatio` is now explicitly represented in the draft types
- buttons optional

### listCard
- `header` and `items` are required
- item `title` is required
- `action: "message"` should carry `messageText`
- `action: "block"` should carry `blockId`
- `buttonLayout` should be explicit when used
- `items` should not exceed Kakao limits

### quickReplies
- derived from render data in the current draft
- should remain within Kakao limits

## Notes

This is the place to keep track of schema details as the renderer is hardened.
