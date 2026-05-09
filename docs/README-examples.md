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
          "thumbnail": {
            "imageUrl": "https://placehold.co/600x400/png"
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
              "title": "안녕, 민상아",
              "description": "YellowClaw rendered this list item as a placeholder for the MVP."
            }
          ]
        }
      }
    ]
  }
}
```

## Notes

- These examples are draft-oriented and should stay aligned with the renderer implementation.
- Use them as README snippets or as future docs content.
