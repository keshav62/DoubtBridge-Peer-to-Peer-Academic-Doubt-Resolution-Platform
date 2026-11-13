/**
 * Role-Based Access Control (RBAC) & Permissions
 * ───────────────────────────────────────────────
 * All authorization logic lives here so API routes stay thin.
 * Rules are enforced server-side only. Never trust client-provided roles.
 */

export const ROLES = {
  STUDENT: 'STUDENT',
  HELPER: 'HELPER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
};

// ─── Primitive role checks ────────────────────────────────────────────────────

export function isAdmin(user) {
  return user?.role === ROLES.ADMIN;
}

export function isModerator(user) {
  return user?.role === ROLES.MODERATOR || user?.role === ROLES.ADMIN;
}

export function isHelper(user) {
  return user?.role === ROLES.HELPER || user?.role === ROLES.ADMIN;
}

export function isStudent(user) {
  return Boolean(user?.role); // any authenticated role can submit answers / bookmarks
}

// ─── Composite guards (throw or return false) ─────────────────────────────────

/**
 * requireAuth — throws a structured error when user is null/undefined.
 * API routes can call this and catch with a 401 response.
 */
export function requireAuth(user) {
  if (!user || !user.id) {
    const err = new Error('Authentication required.');
    err.status = 401;
    throw err;
  }
  return user;
}

/**
 * requireRole — throws 403 when the user lacks one of the allowed roles.
 * @param {object} user
 * @param {string[]} allowedRoles
 */
export function requireRole(user, allowedRoles) {
  requireAuth(user);
  if (!allowedRoles.includes(user.role)) {
    const err = new Error('You do not have permission to perform this action.');
    err.status = 403;
    throw err;
  }
  return user;
}

/**
 * requireOwnerOrAdmin — throws 403 when the user is neither the resource owner
 * nor an admin.
 * @param {object} user
 * @param {string} ownerId
 */
export function requireOwnerOrAdmin(user, ownerId) {
  requireAuth(user);
  if (user.id !== ownerId && !isAdmin(user)) {
    const err = new Error('You do not have permission to access this resource.');
    err.status = 403;
    throw err;
  }
  return user;
}

// ─── Domain-specific permission predicates ────────────────────────────────────

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
  const admin = user.role === ROLES.ADMIN;
  if (!isOwner && !admin) return false;
  if (answer.status !== 'APPROVED') return false;
  if (answer.authorId === user.id && !admin) return false; // no self-accept
  return true;
}

export function canCreateKnowledge(user) {
  return Boolean(user && user.id);
}

export function canEditKnowledge(user, resource) {
  if (!user || !resource) return false;
  return user.id === resource.authorId || user.role === ROLES.ADMIN;
}

export function canDeleteKnowledge(user, resource) {
  if (!user || !resource) return false;
  return user.id === resource.authorId || user.role === ROLES.ADMIN;
}

export function canReviewKnowledge(user, resource) {
  if (!user || !resource) return false;
  const isPrivileged = user.role === ROLES.MODERATOR || user.role === ROLES.ADMIN;
  if (!isPrivileged) return false;
  if (user.id === resource.authorId && user.role !== ROLES.ADMIN) return false;
  return true;
}

// ─── Role escalation guard ────────────────────────────────────────────────────

/**
 * Sanitises a role value submitted by the client.
 * Never allows MODERATOR or ADMIN to be assigned via public registration.
 * Returns 'STUDENT' (safe default) when the value is not publicly assignable.
 * @param {string|undefined} requestedRole
 * @returns {'STUDENT'|'HELPER'}
 */
export function sanitisePublicRole(requestedRole) {
  if (requestedRole === ROLES.HELPER) return ROLES.HELPER;
  return ROLES.STUDENT; // default safe value
}

/**
 * Returns true when user is allowed to change another user's role.
 * Only ADMINs may do this, and they cannot change their own role.
 */
export function canChangeUserRole(actor, targetUserId) {
  if (!actor || !targetUserId) return false;
  if (!isAdmin(actor)) return false;
  if (actor.id === targetUserId) return false; // cannot self-escalate
  return true;
}
