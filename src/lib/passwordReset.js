import { getSessionSecret } from '@/lib/sessionConfig';

/**
 * Derives an HMAC-SHA256 signature using the Web Crypto API.
 * 100% compatible with both Edge Runtime and Node.js.
 */
async function createHmacSha256(secret, message) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a cryptographically signed, single-use, time-bounded password reset token.
 * Contains user identifier, timestamp, and a hash snapshot of the current passwordHash.
 * When the password is updated, the hash snapshot automatically invalidates prior tokens.
 */
export async function generatePasswordResetToken(user, expiresInMs = 15 * 60 * 1000) {
  if (!user || !user.id || !user.email) {
    throw new Error('Valid user record required to generate reset token.');
  }

  const secret = getSessionSecret();
  const expiresAt = Date.now() + expiresInMs;
  const hashSnapshot = (user.passwordHash || '').slice(0, 10);

  const payload = {
    uid: user.id,
    em: user.email.toLowerCase(),
    exp: expiresAt,
    hs: hashSnapshot,
  };

  const payloadString = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadString).toString('base64url');
  const signature = await createHmacSha256(secret, payloadBase64);

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies and decodes a password reset token.
 * Returns decoded payload and userId if valid and not expired.
 */
export async function verifyPasswordResetToken(token, user = null) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return { valid: false, error: 'Invalid reset token format.' };
  }

  const [payloadBase64, signature] = token.split('.');
  if (!payloadBase64 || !signature) {
    return { valid: false, error: 'Malformed reset token.' };
  }

  const secret = getSessionSecret();
  const expectedSignature = await createHmacSha256(secret, payloadBase64);

  if (signature.length !== expectedSignature.length || signature !== expectedSignature) {
    return { valid: false, error: 'Reset token signature is invalid or tampered.' };
  }

  let payload;
  try {
    const jsonStr = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    payload = JSON.parse(jsonStr);
  } catch {
    return { valid: false, error: 'Unable to parse token payload.' };
  }

  if (Date.now() > payload.exp) {
    return { valid: false, error: 'Password reset token has expired. Please request a new one.' };
  }

  if (user) {
    if (user.id !== payload.uid || user.email.toLowerCase() !== payload.em) {
      return { valid: false, error: 'Token does not match user account.' };
    }

    const currentHashSnapshot = (user.passwordHash || '').slice(0, 10);
    if (payload.hs !== currentHashSnapshot) {
      return { valid: false, error: 'This reset token has already been used. Please request a new one.' };
    }
  }

  return { valid: true, payload, userId: payload.uid, email: payload.em };
}
