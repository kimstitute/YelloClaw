# YellowClaw Mock Relay

Local FastAPI mock used to validate the relay contract before wiring a real relay.

## Purpose
- emulate the relay that YellowClaw talks to
- keep relay behavior outside YellowClaw core
- provide a deterministic local target for contract tests

## Environment
- `RELAY_TOKEN` (required)
- `PAIRING_MODE=stub`
- `PORT=3000`

## Run
- install: `pip install -e ./tools/mock-relay`
- test: `pytest tools/mock-relay/tests`
- local server: `uvicorn app.main:app --host 127.0.0.1 --port 3000 --reload`

## Contract
- `GET /health`
- `GET /openclaw/messages`
- `POST /openclaw/reply`
- `POST /openclaw/messages/ack`
- `POST /openclaw/pairing/generate`

All endpoints require `Authorization: Bearer <RELAY_TOKEN>`.
