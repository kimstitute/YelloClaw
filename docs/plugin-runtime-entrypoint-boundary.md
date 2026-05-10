# Runtime / Entrypoint / Bootstrap Responsibility Boundary

## Current Problem

Three files (`plugin-runtime.ts`, `entrypoint.ts`, `plugin-bootstrap.ts`) have overlapping responsibilities:

1. **app instance management** - created in multiple places
2. **Skill request handlers** - defined in both runtime and entrypoint
3. **immediate response building** - duplicated logic

Result: Unclear which file to call from OpenClaw, session state inconsistency, potential circular dependencies.

## Proposed Responsibility Model

### 1. **plugin-runtime.ts** = Orchestration Logic (Shared)

**Purpose:** Core orchestration that can be reused by any entry point.

**Responsibilities:**
- Manage **singleton app instance** (created once, reused)
- Implement core skill request flow:
  1. Parse inbound message
  2. Check access policy
  3. Render response
  4. Build callback
- Export handler functions for use by any runtime

**Exports:**
```typescript
export class YellowClawRuntime {
  private static instance: YellowClawApp;
  
  static getApp(): YellowClawApp { /* singleton */ }
  static handleSkillRequest(payload): KakaoSkillResponse { /* immediate */ }
  static async handleCallbackFlow(payload, result): Promise<Response> { /* callback */ }
}
```

**Why:** Ensures single app instance, clear singleton pattern, reusable orchestration.

---

### 2. **entrypoint.ts** = Public Handler Surface (Thin)

**Purpose:** Thin adapter for OpenClaw plugin interface.

**Responsibilities:**
- Re-export `YellowClawRuntime` methods
- Optionally add OpenClaw-specific logic (logging, metrics, error handling)
- Define the public interface that OpenClaw calls

**Exports:**
```typescript
export { YellowClawRuntime };

// Optional: OpenClaw-specific wrapper
export async function handleOpenClawSkillRequest(payload) {
  return YellowClawRuntime.handleSkillRequest(payload);
}
```

**Why:** Single entry point for OpenClaw. Prevents multiple entry points causing confusion.

---

### 3. **plugin-bootstrap.ts** = Configuration & Initialization (If Needed)

**Purpose:** Load configuration, initialize runtime, prepare for deployment.

**Responsibilities:**
- Load plugin config from environment or file
- Initialize SessionManager with TTL settings
- Optional: periodic cleanup tasks
- Bootstrap the runtime before OpenClaw calls it

**Exports:**
```typescript
export async function bootstrap(config?: YellowClawPluginConfig) {
  // Load config if not provided
  // Initialize app with config
  // Return ready-to-use runtime
}
```

**Why:** Separates initialization logic from runtime logic. Clearer lifecycle.

---

### 4. **index.ts** = Core App (Unchanged)

**Purpose:** Business logic that doesn't care about transport.

**Responsibilities:**
- `YellowClawApp` class
- Session management
- Policy evaluation
- Rendering

**Why:** Keep it pure. It should be testable without Kakao or OpenClaw context.

---

## Dependency Flow

```
OpenClaw
   ↓
entrypoint.ts
   ↓
plugin-runtime.ts (YellowClawRuntime singleton)
   ↓
index.ts (YellowClawApp core logic)
   ↓
session-manager.ts, policy/, renderers/
```

**Key points:**
- No circular dependencies
- Single app instance
- Clear entry point for OpenClaw
- Orchestration logic in runtime, not bootstrap
- Bootstrap optional but recommended

---

## Migration Steps

1. Refactor `plugin-runtime.ts` → `YellowClawRuntime` class with singleton pattern
2. Update `entrypoint.ts` to re-export runtime methods (thin wrapper)
3. Optional: Create `bootstrap()` function in plugin-bootstrap.ts
4. Remove duplicate `handleSkillRequest()` and `buildImmediateResponse()` definitions
5. Update docs: `entrypoint-runtime.md`, `app-entrypoint-integration.md`

---

## Examples

### Before
```typescript
// plugin-runtime.ts
const app = new YellowClawApp();
export function getApp() { return app; }
export function handleSkillRequest() { /* ... */ }

// entrypoint.ts
import { getApp, handleSkillRequest as runtimeHandler } from './plugin-runtime';
export function handleSkillRequest() { return runtimeHandler(); }
// Redundant!

// plugin-bootstrap.ts
const app = new YellowClawApp(); // Another instance!
export function handleKakaoSkill() { /* ... */ }
```

### After
```typescript
// plugin-runtime.ts
export class YellowClawRuntime {
  private static instance: YellowClawApp;
  static getApp() { return this.instance ||= new YellowClawApp(); }
  static handleSkillRequest(payload) { /* ... */ }
  static async handleCallbackFlow(payload, result) { /* ... */ }
}

// entrypoint.ts
export const { handleSkillRequest, handleCallbackFlow, getApp } = YellowClawRuntime;
// Or: OpenClaw plugin calls entrypoint directly

// plugin-bootstrap.ts
export async function bootstrap(config) { /* optional init */ }

// index.ts
export class YellowClawApp { /* unchanged */ }
```

---

## Notes

- This boundary assumes OpenClaw calls through `entrypoint.ts`
- If OpenClaw allows multiple entry points, keep them separate but all using same `YellowClawRuntime`
- SessionManager TTL should be initialized in bootstrap or runtime constructor
- All immediate responses should go through `YellowClawRuntime.buildImmediateResponse()` to avoid duplication
