import { describe, expect, it } from 'vitest';
import * as entrypoint from './entrypoint';

describe('entrypoint surface', () => {
  it('exports only the stable public surface', () => {
    expect(Object.keys(entrypoint).sort()).toEqual([
      'bootstrap',
      'getApp',
      'handleCallbackRequest',
      'handleSkillRequest',
    ]);
  });

  it('does not export runtime-only helpers', () => {
    expect('handleCallbackFlow' in entrypoint).toBe(false);
  });
});
