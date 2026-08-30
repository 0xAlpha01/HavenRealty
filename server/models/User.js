const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { generateSecureToken, generateOTP, hashValue } = require('../utils/tokens');

const EMAIL_VERIFICATION_EXPIRY_MINUTES = 30;
const PHONE_OTP_EXPIRY_MINUTES = 10;
const PASSWORD_RESET_EXPIRY_MINUTES = 15;
const MAX_PHONE_OTP_ATTEMPTS = 5;

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'agent', 'admin'],
      default: 'user',
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    bio: { type: String, default: '', maxlength: 1000 },
    location: { type: String, default: '' },
    isAgent: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },

    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    phoneVerificationOTPHash: { type: String, select: false },
    phoneVerificationOTPExpires: { type: Date, select: false },
    phoneVerificationAttempts: { type: Number, default: 0, select: false },

    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    passwordChangedAt: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  if (!this.isNew) {
    // Subtract 1s so a JWT issued in the same instant as the reset never gets
    // rejected by the iat-vs-passwordChangedAt check in the protect middleware.
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationTokenHash;
  delete obj.emailVerificationExpires;
  delete obj.phoneVerificationOTPHash;
  delete obj.phoneVerificationOTPExpires;
  delete obj.phoneVerificationAttempts;
  delete obj.passwordResetTokenHash;
  delete obj.passwordResetExpires;
  delete obj.passwordChangedAt;
  return obj;
};

// Generates a new email verification token, stores its hash on the document,
// and returns the raw token to be emailed (never persisted in raw form).
userSchema.methods.createEmailVerificationToken = function createEmailVerificationToken() {
  const { rawToken, tokenHash } = generateSecureToken();
  this.emailVerificationTokenHash = tokenHash;
  this.emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MINUTES * 60 * 1000);
  return rawToken;
};

userSchema.methods.createPhoneVerificationOTP = function createPhoneVerificationOTP() {
  const { otp, otpHash } = generateOTP();
  this.phoneVerificationOTPHash = otpHash;
  this.phoneVerificationOTPExpires = new Date(Date.now() + PHONE_OTP_EXPIRY_MINUTES * 60 * 1000);
  this.phoneVerificationAttempts = 0;
  return otp;
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const { rawToken, tokenHash } = generateSecureToken();
  this.passwordResetTokenHash = tokenHash;
  this.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);
  return rawToken;
};

userSchema.statics.hashValue = hashValue;
userSchema.statics.MAX_PHONE_OTP_ATTEMPTS = MAX_PHONE_OTP_ATTEMPTS;

module.exports = mongoose.model('User', userSchema);
