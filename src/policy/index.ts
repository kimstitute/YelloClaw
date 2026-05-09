import type { YellowClawAuthState, YellowClawPolicy } from '../types';

export const defaultPolicy: YellowClawPolicy = {
  adminOnlyTools: true,
  allowlistOnly: true,
  allowedUsers: [],
};

export function isAdminUser(userId: string, policy: YellowClawPolicy): boolean {
  return policy.allowedUsers.includes(userId) && policy.adminOnlyTools;
}

export function isUserAllowed(userId: string, policy: YellowClawPolicy): boolean {
  if (!policy.allowlistOnly) return true;
  return policy.allowedUsers.includes(userId);
}

export function evaluateAuthState(
  userId: string,
  policy: YellowClawPolicy,
): YellowClawAuthState {
  return {
    userId,
    role: isAdminUser(userId, policy) ? 'admin' : 'user',
    paired: isUserAllowed(userId, policy),
    allowed: isUserAllowed(userId, policy),
  };
}
