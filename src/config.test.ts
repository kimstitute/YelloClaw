import { describe, expect, it } from 'vitest';
import { normalizeRelayUrl, validateRelayUrl } from './config';

describe('config', () => {
  it('normalizes relay url trailing slash', () => {
    expect(normalizeRelayUrl('https://example.com/')).toBe('https://example.com');
  });

  it('normalizes relay url with whitespace', () => {
    expect(validateRelayUrl(' https://example.com/ ')).toBe('https://example.com');
  });

  it('returns undefined for empty input', () => {
    expect(normalizeRelayUrl(undefined)).toBeUndefined();
    expect(normalizeRelayUrl('')).toBeUndefined();
  });

  it('throws for invalid protocol', () => {
    expect(() => validateRelayUrl('ftp://example.com')).toThrow('relayUrl must use http or https');
  });
});
