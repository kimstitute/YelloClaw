import { YellowClawRuntime } from './plugin-runtime';
import { loadPluginConfigFromEnv } from './config';
import type { YellowClawPluginConfig } from './types';

/**
 * Bootstrap module for YellowClaw plugin.
 * Optional: Use this to initialize the runtime with custom configuration before OpenClaw calls it.
 */
export async function bootstrap(config?: YellowClawPluginConfig): Promise<void> {
  YellowClawRuntime.configure(config ?? loadPluginConfigFromEnv());
}

export async function bootstrapAndGetRuntime(config?: YellowClawPluginConfig) {
  await bootstrap(config);
  return YellowClawRuntime;
}

export async function cleanupExpiredSessions(): Promise<number> {
  return 0;
}
