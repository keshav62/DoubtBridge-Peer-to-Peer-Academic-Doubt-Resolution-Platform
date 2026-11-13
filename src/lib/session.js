import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

/**
 * iron-session cookie configuration.
 * SESSION_SECRET must be at least 32 characters.
 */
export const sessionOptions = {
  cookieName: 'doubtbridge_session',
  password: process.env.SESSION_SECRET || 'changeme_at_least_32_chars_long_!!',
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
