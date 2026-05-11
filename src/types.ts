// KakaoTalk wire format types — inbound skill requests and outbound responses.

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
  utterance: string;
  callbackUrl?: string;
  block?: KakaoBlock;
  user?: KakaoUserIdentity;
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

// Render output type used by renderers/ and callback.ts
export interface YellowClawRenderResult {
  text?: string;
  context?: KakaoContextEnvelope;
  cards?: KakaoOutput[];
  quickReplies?: KakaoQuickReply[];
}

export interface YellowClawRenderRequest {
  format: 'text' | 'card';
  markdown?: string;
  text?: string;
  data?: Record<string, unknown>;
}
