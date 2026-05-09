import type { YellowClawAuthState, YellowClawPolicy } from '../types';

export const defaultPolicy: YellowClawPolicy = {
  adminOnlyTools: true,
  allowlistOnly: true,
  allowedUsers: [],
};

export function isAdminUser(userId: string, policy: YellowClawPolicy): boolean {
  return policy.adminOnlyTools && policy.allowedUsers.includes(userId);
}

export function isUserAllowed(userId: string, policy: YellowClawPolicy): boolean {
  if (!policy.allowlistOnly) return true;
  return policy.allowedUsers.includes(userId);
}

export function evaluateAuthState(
  userId: string,
  policy: YellowClawPolicy,
): YellowClawAuthState {
  const allowed = isUserAllowed(userId, policy);
  return {
    userId,
    role: isAdminUser(userId, policy) ? 'admin' : 'user',
    paired: allowed,
    allowed,
  };
}
