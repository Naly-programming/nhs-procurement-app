import test from 'node:test'
import assert from 'node:assert'
import { RateLimiter } from '../../lib/rateLimit.js'

test('rate limiter blocks after limit', () => {
  const limiter = new RateLimiter(2, 1000)
  assert.ok(limiter.check('a'))
  assert.ok(limiter.check('a'))
  assert.equal(limiter.check('a'), false)
})
