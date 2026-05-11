// Relay URL normalization utilities — used by channel/config.ts setup adapter.

export function normalizeRelayUrl(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\/$/, '');
}

export function validateRelayUrl(value?: string): string | undefined {
  const normalized = normalizeRelayUrl(value);
  if (!normalized) return undefined;

  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    throw new Error(`Invalid relayUrl: ${normalized}`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('relayUrl must use http or https');
  }
  return normalized;
}
