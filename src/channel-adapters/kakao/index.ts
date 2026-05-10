import type {
  KakaoCallbackRequest,
  KakaoRelayAckResponse,
  KakaoRelayInboundMessage,
  KakaoRelayHealthResponse,
  KakaoRelayMessagesResponse,
  KakaoRelayNormalizedMessage,
  KakaoRelayPairingResponse,
  KakaoRelayPollOptions,
  KakaoRelayReplyRequest,
  KakaoRelayReplyResponse,
  KakaoSkillPayload,
  KakaoSkillResponse,
  YellowClawInboundMessage,
  YellowClawRenderResult,
} from '../../types';

export function toYellowClawInboundMessage(
  payload: KakaoSkillPayload,
): YellowClawInboundMessage {
  const userId = payload.userRequest.user?.id ?? 'unknown';
  return {
    channel: 'kakao',
    userId,
    text: payload.userRequest.utterance,
    raw: payload,
    callbackUrl: payload.userRequest.callbackUrl,
  };
}

export function resolveConversationKey(
  payload: KakaoSkillPayload,
  channelId?: string,
): string {
  const userId = payload.userRequest.user?.id ?? 'unknown';
  const resolvedChannelId = channelId ?? payload.userRequest.block?.id ?? 'kakao';
  return `${resolvedChannelId}:${userId}`;
}

export function normalizeRelayMessage(
  message: KakaoRelayInboundMessage,
): KakaoRelayNormalizedMessage {
  return message.normalized;
}

export function toYellowClawInboundMessageFromRelay(
  message: KakaoRelayInboundMessage,
): YellowClawInboundMessage {
  return {
    channel: 'kakao',
    userId: message.normalized.userId,
    text: message.normalized.text,
    raw: message.kakaoPayload,
    callbackUrl: message.callbackUrl,
  };
}

export function toKakaoImmediateResponse(text: string): KakaoSkillResponse {
  return {
    version: '2.0',
    useCallback: true,
    template: {
      outputs: [
        {
          textCard: {
            title: text,
          },
        },
      ],
    },
  };
}

export function toKakaoCallbackRequest(
  result: YellowClawRenderResult,
): KakaoCallbackRequest {
  return {
    version: '2.0',
    useCallback: true,
    template: {
      outputs: result.cards ?? [],
      quickReplies: result.quickReplies ?? [],
    },
    data: result.text ? { text: result.text } : undefined,
  };
}

export class KakaoRelayClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
  ) {}

  private get headers(): HeadersInit {
    return {
      authorization: `Bearer ${this.token}`,
      'content-type': 'application/json',
    };
  }

  async probeHealth(): Promise<KakaoRelayHealthResponse> {
    const response = await fetch(new URL('/health', this.baseUrl), { headers: this.headers });
    if (!response.ok) {
      throw new Error(`Relay health failed: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as KakaoRelayHealthResponse;
  }

  async pollMessages(options: KakaoRelayPollOptions = {}): Promise<KakaoRelayMessagesResponse> {
    const url = new URL('/openclaw/messages', this.baseUrl);
    if (options.cursor) url.searchParams.set('cursor', options.cursor);
    if (typeof options.waitMs === 'number') url.searchParams.set('wait', String(options.waitMs));
    if (typeof options.limit === 'number') url.searchParams.set('limit', String(options.limit));

    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      throw new Error(`Relay poll failed: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as KakaoRelayMessagesResponse;
  }

  async sendReply(request: KakaoRelayReplyRequest): Promise<KakaoRelayReplyResponse> {
    const response = await fetch(new URL('/openclaw/reply', this.baseUrl), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Relay reply failed: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as KakaoRelayReplyResponse;
  }

  async ackMessages(messageIds: string[]): Promise<KakaoRelayAckResponse> {
    const response = await fetch(new URL('/openclaw/messages/ack', this.baseUrl), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ messageIds }),
    });
    if (!response.ok) {
      throw new Error(`Relay ack failed: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as KakaoRelayAckResponse;
  }

  async generatePairingCode(
    expirySeconds = 600,
    metadata: Record<string, unknown> = {},
  ): Promise<KakaoRelayPairingResponse> {
    const response = await fetch(new URL('/openclaw/pairing/generate', this.baseUrl), {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ expirySeconds, metadata }),
    });
    if (!response.ok) {
      throw new Error(`Relay pairing failed: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as KakaoRelayPairingResponse;
  }
}

export async function postKakaoCallback(
  callbackUrl: string,
  request: KakaoCallbackRequest,
): Promise<Response> {
  return fetch(callbackUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(request),
  });
}
