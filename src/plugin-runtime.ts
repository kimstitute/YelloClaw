import { YellowClawApp } from './index';
import { loadPluginConfigFromEnv, mergeYellowClawConfig } from './config';
import {
  KakaoRelayClient,
  resolveConversationKey,
  toKakaoCallbackRequest,
  toKakaoImmediateResponse,
  toYellowClawInboundMessageFromRelay,
} from './channel-adapters/kakao';
import { buildCallbackPayload, postKakaoCallback } from './callback';
import type {
  KakaoRelayAckResponse,
  KakaoRelayInboundMessage,
  KakaoRelayHealthResponse,
  KakaoRelayMessagesResponse,
  KakaoRelayPairingResponse,
  KakaoRelayPollOptions,
  KakaoRelayReplyResponse,
  YellowClawInboundMessage,
  YellowClawRelayReadinessReport,
  KakaoSkillPayload,
  KakaoSkillResponse,
  YellowClawPluginConfig,
  YellowClawRenderResult,
  YellowClawRuntimeStatus,
} from './types';

/**
 * YellowClawRuntime
 *
 * Singleton orchestration layer for YellowClaw.
 * Manages the app instance, relay client, and skill request handlers.
 */
export class YellowClawRuntime {
  private static instance: YellowClawApp | null = null;
  private static config: YellowClawPluginConfig | null = null;
  private static relayClient: KakaoRelayClient | null = null;

  static configure(config?: YellowClawPluginConfig): void {
    const effectiveConfig = mergeYellowClawConfig(loadPluginConfigFromEnv() ?? undefined, config);
    this.config = effectiveConfig;

    const relayUrl = effectiveConfig.kakao.relayUrl?.trim();
    const relayToken = effectiveConfig.kakao.relayToken?.trim();
    this.relayClient = relayUrl && relayToken ? new KakaoRelayClient(relayUrl, relayToken) : null;
  }

  static getConfig(): YellowClawPluginConfig | null {
    return this.config;
  }

  static getRelayClient(): KakaoRelayClient | null {
    return this.relayClient;
  }

  static async probeRelayHealth(): Promise<KakaoRelayHealthResponse> {
    if (!this.relayClient) {
      throw new Error('Relay client is not configured.');
    }
    return this.relayClient.probeHealth();
  }

  static async getRelayReadinessReport(): Promise<YellowClawRelayReadinessReport> {
    const status = this.getStatus();
    const issues: string[] = [];

    if (!status.configured) issues.push('runtime-not-configured');
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
    } catch (error) {
      issues.push('health-probe-failed');
      return { status, canProbeHealth: true, issues };
    }
  }

  static getStatus(): YellowClawRuntimeStatus {
    return {
      configured: this.config !== null,
      hasApp: this.instance !== null,
      hasRelayClient: this.relayClient !== null,
      relayUrl: this.config?.kakao.relayUrl,
      relayTokenConfigured: Boolean(this.config?.kakao.relayToken),
      channelId: this.config?.kakao.channelId,
    };
  }

  static getApp(): YellowClawApp {
    if (!this.instance) {
      this.instance = new YellowClawApp();
    }
    return this.instance;
  }

  static reset(): void {
    this.instance = null;
    this.config = null;
    this.relayClient = null;
  }

  static buildImmediateResponse(inboundText: string): KakaoSkillResponse {
    return toKakaoImmediateResponse(inboundText || '잠시만 기다려줘.');
  }

  static handleSkillRequest(payload: KakaoSkillPayload): KakaoSkillResponse {
    const app = this.getApp();
    const inbound = app.handleInbound(payload);
    return this.buildImmediateResponse(inbound.text);
  }

  static async handleCallbackFlow(
    payload: KakaoSkillPayload,
    result: YellowClawRenderResult,
  ): Promise<Response | undefined> {
    const callbackUrl = payload.userRequest.callbackUrl;
    if (!callbackUrl) return undefined;

    const callbackPayload = buildCallbackPayload(result);
    return postKakaoCallback(callbackUrl, callbackPayload);
  }

  static resolveConversationKey(payload: KakaoSkillPayload): string {
    return resolveConversationKey(payload, this.config?.kakao.channelId);
  }

  static async pollRelayMessages(
    options: KakaoRelayPollOptions = {},
  ): Promise<KakaoRelayMessagesResponse> {
    if (!this.relayClient) {
      throw new Error('Relay client is not configured.');
    }
    return this.relayClient.pollMessages(options);
  }

  static async pollRelayInbox(
    options: KakaoRelayPollOptions = {},
  ): Promise<YellowClawInboundMessage[]> {
    const messages = await this.pollRelayMessages(options);
    return messages.messages.map(toYellowClawInboundMessageFromRelay);
  }

  static async processRelayInbox(
    options: KakaoRelayPollOptions = {},
    resolver?: (message: YellowClawInboundMessage, app: YellowClawApp) => Promise<YellowClawRenderResult> | YellowClawRenderResult,
  ): Promise<{ processed: number; messageIds: string[] }> {
    const relayMessages = await this.pollRelayMessages(options);
    const app = this.getApp();
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

  static async sendRelayReply(
    message: KakaoRelayInboundMessage,
    result: YellowClawRenderResult,
  ): Promise<KakaoRelayReplyResponse> {
    if (!this.relayClient) {
      throw new Error('Relay client is not configured.');
    }

    return this.relayClient.sendReply({
      messageId: message.id,
      conversationKey: message.conversationKey,
      response: toKakaoCallbackRequest(result),
    });
  }

  static async ackRelayMessages(messageIds: string[]): Promise<KakaoRelayAckResponse> {
    if (!this.relayClient) {
      throw new Error('Relay client is not configured.');
    }
    return this.relayClient.ackMessages(messageIds);
  }

  static async generatePairingCode(
    expirySeconds = 600,
    metadata: Record<string, unknown> = {},
  ): Promise<KakaoRelayPairingResponse> {
    if (!this.relayClient) {
      throw new Error('Relay client is not configured.');
    }
    return this.relayClient.generatePairingCode(expirySeconds, metadata);
  }
}
