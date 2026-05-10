# README Examples

## MVP response example

```json
{
  "version": "2.0",
  "useCallback": true,
  "template": {
    "outputs": [
      {
        "textCard": {
          "title": "잠시만 기다려줘."
        }
      }
    ]
  }
}
```

## Card mode example

```json
{
  "version": "2.0",
  "useCallback": true,
  "template": {
    "outputs": [
      {
        "textCard": {
          "title": "안녕, 민상아"
        }
      },
      {
        "basicCard": {
          "title": "안녕, 민상아",
          "description": "YellowClaw card mode example",
          "thumbnail": {
            "imageUrl": "https://example.com/yellowclaw-card.png",
            "fixedRatio": false
          }
        }
      },
      {
        "listCard": {
          "header": {
            "title": "안녕, 민상아"
          },
          "items": [
            {
              "title": "다음 단계",
              "description": "OpenClaw runtime contract example",
              "action": "message",
              "messageText": "다음 단계"
            }
          ],
          "buttonLayout": "vertical"
        }
      }
    ],
    "quickReplies": [
      {
        "label": "다음",
        "action": "message",
        "messageText": "다음 단계"
      }
    ]
  }
}
```

## Notes

- These examples are aligned with the current renderer contract.
- Use them as README snippets or future docs content.
