# Skill Response Check

## Required fields for the draft

- `version: "2.0"`
- `useCallback: true`
- `template.outputs` must be present
- `context` is top-level and optional
- `data` is top-level and optional

## Template rules

- `textCard` / `basicCard` / `listCard` live inside `template.outputs`
- `quickReplies` live inside `template`
- `outputs` should not be omitted in the current draft

## Notes

This file exists to keep the draft response contract and the code output aligned.
