# Rendering Contract Check

## Code vs example alignment

### renderForKakao(card)
Current code returns:
- `textCard.title = text`
- `basicCard.title = text`
- `basicCard.thumbnail.fixedRatio = false`
- `listCard.header.title = text`
- `listCard.items[0].title = text`
- `listCard.items[0].description = 'YellowClaw rendered this list item as a placeholder for the MVP.'`
- `listCard.items[0].action = 'message'`
- `listCard.items[0].messageText = text`
- `listCard.buttonLayout = 'vertical'`
- `quickReplies` derived from string-valued render data entries

### README example
The README example should match the same shape and default titles.

## Rule

When the renderer changes, update this file and the README examples together.
