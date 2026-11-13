import test from 'node:test';
import assert from 'node:assert/strict';
import { getSessionSecret } from '@/lib/session';

test('Session: Secret validation and environment enforcement', async (t) => {
  await t.test('uses configured SESSION_SECRET in development or returns fallback', () => {
    const origEnv = process.env.NODE_ENV;
    const origSecret = process.env.SESSION_SECRET;

    process.env.NODE_ENV = 'development';
    delete process.env.SESSION_SECRET;

    const devSecret = getSessionSecret();
    assert.ok(devSecret.length >= 32, 'Dev fallback secret must be >= 32 characters');

    process.env.SESSION_SECRET = 'a_very_secure_test_secret_that_is_at_least_32_characters_long';
    assert.equal(getSessionSecret(), 'a_very_secure_test_secret_that_is_at_least_32_characters_long');

    process.env.NODE_ENV = origEnv;
    process.env.SESSION_SECRET = origSecret;
  });

  await t.test('strictly refuses to start with missing or insecure secret in production', () => {
    const origEnv = process.env.NODE_ENV;
    const origSecret = process.env.SESSION_SECRET;

    process.env.NODE_ENV = 'production';

    // Test missing secret
    delete process.env.SESSION_SECRET;
    assert.throws(
      () => getSessionSecret(),
      (err) => err.message.includes('CRITICAL CONFIGURATION ERROR')
    );

    // Test short secret
    process.env.SESSION_SECRET = 'too_short';
    assert.throws(
      () => getSessionSecret(),
      (err) => err.message.includes('CRITICAL CONFIGURATION ERROR')
    );

    // Test placeholder secret
    process.env.SESSION_SECRET = 'changeme_at_least_32_chars_long_placeholder!!';
    assert.throws(
      () => getSessionSecret(),
      (err) => err.message.includes('CRITICAL CONFIGURATION ERROR')
    );

    // Test valid production secret
    process.env.SESSION_SECRET = 'c84a51e62ff1875e525143a53fef3cbb27685d3f82cb5635f60641154c1be48a';
    assert.equal(getSessionSecret(), 'c84a51e62ff1875e525143a53fef3cbb27685d3f82cb5635f60641154c1be48a');

    process.env.NODE_ENV = origEnv;
    process.env.SESSION_SECRET = origSecret;
  });
});

