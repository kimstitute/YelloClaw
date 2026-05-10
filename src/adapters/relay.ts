import { YellowClawApp } from '../index';
import { loadPluginConfigFromEnv, mergeYellowClawConfig } from '../config';
import { toKakaoCallbackRequest } from '../channel-adapters/kakao';
import type {
  KakaoCallbackRequest,
  KakaoRelayAckResponse,
  KakaoRelayHealthResponse,
  KakaoRelayInboundMessage,
  KakaoRelayMessagesResponse,
  KakaoRelayPairingResponse,
  KakaoRelayPollOptions,
  KakaoRelayReplyRequest,
  KakaoRelayReplyResponse,
  YellowClawInboundMessage,
  YellowClawPluginConfig,
  YellowClawRelayReadinessReport,
  YellowClawRelayRunResult,
  YellowClawRenderResult,
  YellowClawRuntimeStatus,
} from '../types';

function toYellowClawInboundMessageFromRelay(
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
    const response = await fetch(new URL('/health', this.baseUrl), {
      headers: this.headers,
    });
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

export class YellowClawRelayAdapter {
  private readonly client: KakaoRelayClient | null;

  constructor(private readonly config: YellowClawPluginConfig) {
    const relayUrl = config.kakao.relayUrl?.trim();
    const relayToken = config.kakao.relayToken?.trim();
    this.client = relayUrl && relayToken ? new KakaoRelayClient(relayUrl, relayToken) : null;
  }

  static fromEnvOrConfig(config?: YellowClawPluginConfig): YellowClawRelayAdapter | null {
    const resolved = mergeYellowClawConfig(loadPluginConfigFromEnv() ?? undefined, config);
    if (!resolved.kakao.relayUrl || !resolved.kakao.relayToken) return null;
    return new YellowClawRelayAdapter(resolved);
  }

  getStatus(): YellowClawRuntimeStatus {
    return {
      configured: true,
      hasApp: false,
      hasRelayClient: this.client !== null,
      relayUrl: this.config.kakao.relayUrl,
      relayTokenConfigured: Boolean(this.config.kakao.relayToken),
      channelId: this.config.kakao.channelId,
    };
  }

  async probeRelayHealth(): Promise<KakaoRelayHealthResponse> {
    if (!this.client) {
      throw new Error('Relay client is not configured.');
    }
    return this.client.probeHealth();
  }

  async getRelayReadinessReport(): Promise<YellowClawRelayReadinessReport> {
    const status = this.getStatus();
    const issues: string[] = [];

    if (!status.relayUrl) issues.push('missing-relay-url');
    if (!status.relayTokenConfigured) issues.push('missing-relay-token');
    if (!status.hasRelayClient) issues.push('relay-client-not-ready');

    if (!status.hasRelayClient) {
      return { status, canProbeHealth: false, issues };
    }

    try {
      const health = await this.probeRelayHealth();
      if (health.status && health.status !== 'ok') issues.push(`health-${health.status}`);
      return { status, canProbeHealth: true, health, issues };
    } catch {
      issues.push('health-probe-failed');
      return { status, canProbeHealth: true, issues };
    }
  }

  async pollRelayMessages(
    options: KakaoRelayPollOptions = {},
  ): Promise<KakaoRelayMessagesResponse> {
    if (!this.client) {
      throw new Error('Relay client is not configured.');
    }
    return this.client.pollMessages(options);
  }

  async pollRelayInbox(
    options: KakaoRelayPollOptions = {},
  ): Promise<YellowClawInboundMessage[]> {
    const messages = await this.pollRelayMessages(options);
    return messages.messages.map(toYellowClawInboundMessageFromRelay);
  }

  async sendRelayReply(
    message: KakaoRelayInboundMessage,
    result: YellowClawRenderResult,
  ): Promise<KakaoRelayReplyResponse> {
    if (!this.client) {
      throw new Error('Relay client is not configured.');
    }

    return this.client.sendReply({
      messageId: message.id,
      conversationKey: message.conversationKey,
      response: toKakaoCallbackRequest(result),
    });
  }

  async ackRelayMessages(messageIds: string[]): Promise<KakaoRelayAckResponse> {
    if (!this.client) {
      throw new Error('Relay client is not configured.');
    }
    return this.client.ackMessages(messageIds);
  }

  async processRelayInbox(
    app: YellowClawApp,
    options: KakaoRelayPollOptions = {},
    resolver?: (message: YellowClawInboundMessage, app: YellowClawApp) => Promise<YellowClawRenderResult> | YellowClawRenderResult,
  ): Promise<{ processed: number; messageIds: string[] }> {
    const relayMessages = await this.pollRelayMessages(options);
    const messageIds: string[] = [];

    for (const relayMessage of relayMessages.messages) {
      const inbound = toYellowClawInboundMessageFromRelay(relayMessage);
      app.handleInbound(inbound.raw);
      const result = resolver ? await resolver(inbound, app) : app.render({
        text: inbound.text,
      });

      await this.sendRelayReply(relayMessage, result);
      messageIds.push(relayMessage.id);
    }

    if (messageIds.length > 0) {
      await this.ackRelayMessages(messageIds);
    }

    return { processed: messageIds.length, messageIds };
  }

  async runRelayOnce(
    app: YellowClawApp,
    options: KakaoRelayPollOptions = {},
    resolver?: (message: YellowClawInboundMessage, app: YellowClawApp) => Promise<YellowClawRenderResult> | YellowClawRenderResult,
  ): Promise<YellowClawRelayRunResult> {
    const readiness = await this.getRelayReadinessReport();
    if (readiness.issues.length > 0 || !readiness.canProbeHealth) {
      return { readiness, processed: 0, messageIds: [] };
    }

    const run = await this.processRelayInbox(app, options, resolver);
    return { readiness, ...run };
  }
}

let activeRelayAdapter: YellowClawRelayAdapter | null = null;

export function configureRelayAdapter(config?: YellowClawPluginConfig): YellowClawRelayAdapter | null {
  activeRelayAdapter = YellowClawRelayAdapter.fromEnvOrConfig(config);
  return activeRelayAdapter;
}

export function getRelayAdapter(): YellowClawRelayAdapter | null {
  return activeRelayAdapter;
}
