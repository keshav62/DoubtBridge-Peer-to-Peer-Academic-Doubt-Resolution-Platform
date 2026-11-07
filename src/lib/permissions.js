/**
 * Role-Based Access Control (RBAC) & Permissions
 */

export const ROLES = {
  STUDENT: 'STUDENT',
  HELPER: 'HELPER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
};

export function canClaimDoubt(user) {
  if (!user) return false;
  return user.role === ROLES.HELPER || user.role === ROLES.ADMIN;
}

export function canModerate(user) {
  if (!user) return false;
  return user.role === ROLES.MODERATOR || user.role === ROLES.ADMIN;
}

export function canResolveDoubt(user, doubt) {
  if (!user || !doubt) return false;
  return user.id === doubt.studentId || user.role === ROLES.ADMIN;
}

export function canManageHelperProfile(user) {
  if (!user) return false;
  return user.role === ROLES.HELPER;
}
