const { createClient } = require('redis');

let client = null;
let isReady = false;

const REDIS_URL = process.env.REDIS_URL;

// Sets up a single shared Redis connection for the whole process. If REDIS_URL
// isn't configured, or the connection fails, the app keeps running without
// Redis - callers must check isRedisReady() before using the client.
const initRedis = () => {
  if (!REDIS_URL) {
    console.warn('[redis] REDIS_URL not set - caching and Redis-backed rate limiting are disabled');
    return null;
  }

  client = createClient({
    url: REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 200, 5000),
    },
  });

  client.on('error', (error) => {
    isReady = false;
    console.error(`[redis] connection error: ${error.message}`);
  });

  client.on('ready', () => {
    isReady = true;
    console.log('[redis] connected');
  });

  client.on('end', () => {
    isReady = false;
    console.warn('[redis] connection closed');
  });

  client.connect().catch((error) => {
    console.error(`[redis] initial connection failed: ${error.message}`);
  });

  return client;
};

const getClient = () => client;

const isRedisReady = () => isReady;

const closeRedis = async () => {
  if (!client) return;
  try {
    await client.quit();
  } catch {
    // Already closed or unreachable - nothing to do.
  }
};

module.exports = { initRedis, getClient, isRedisReady, closeRedis };
