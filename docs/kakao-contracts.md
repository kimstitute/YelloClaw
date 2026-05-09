# Kakao Contracts for YellowClaw

This document captures the Kakao chatbot payload and callback contract that YellowClaw should follow.

## 1) Skill Request (`SkillPayload`)

Expected top-level structure:
- `bot`
- `intent`
- `action`
- `userRequest`
- `contexts`

Important `userRequest` fields:
- `callbackUrl` — where the final response must be POSTed
- `block` — the active block information
- `user` — the user identity object
- `utterance` — the raw user text
- `params` — parsed parameters
- `lang` — language code
- `timezone` — user timezone

YellowClaw notes:
- Treat this as the inbound event contract
- Extract channel/user identity here
- Store only the fields needed for session/context resolution

## 2) Immediate Skill Response (`SkillResponse`)

To use callback mode:
- `version: "2.0"`
- `useCallback: true`
- `template` is required as the container for outputs / quickReplies
- `outputs` is required inside `template`
- `context` is optional
- `data` is optional
- `context` and `data` are top-level siblings of `template`

Example shape:

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
  },
  "context": {
    "values": [
      {
        "name": "abc",
        "lifeSpan": 10,
        "params": {
          "key1": "val1"
        }
      }
    ]
  },
  "data": {
    "foo": "bar"
  }
}
```

YellowClaw notes:
- This is the fast ACK response
- Use it to acknowledge receipt and defer full processing
- Do not put the final user-facing answer here when callback mode is enabled
- Put `context` and `data` outside `template`
- Keep the template output minimal for the ACK path
- Keep `outputs` present even when the list is small

## 3) Callback Request (`CallbackRequest`)

- The final response is sent to `userRequest.callbackUrl`
- The request is JSON POST
- The payload format follows the skill response structure
- `context` and `data` are also top-level siblings when present
- This is the actual user-facing message delivery step

YellowClaw notes:
- Generate the final text/card payload here
- Keep channel rendering separate from core reasoning

## 4) Callback Response (`CallbackResponse`)

Expected success response fields:
- `taskId`
- `status`
- `message`
- `timestamp`

YellowClaw notes:
- Treat this as delivery acknowledgement from Kakao
- Store it only if it is useful for auditing/debugging

## 5) `context` vs `data`

### `context`
- Used for conversation state continuity
- Controls block output context
- Has fields like `name`, `lifeSpan`, `params`
- Should be used when the next turn needs preserved conversational state
- Lives at the top level of the response JSON

### `data`
- Used as a custom value map
- Useful for message variables or template inputs
- Should be used for payload values that are not state
- Lives at the top level of the response JSON

Rule of thumb:
- State / flow continuity -> `context`
- Message variables / custom values -> `data`

## 6) YellowClaw mapping guidance

- Kakao inbound payload -> YellowClaw inbound event
- YellowClaw session/context -> OpenClaw core context
- YellowClaw rendering layer -> Kakao text/card output
- Final answer -> callbackUrl POST

## 7) Design constraints

- Keep Kakao contracts explicit and versioned
- Do not rely on undocumented fields
- Prefer plain text as the default fallback
- Add card rendering as a supported output type, but keep the core response model channel-agnostic

## 8) Next step

Use this file as the source of truth for the Kakao-side contracts before implementing the TypeScript interfaces.
