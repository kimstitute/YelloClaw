import { YellowClawRuntime } from './plugin-runtime';
import type {
  KakaoRelayInboundMessage,
  KakaoRelayMessagesResponse,
  KakaoRelayPairingResponse,
  KakaoRelayPollOptions,
  KakaoRelayReplyResponse,
  KakaoSkillPayload,
  KakaoSkillResponse,
  YellowClawPluginConfig,
  YellowClawRenderResult,
  YellowClawInboundMessage,
} from './types';

type YellowClawAppInstance = ReturnType<typeof YellowClawRuntime.getApp>;

/**
 * Public entrypoint for OpenClaw plugin interface.
 * All calls from OpenClaw should go through these functions.
 */
export async function handleSkillRequest(
  payload: KakaoSkillPayload,
): Promise<KakaoSkillResponse> {
  return YellowClawRuntime.handleSkillRequest(payload);
}

export async function handleCallbackRequest(
  payload: KakaoSkillPayload,
  result: YellowClawRenderResult,
): Promise<Response | undefined> {
  return YellowClawRuntime.handleCallbackFlow(payload, result);
}

export async function pollRelayMessages(
  options?: KakaoRelayPollOptions,
): Promise<KakaoRelayMessagesResponse> {
  return YellowClawRuntime.pollRelayMessages(options);
}

export async function sendRelayReply(
  message: KakaoRelayInboundMessage,
  result: YellowClawRenderResult,
): Promise<KakaoRelayReplyResponse> {
  return YellowClawRuntime.sendRelayReply(message, result);
}

export async function ackRelayMessages(messageIds: string[]): Promise<{ acknowledged: number }> {
  return YellowClawRuntime.ackRelayMessages(messageIds);
}

export async function pollRelayInbox(
  options?: KakaoRelayPollOptions,
): Promise<YellowClawInboundMessage[]> {
  return YellowClawRuntime.pollRelayInbox(options);
}

export async function processRelayInbox(
  options?: KakaoRelayPollOptions,
  resolver?: (message: YellowClawInboundMessage, app: YellowClawAppInstance) => Promise<YellowClawRenderResult> | YellowClawRenderResult,
): Promise<{ processed: number; messageIds: string[] }> {
  return YellowClawRuntime.processRelayInbox(options, resolver);
}

export async function generatePairingCode(
  expirySeconds = 600,
  metadata: Record<string, unknown> = {},
): Promise<KakaoRelayPairingResponse> {
  return YellowClawRuntime.generatePairingCode(expirySeconds, metadata);
}

export async function bootstrap(config?: YellowClawPluginConfig): Promise<void> {
  YellowClawRuntime.configure(config);
}

export const getApp = YellowClawRuntime.getApp;
