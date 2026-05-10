import { describe, expect, it } from 'vitest';
import { YellowClawApp } from './index';
import type { YellowClawPolicy } from './types';

describe('YellowClawApp', () => {
  it('uses configured policy for access checks', () => {
    const policy: YellowClawPolicy = {
      adminOnlyTools: true,
      allowlistOnly: true,
      allowedUsers: ['allowed-user'],
    };

    const app = new YellowClawApp(policy);

    expect(app.canAccess('allowed-user')).toBe(true);
    expect(app.canAccess('blocked-user')).toBe(false);
  });

  it('renders text fallback when no cards are provided', () => {
    const app = new YellowClawApp();

    const result = app.render({ text: 'hello' });

    expect(result.text).toBe('hello');
    expect(result.cards?.length).toBe(1);
    const output = result.cards?.[0] as any;
    expect(output.textCard?.title).toBe('hello');
  });

  it('renders card mode with text fallback', () => {
    const app = new YellowClawApp();

    const result = app.render({
      text: 'hello',
      cards: [{ textCard: { title: 'existing card' } }],
    });

    expect(result.cards?.length).toBeGreaterThan(0);
  });
});
