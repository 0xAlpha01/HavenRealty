const crypto = require('crypto');
const { getClient, isRedisReady } = require('../config/redis');

const DEFAULT_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS) || 120;

// Builds a stable, namespaced key from a prefix plus the query params that
// affect the response, e.g. properties:list:<hash-of-sorted-query>.
const buildKey = (prefix, params = {}) => {
  const relevant = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        acc[key] = params[key];
      }
      return acc;
    }, {});

  if (Object.keys(relevant).length === 0) return `${prefix}:all`;

  const hash = crypto.createHash('sha1').update(JSON.stringify(relevant)).digest('hex');
  return `${prefix}:${hash}`;
};

const getCache = async (key) => {
  if (!isRedisReady()) return null;
  try {
    const raw = await getClient().get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error(`[redis] cache read failed for "${key}": ${error.message}`);
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = DEFAULT_TTL_SECONDS) => {
  if (!isRedisReady()) return;
  try {
    await getClient().set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.error(`[redis] cache write failed for "${key}": ${error.message}`);
  }
};

// Clears every key under a namespace prefix (e.g. all "properties:*" entries)
// so mutations never leave stale data behind.
const invalidateByPrefix = async (prefix) => {
  if (!isRedisReady()) return;
  try {
    const client = getClient();
    let cursor = 0;
    do {
      const result = await client.scan(cursor, { MATCH: `${prefix}:*`, COUNT: 100 });
      cursor = result.cursor;
      if (result.keys.length > 0) {
        await client.del(result.keys);
      }
    } while (cursor !== 0);
  } catch (error) {
    console.error(`[redis] cache invalidation failed for prefix "${prefix}": ${error.message}`);
  }
};

module.exports = { buildKey, getCache, setCache, invalidateByPrefix, DEFAULT_TTL_SECONDS };
