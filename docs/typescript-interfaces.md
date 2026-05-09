# TypeScript Interface Drafts for YellowClaw

This document drafts the core TypeScript interfaces needed for YellowClaw implementation.

## 1) Kakao Inbound Contract

```ts
export interface KakaoSkillPayload {
  bot?: unknown;
  intent?: unknown;
  action?: unknown;
  userRequest: KakaoUserRequest;
  contexts?: KakaoContext[];
}

export interface KakaoUserRequest {
  callbackUrl?: string;
  block?: KakaoBlock;
  user?: KakaoUserIdentity;
  utterance: string;
  params?: Record<string, unknown>;
  lang?: string;
  timezone?: string;
}

export interface KakaoUserIdentity {
  id?: string;
  properties?: Record<string, unknown>;
}

export interface KakaoBlock {
  id?: string;
  name?: string;
  params?: Record<string, unknown>;
}

export interface KakaoContext {
  name: string;
  lifeSpan: number;
  params?: Record<string, unknown>;
}
```

## 2) Kakao Immediate Response

```ts
export interface KakaoSkillResponse {
  version: '2.0';
  useCallback: true;
  template: KakaoTemplateEnvelope;
  context?: KakaoContextEnvelope;
  data?: Record<string, unknown>;
}

export interface KakaoTemplateEnvelope {
  outputs?: KakaoOutput[];
  quickReplies?: KakaoQuickReply[];
}

export type KakaoOutput = KakaoTextCardOutput | KakaoBasicCardOutput | KakaoListCardOutput;

export interface KakaoTextCardOutput {
  textCard: {
    title?: string;
    description?: string;
    buttons?: KakaoButton[];
    buttonLayout?: 'horizontal' | 'vertical';
  };
}

export interface KakaoBasicCardOutput {
  basicCard: {
    title?: string;
    description?: string;
    thumbnail: {
      imageUrl: string;
    };
    buttons?: KakaoButton[];
    buttonLayout?: 'horizontal' | 'vertical';
  };
}

export interface KakaoListCardOutput {
  listCard: {
    header: {
      title: string;
    };
    items: KakaoListCardItem[];
    buttons?: KakaoButton[];
    buttonLayout?: 'horizontal' | 'vertical';
  };
}

export interface KakaoListCardItem {
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  action?: string;
  blockId?: string;
  messageText?: string;
  extra?: Record<string, unknown>;
}

export interface KakaoQuickReply {
  label: string;
  action: 'message' | 'block';
  messageText?: string;
  blockId?: string;
  extra?: Record<string, unknown>;
}

export interface KakaoButton {
  label: string;
  action: 'webLink' | 'message' | 'phone' | 'block' | 'share';
  webLinkUrl?: string;
  messageText?: string;
  phoneNumber?: string;
  blockId?: string;
  extra?: Record<string, unknown>;
}

export interface KakaoContextEnvelope {
  values: KakaoContext[];
}
```

## 3) Kakao Callback Delivery

```ts
export interface KakaoCallbackRequest extends KakaoSkillResponse {
  // Same JSON shape as the skill response, posted to callbackUrl
}

export interface KakaoCallbackResponse {
  taskId: string;
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message?: string;
  timestamp?: number;
}
```

## 4) YellowClaw Core Event Model

```ts
export interface YellowClawInboundMessage {
  channel: 'kakao';
  userId: string;
  text: string;
  raw: KakaoSkillPayload;
  callbackUrl?: string;
}

export interface YellowClawConversationContext {
  userId: string;
  channel: 'kakao';
  sessionId: string;
  updatedAt: string;
  ttlSeconds?: number;
  state: Record<string, unknown>;
}

export interface YellowClawAuthState {
  userId: string;
  role: 'admin' | 'user';
  paired: boolean;
  allowed: boolean;
}

export interface YellowClawCallbackJob {
  callbackUrl: string;
  payload: KakaoCallbackRequest;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  updatedAt?: string;
}

export interface YellowClawTransportEnvelope {
  inbound: YellowClawInboundMessage;
  callback?: YellowClawCallbackJob;
}

export interface YellowClawUserProfile {
  userId: string;
  displayName?: string;
  role: 'admin' | 'user';
  paired: boolean;
  allowed: boolean;
}

export interface YellowClawSessionRecord {
  sessionId: string;
  userId: string;
  channel: 'kakao';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  state: Record<string, unknown>;
}

export interface YellowClawMessageRecord {
  messageId: string;
  sessionId: string;
  userId: string;
  channel: 'kakao';
  text: string;
  createdAt: string;
  direction: 'inbound' | 'outbound';
}
```

## 5) Tooling and Rendering

```ts
export interface YellowClawToolCall {
  toolName: string;
  args: Record<string, unknown>;
  requestedBy: string;
}

export interface YellowClawRenderRequest {
  format: 'text' | 'card';
  markdown?: string;
  text?: string;
  data?: Record<string, unknown>;
}

export interface YellowClawRenderResult {
  text?: string;
  cards?: KakaoOutput[];
  quickReplies?: KakaoQuickReply[];
}
```

## 6) Policy Model

```ts
export interface YellowClawPolicy {
  adminOnlyTools: boolean;
  allowlistOnly: boolean;
  allowedUsers: string[];
}
```

## 7) Plugin Configuration Model

```ts
export interface YellowClawPluginConfig {
  kakao: {
    enabled: boolean;
    channelId?: string;
    relayUrl?: string;
    relayToken?: string;
  };
  auth: {
    pairingRequired: boolean;
    adminUserId: string;
  };
  policy: YellowClawPolicy;
}
```

## 8) Notes

- These interfaces are drafts and should be aligned with the Kakao contracts document.
- Keep the core model channel-agnostic where possible.
- Add concrete card types after the Kakao card JSON schema is finalized.
