import test from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

test('Rate Limiter: In-memory sliding window limiter', async (t) => {
  await t.test('allows requests within limit and blocks subsequent requests', () => {
    const testIp = '192.168.1.99';
    const ns = 'test_unit_login';
    const limit = 3;
    const windowMs = 5000;

    assert.equal(rateLimit(ns, testIp, limit, windowMs), true, 'Request 1 should pass');
    assert.equal(rateLimit(ns, testIp, limit, windowMs), true, 'Request 2 should pass');
    assert.equal(rateLimit(ns, testIp, limit, windowMs), true, 'Request 3 should pass');
    assert.equal(rateLimit(ns, testIp, limit, windowMs), false, 'Request 4 should be rate limited');
  });

  await t.test('getClientIp extracts IP from forwarded header or falls back', () => {
    const mockReqWithForwarded = {
      headers: new Headers({ 'x-forwarded-for': '203.0.113.195, 70.41.3.18' }),
    };
    assert.equal(getClientIp(mockReqWithForwarded), '203.0.113.195');

    const mockReqWithRealIp = {
      headers: new Headers({ 'x-real-ip': '198.51.100.4' }),
    };
    assert.equal(getClientIp(mockReqWithRealIp), '198.51.100.4');

    const mockReqEmpty = {
      headers: new Headers(),
    };
    assert.equal(getClientIp(mockReqEmpty), '127.0.0.1');
  });
});

