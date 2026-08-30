const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  getVerificationStatus,
  verifyEmail,
  resendVerification,
  sendPhoneOtp,
  resendPhoneOtp,
  verifyPhoneOtp,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  forgotPasswordLimiter,
  resendVerificationLimiter,
  phoneOtpRequestLimiter,
  phoneOtpVerifyLimiter,
} = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/verification-status', getVerificationStatus);

router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationLimiter, optionalAuth, resendVerification);

router.post('/send-phone-otp', phoneOtpRequestLimiter, optionalAuth, sendPhoneOtp);
router.post('/resend-phone-otp', phoneOtpRequestLimiter, optionalAuth, resendPhoneOtp);
router.post('/verify-phone-otp', phoneOtpVerifyLimiter, optionalAuth, verifyPhoneOtp);

router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
