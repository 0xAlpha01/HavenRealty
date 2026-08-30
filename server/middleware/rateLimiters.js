const rateLimit = require('express-rate-limit');

const makeLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

const forgotPasswordLimiter = makeLimiter(
  60 * 60 * 1000,
  5,
  'Too many password reset requests. Please try again later.'
);

const resendVerificationLimiter = makeLimiter(
  60 * 60 * 1000,
  5,
  'Too many verification email requests. Please try again later.'
);

const phoneOtpRequestLimiter = makeLimiter(
  60 * 60 * 1000,
  5,
  'Too many verification code requests. Please try again later.'
);

const phoneOtpVerifyLimiter = makeLimiter(
  15 * 60 * 1000,
  10,
  'Too many verification attempts. Please try again later.'
);

module.exports = {
  forgotPasswordLimiter,
  resendVerificationLimiter,
  phoneOtpRequestLimiter,
  phoneOtpVerifyLimiter,
};
