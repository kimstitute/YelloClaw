export type ChannelName = 'kakao';

export interface KakaoSkillPayload {
  bot?: KakaoSkillBot;
  intent?: KakaoSkillIntent;
  action?: KakaoSkillAction;
  userRequest: KakaoUserRequest;
  contexts?: KakaoContext[];
}

export interface KakaoSkillBot {
  id?: string;
  name?: string;
}

export interface KakaoSkillIntent {
  id?: string;
  name?: string;
  category?: string;
  analysis?: Record<string, unknown>;
}

export interface KakaoSkillAction {
  id?: string;
  name?: string;
  clientExtra?: Record<string, unknown>;
  params?: Record<string, unknown>;
  detailParams?: Record<string, unknown>;
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
  type?: string;
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

export interface KakaoSkillResponse {
  version: '2.0';
  useCallback: true;
  template: KakaoTemplateEnvelope;
  context?: KakaoContextEnvelope;
  data?: Record<string, unknown>;
}

export interface KakaoTemplateEnvelope {
  outputs: KakaoOutput[];
  quickReplies?: KakaoQuickReply[];
}

export type KakaoOutput =
  | KakaoTextCardOutput
  | KakaoBasicCardOutput
  | KakaoListCardOutput;

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
      fixedRatio?: boolean;
      link?: {
        web?: string;
        mobile?: string;
      };
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
  link?: {
    web?: string;
    mobile?: string;
  };
  action?: 'message' | 'block';
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

export interface KakaoCallbackRequest extends KakaoSkillResponse {
  // Same JSON shape as the skill response, posted to callbackUrl
}

export interface KakaoCallbackResponse {
  taskId: string;
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message?: string;
  timestamp?: number;
}

export interface YellowClawInboundMessage {
  channel: ChannelName;
  userId: string;
  text: string;
  raw: KakaoSkillPayload;
  callbackUrl?: string;
}

export interface YellowClawConversationContext {
  userId: string;
  channel: ChannelName;
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

export interface YellowClawPolicy {
  adminOnlyTools: boolean;
  allowlistOnly: boolean;
  allowedUsers: string[];
}

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
  channel: ChannelName;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  state: Record<string, unknown>;
}

export interface YellowClawMessageRecord {
  messageId: string;
  sessionId: string;
  userId: string;
  channel: ChannelName;
  text: string;
  createdAt: string;
  direction: 'inbound' | 'outbound';
}

export interface KakaoRelayNormalizedMessage {
  userId: string;
  text: string;
  channelId: string;
}

export interface KakaoRelayInboundMessage {
  id: string;
  conversationKey: string;
  timestamp: number;
  kakaoPayload: KakaoSkillPayload;
  normalized: KakaoRelayNormalizedMessage;
  callbackUrl: string;
  callbackExpiresAt: number;
}

export interface KakaoRelayMessagesResponse {
  messages: KakaoRelayInboundMessage[];
  cursor?: string;
  hasMore: boolean;
}

export interface KakaoRelayReplyRequest {
  messageId: string;
  conversationKey: string;
  response: KakaoSkillResponse;
}

export interface KakaoRelayReplyResponse {
  success: boolean;
  deliveredAt?: number;
}

export interface KakaoRelayAckResponse {
  acknowledged: number;
}

export interface KakaoRelayPairingResponse {
  code: string;
  expiresAt: number;
}

export interface KakaoRelayPollOptions {
  cursor?: string;
  waitMs?: number;
  limit?: number;
}

export interface YellowClawRuntimeStatus {
  configured: boolean;
  hasApp: boolean;
  hasRelayClient: boolean;
  relayUrl?: string;
  relayTokenConfigured: boolean;
  channelId?: string;
}
