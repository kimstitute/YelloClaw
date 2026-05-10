import { configureRelayAdapter } from './adapters/relay';
import { YellowClawRuntime } from './plugin-runtime';
import { loadPluginConfigFromEnv } from './config';
import type { YellowClawPluginConfig } from './types';

/**
 * Bootstrap module for YellowClaw plugin.
 * Optional: Use this to initialize core policy + relay adapter state before OpenClaw calls it.
 */
export async function bootstrap(config?: YellowClawPluginConfig): Promise<void> {
  const resolved = config ?? loadPluginConfigFromEnv();
  YellowClawRuntime.configure(resolved);
  configureRelayAdapter(resolved);
}

export async function bootstrapAndGetRelayAdapter(config?: YellowClawPluginConfig) {
  const resolved = config ?? loadPluginConfigFromEnv();
  YellowClawRuntime.configure(resolved);
  return configureRelayAdapter(resolved);
}
