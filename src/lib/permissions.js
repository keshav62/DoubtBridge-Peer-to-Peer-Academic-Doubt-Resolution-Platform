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

export function canAcceptAnswer(user, doubt, answer) {
  if (!user || !doubt || !answer) return false;
  const isOwner = user.id === doubt.studentId;
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) return false;
  if (answer.status !== 'APPROVED') return false;
  if (answer.authorId === user.id && !isAdmin) return false;
  return true;
}
