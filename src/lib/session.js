import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

/**
 * Validates and retrieves the SESSION_SECRET.
 * In production, fails safely by throwing an error if SESSION_SECRET is unset,
 * shorter than 32 characters, or using a known insecure development placeholder.
 */
export function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    if (!secret || secret.length < 32 || secret.includes('changeme') || secret.includes('replace_this')) {
      throw new Error(
        'CRITICAL CONFIGURATION ERROR: SESSION_SECRET is unset, shorter than 32 characters, or using an insecure placeholder in production. Refusing to start session service with an insecure key.'
      );
    }
    return secret;
  }

  return secret || 'development_fallback_secret_must_be_at_least_32_chars_long!';
}

/**
 * iron-session cookie configuration.
 * SESSION_SECRET must be at least 32 characters.
 */
export const sessionOptions = {
  cookieName: 'doubtbridge_session',
  get password() {
    return getSessionSecret();
  },
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

/**
 * Returns the iron-session for the current server request.
 * Usage (Server Component / Route Handler):
 *   const session = await getSession();
 *   session.userId  — string | undefined
 */
export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession(cookieStore, sessionOptions);
}
