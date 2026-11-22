/**
 * /api/user — Backward-compatible alias for /api/auth/me
 * Ensures existing and legacy frontend calls to /api/user work reliably.
 */
export { GET, PUT, PATCH } from '@/app/api/auth/me/route';
