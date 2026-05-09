# YellowClaw Implementation Plan

## Goal

Build a KakaoTalk channel plugin for OpenClaw where:

- KakaoTalk is only the input/output and rendering layer
- OpenClaw handles context, memory, tool execution, and policy
- A thin adapter bridges Kakao messages to OpenClaw events and back
- The implementation follows OpenClaw plugin conventions and configuration patterns

## What to Borrow from `clawdbot-kakaotalk`

### Keep

- KakaoTalk skill/webhook server flow
  - Receive `POST /skill`
  - Send an immediate ACK / thinking response
  - Send the final answer through callback

- Pairing-based onboarding
  - First-time authorization with a pairing code
  - Allowlist support for family/team members

- Session and context persistence
  - Per-user conversation state
  - Clear/reset behavior
  - Expiration / TTL policy

- Explicit allowed-user management
  - Admin vs normal user separation
  - Small, auditable allowlist

- Callback-based response pattern
  - Fast initial acknowledgment
  - Delayed final response after processing

### Drop

- Clawdbot-specific core coupling
  - OpenClaw should own reasoning and tool execution

- Excessive Kakao-specific business logic
  - Keep the adapter thin
  - Avoid binding core logic to Kakao quirks

- Broad tool exposure
  - Use least privilege
  - Keep sensitive tools admin-only

- Weak security defaults
  - No default pairing code
  - No open allowlist by default
  - No token leakage in logs

## New Architecture for YellowClaw

### 1. Core Layer

Responsibilities:

- Context and memory
- Tool execution
- Policy and permission checks
- Conversation state management
- Expose plugin-facing hooks and capabilities through OpenClaw conventions

### 2. Channel Adapter Layer

Responsibilities:

- Parse incoming Kakao payloads
- Map messages into OpenClaw events
- Render OpenClaw responses back to Kakao payloads
- Handle callback delivery
- Keep channel-specific logic separate from OpenClaw core logic

### 3. Policy Layer

Responsibilities:

- Pairing and allowlist rules
- Admin/user role separation
- Channel-specific permissions
- Tool-level permissions

### 4. Rendering Layer

Responsibilities:

- Text responses
- Kakao cards
- Quick replies
- Image/link rendering
- Fallback plain text

## MVP Scope

### Phase 1

- KakaoTalk webhook receiver
- Immediate ACK response
- Final callback response
- Pairing code auth
- Per-user session storage
- Plain text responses

### Phase 2

- Card rendering
- Quick replies
- Allowlist/admin UI or config
- Tool calls through OpenClaw

### Phase 3

- Rich media
- Better memory handling
- Channel abstraction for future Discord/other adapters

## Security Rules

- Keep KakaoTalk as a thin interface only
- Store secrets outside logs and source control
- Require explicit pairing or allowlist for access
- Keep tool permissions minimal
- Separate admin and normal-user paths

## Suggested Work Folder

Use this folder as the project workspace:

- `/home/minsang/Documents/Workspaces/yellow-claw`

## OpenClaw Plugin Alignment

This project should be implemented as an OpenClaw plugin, not as a standalone chatbot.

Recommended OpenClaw-facing responsibilities:

- Register the KakaoTalk channel as a plugin entry
- Keep configuration under `plugins.entries.<id>.config`
- Use OpenClaw plugin installation, inspection, and restart flows
- Let OpenClaw own context, memory, permissions, and tool execution
- Keep KakaoTalk limited to transport, rendering, and callback delivery

## Notes

- Reference repository: `tornado1014/clawdbot-kakaotalk`
- Official Kakao docs: chatbot / skill / callback / context / authority
- Final goal: a Kakao channel frontend powered by OpenClaw on the Intel Mac mini
