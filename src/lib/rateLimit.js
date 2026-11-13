/**
 * In-memory rate limiter for login and registration endpoints.
 * Resets on server restart; suitable for single-instance dev/production.
 * For multi-instance production deployments use a Redis-backed limiter.
 *
 * Usage:
 *   const ok = rateLimit('login', ip, 10, 60_000); // 10 req / 60 s
 *   if (!ok) return 429 response;
 */

const store = new Map(); // key → { count, resetAt }

/**
 * @param {string} namespace   e.g. 'login' or 'register'
 * @param {string} identifier  IP address or user ID
 * @param {number} maxRequests Maximum allowed in window
 * @param {number} windowMs    Window duration in milliseconds
 * @returns {boolean}          true = request allowed, false = rate limited
 */
export function rateLimit(namespace, identifier, maxRequests = 10, windowMs = 60_000) {
  const key = `${namespace}:${identifier}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count += 1;
  return true;
}

/**
 * Returns the client IP from Next.js request headers.
 * Respects X-Forwarded-For when behind a trusted proxy.
 * @param {Request} request
 * @returns {string}
 */
export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '127.0.0.1';
}
