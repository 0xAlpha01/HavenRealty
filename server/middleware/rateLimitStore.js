const { getClient, isRedisReady } = require('../config/redis');

// express-rate-limit store backed by Redis (shared across instances) that
// transparently falls back to an in-process Map whenever Redis is
// unavailable, so a Redis outage degrades rate limiting instead of crashing
// or blocking requests.
class RedisRateLimitStore {
  constructor({ prefix }) {
    this.prefix = prefix;
    this.windowMs = 60 * 1000;
    this.memoryHits = new Map();
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  _memoryIncrement(key) {
    const now = Date.now();
    const existing = this.memoryHits.get(key);
    if (!existing || existing.resetTime <= now) {
      const resetTime = now + this.windowMs;
      this.memoryHits.set(key, { count: 1, resetTime });
      return { totalHits: 1, resetTime: new Date(resetTime) };
    }
    existing.count += 1;
    return { totalHits: existing.count, resetTime: new Date(existing.resetTime) };
  }

  async increment(key) {
    if (isRedisReady()) {
      try {
        const client = getClient();
        const redisKey = `${this.prefix}${key}`;
        const ttlSeconds = Math.ceil(this.windowMs / 1000);
        const totalHits = await client.incr(redisKey);
        if (totalHits === 1) {
          await client.expire(redisKey, ttlSeconds);
        }
        const ttl = await client.ttl(redisKey);
        const resetTime = new Date(Date.now() + (ttl > 0 ? ttl : ttlSeconds) * 1000);
        return { totalHits, resetTime };
      } catch (error) {
        console.error(`[redis] rate limiter falling back to memory: ${error.message}`);
      }
    }
    return this._memoryIncrement(key);
  }

  async decrement(key) {
    if (isRedisReady()) {
      try {
        await getClient().decr(`${this.prefix}${key}`);
        return;
      } catch (error) {
        console.error(`[redis] rate limiter decrement failed: ${error.message}`);
      }
    }
    const existing = this.memoryHits.get(key);
    if (existing) existing.count = Math.max(0, existing.count - 1);
  }

  async resetKey(key) {
    if (isRedisReady()) {
      try {
        await getClient().del(`${this.prefix}${key}`);
      } catch (error) {
        console.error(`[redis] rate limiter reset failed: ${error.message}`);
      }
    }
    this.memoryHits.delete(key);
  }
}

module.exports = RedisRateLimitStore;
