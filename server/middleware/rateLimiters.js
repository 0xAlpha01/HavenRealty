const rateLimit = require('express-rate-limit');
const RedisRateLimitStore = require('./rateLimitStore');

const makeLimiter = (windowMs, max, message, storePrefix) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    store: new RedisRateLimitStore({ prefix: `rl:${storePrefix}:` }),
  });

const forgotPasswordLimiter = makeLimiter(
  60 * 60 * 1000,
  5,
  'Too many password reset requests. Please try again later.',
  'forgotPassword'
);

module.exports = {
  forgotPasswordLimiter,
};
