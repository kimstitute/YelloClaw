import { describe, expect, it } from 'vitest';
import { defaultPolicy, evaluateAuthState, isAdminUser, isUserAllowed } from './policy';

describe('policy', () => {
  it('treats allowlist as the source of allowed access', () => {
    const policy = {
      ...defaultPolicy,
      allowlistOnly: true,
      allowedUsers: ['allowed-user'],
    };

    expect(isUserAllowed('allowed-user', policy)).toBe(true);
    expect(isUserAllowed('blocked-user', policy)).toBe(false);
  });

  it('lets non-allowlist mode bypass the allowlist gate', () => {
    const policy = {
      ...defaultPolicy,
      allowlistOnly: false,
      allowedUsers: [],
    };

    expect(isUserAllowed('any-user', policy)).toBe(true);
  });

  it('treats admin identity as explicit and separate from allowlist membership', () => {
    const policy = {
      ...defaultPolicy,
      adminOnlyTools: true,
      adminUserId: 'admin-1',
      allowedUsers: ['allowed-user'],
    };

    expect(isAdminUser('admin-1', policy)).toBe(true);
    expect(isAdminUser('allowed-user', policy)).toBe(false);
  });

  it('derives auth state from policy and admin identity', () => {
    const policy = {
      ...defaultPolicy,
      adminOnlyTools: true,
      adminUserId: 'admin-1',
      allowlistOnly: true,
      allowedUsers: ['admin-1'],
    };

    expect(evaluateAuthState('admin-1', policy)).toEqual({
      userId: 'admin-1',
      role: 'admin',
      paired: true,
      allowed: true,
    });
  });

  it('keeps admin role separate from allowlist access', () => {
    const policy = {
      ...defaultPolicy,
      adminOnlyTools: true,
      adminUserId: 'admin-1',
      allowlistOnly: true,
      allowedUsers: ['allowed-user'],
    };

    expect(evaluateAuthState('admin-1', policy)).toEqual({
      userId: 'admin-1',
      role: 'admin',
      paired: false,
      allowed: false,
    });
  });
});
