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

const phoneOtpRequestLimiter = makeLimiter(
  60 * 60 * 1000,
  5,
  'Too many verification code requests. Please try again later.',
  'phoneOtpRequest'
);

const phoneOtpVerifyLimiter = makeLimiter(
  15 * 60 * 1000,
  10,
  'Too many verification attempts. Please try again later.',
  'phoneOtpVerify'
);

module.exports = {
  forgotPasswordLimiter,
  phoneOtpRequestLimiter,
  phoneOtpVerifyLimiter,
};
