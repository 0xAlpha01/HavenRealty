const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/apiError');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../services/emailService');
const smsService = require('../services/smsService');
const { uploadImage, deleteImage } = require('../utils/uploadImage');
const { hashValue, maskPhone } = require('../utils/tokens');
const {
  passwordResetEmailTemplate,
  phoneOtpEmailTemplate,
} = require('../utils/emailTemplates');

const sanitizeUser = (user) => user.toSafeObject();

const GENERIC_RESET_MESSAGE = 'If an account exists with this email, a password reset link has been sent.';

// Finds the acting user either from an authenticated request (optionalAuth)
// or by the email supplied in the request body, so verification flows work
// both mid-session and right after registration.
const resolveUserByAuthOrEmail = async (req, { selectExtra = '' } = {}) => {
  if (req.user) {
    return selectExtra ? User.findById(req.user._id).select(selectExtra) : req.user;
  }

  const { email } = req.body;
  if (!email) return null;

  const query = User.findOne({ email: email.toLowerCase() });
  return selectExtra ? query.select(selectExtra) : query;
};

// Tries SMS first; if that's skipped (Termii not configured, not approved,
// or the send failed) falls back to emailing the code, so verification still
// works while SMS delivery is unavailable.
const sendPhoneOtpSms = async (user, otp) => {
  const result = await smsService.sendOTP(user.phone, otp);
  if (result.skipped) {
    await sendEmail({
      to: user.email,
      subject: 'Your Haven Realty phone verification code',
      html: phoneOtpEmailTemplate({ name: user.fullName, otp, maskedPhone: maskPhone(user.phone) }),
    });
  }
};

// Fire-and-forget: both delivery paths already catch their own errors, but
// the caller's HTTP response must never wait on SMS/email round-trips.
const sendPhoneOtpInBackground = (user, otp) => {
  sendPhoneOtpSms(user, otp).catch((error) => {
    console.error(`Failed to deliver phone OTP to ${user.email}: ${error.message}`);
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, confirmPassword } = req.body;

  if (!fullName || !email || !phone || !password || !confirmPassword) {
    throw new ApiError(400, 'All fields are required');
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = new User({
    fullName,
    email,
    phone,
    password,
    role: 'user',
  });

  // Phone verification is an optional trust signal a user can add later from
  // their profile, so no OTP is sent (and Termii isn't touched) at
  // registration time.
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Registration successful. You can now log in.',
    data: { userId: user._id, email: user.email, phone: user.phone },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Phone verification is optional and never gates login.
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user: sanitizeUser(user), token },
  });
});

// @desc    Logout user (client discards token; endpoint kept for symmetry)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: sanitizeUser(req.user) } });
});

// @desc    Check phone verification status (no sensitive data)
// @route   GET /api/auth/verification-status
// @access  Public
const getVerificationStatus = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('phoneVerified');

  res.status(200).json({
    success: true,
    data: {
      phoneVerified: Boolean(user?.phoneVerified),
    },
  });
});

// @desc    Send a phone verification OTP
// @route   POST /api/auth/send-phone-otp
// @access  Public/Private (identified by session or email)
const sendPhoneOtp = asyncHandler(async (req, res) => {
  const user = await resolveUserByAuthOrEmail(req, {
    selectExtra: '+phoneVerificationOTPHash +phoneVerificationOTPExpires +phoneVerificationAttempts',
  });

  if (!user) {
    throw new ApiError(404, 'We could not find an account for that email address.');
  }

  if (user.phoneVerified) {
    return res.status(200).json({ success: true, message: 'Phone number is already verified.' });
  }

  const otp = user.createPhoneVerificationOTP();
  await user.save();
  sendPhoneOtpInBackground(user, otp);

  res.status(200).json({
    success: true,
    message: `A verification code has been sent to ${maskPhone(user.phone)}. If SMS delivery isn't available, we'll email it to you instead.`,
    data: { maskedPhone: maskPhone(user.phone) },
  });
});

// @desc    Resend a phone verification OTP
// @route   POST /api/auth/resend-phone-otp
// @access  Public/Private (identified by session or email)
const resendPhoneOtp = sendPhoneOtp;

// @desc    Verify a phone number with an OTP
// @route   POST /api/auth/verify-phone-otp
// @access  Public/Private (identified by session or email)
const verifyPhoneOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  if (!otp) {
    throw new ApiError(400, 'Verification code is required');
  }

  const user = await resolveUserByAuthOrEmail(req, {
    selectExtra: '+phoneVerificationOTPHash +phoneVerificationOTPExpires +phoneVerificationAttempts',
  });

  if (!user) {
    throw new ApiError(404, 'We could not find an account for that email address.');
  }

  if (user.phoneVerified) {
    return res.status(200).json({ success: true, message: 'Phone number is already verified.' });
  }

  if (!user.phoneVerificationOTPHash || !user.phoneVerificationOTPExpires) {
    throw new ApiError(400, 'No active verification code. Please request a new one.');
  }

  if (user.phoneVerificationOTPExpires < new Date()) {
    user.phoneVerificationOTPHash = undefined;
    user.phoneVerificationOTPExpires = undefined;
    user.phoneVerificationAttempts = 0;
    await user.save();
    throw new ApiError(400, 'Verification code has expired. Please request a new code.');
  }

  const isMatch = user.phoneVerificationOTPHash === hashValue(otp);

  if (!isMatch) {
    user.phoneVerificationAttempts += 1;

    if (user.phoneVerificationAttempts >= User.MAX_PHONE_OTP_ATTEMPTS) {
      user.phoneVerificationOTPHash = undefined;
      user.phoneVerificationOTPExpires = undefined;
      user.phoneVerificationAttempts = 0;
      await user.save();
      throw new ApiError(400, 'Too many failed attempts. Please request a new code.');
    }

    await user.save();
    throw new ApiError(400, 'Invalid verification code.');
  }

  user.phoneVerified = true;
  user.phoneVerificationOTPHash = undefined;
  user.phoneVerificationOTPExpires = undefined;
  user.phoneVerificationAttempts = 0;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Phone number verified successfully',
    data: { phoneVerified: true },
  });
});

// @desc    Request a password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    const rawToken = user.createPasswordResetToken();
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
    sendEmail({
      to: user.email,
      subject: 'Reset your Haven Realty password',
      html: passwordResetEmailTemplate({ name: user.fullName, resetUrl }),
    }).catch((error) => {
      console.error(`Failed to send password reset email to ${user.email}: ${error.message}`);
    });
  }

  // Always respond identically whether or not the account exists, to prevent
  // account enumeration.
  res.status(200).json({ success: true, message: GENERIC_RESET_MESSAGE });
});

// @desc    Reset a password using a reset token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    throw new ApiError(400, 'Token, password, and confirm password are required');
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const tokenHash = hashValue(token);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetTokenHash +passwordResetExpires');

  if (!user) {
    throw new ApiError(400, 'Reset link is invalid or has expired.');
  }

  user.password = password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successful. You can now log in.' });
});

// @desc    Update current user's profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone, bio, location } = req.body;
  const user = await User.findById(req.user._id);

  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (location !== undefined) user.location = location;

  if (req.file) {
    if (user.avatar?.publicId) {
      await deleteImage(user.avatar.publicId);
    }
    const { url, publicId } = await uploadImage(req.file, 'real-estate/avatars');
    user.avatar = { url, publicId };
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: sanitizeUser(user) },
  });
});

// @desc    Change current user's password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password changed successfully' });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  getVerificationStatus,
  sendPhoneOtp,
  resendPhoneOtp,
  verifyPhoneOtp,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
};
