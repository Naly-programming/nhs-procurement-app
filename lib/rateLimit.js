export class RateLimiter {
  constructor(limit, windowMs) {
    this.limit = limit
    this.windowMs = windowMs
    this.map = new Map()
  }

  check(key) {
    const now = Date.now()
    const entry = this.map.get(key)
    if (entry && entry.expires > now) {
      if (entry.count >= this.limit) return false
      entry.count++
      return true
    }
    this.map.set(key, { count: 1, expires: now + this.windowMs })
    return true
  }
}

export const globalLimiter = new RateLimiter(100, 60 * 60 * 1000)
