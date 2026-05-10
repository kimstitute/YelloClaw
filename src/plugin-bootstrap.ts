import { configureRelayAdapter } from './adapters/relay';
import { loadPluginConfigFromEnv } from './config';
import type { YellowClawPluginConfig } from './types';

/**
 * Bootstrap module for YellowClaw plugin.
 * Optional: Use this to initialize relay adapter state before OpenClaw calls it.
 */
export async function bootstrap(config?: YellowClawPluginConfig): Promise<void> {
  configureRelayAdapter(config ?? loadPluginConfigFromEnv());
}

export async function bootstrapAndGetRelayAdapter(config?: YellowClawPluginConfig) {
  return configureRelayAdapter(config ?? loadPluginConfigFromEnv());
}
