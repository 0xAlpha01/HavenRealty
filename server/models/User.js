const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { generateSecureToken, hashValue } = require('../utils/tokens');

const PASSWORD_RESET_EXPIRY_MINUTES = 15;

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
  delete obj.passwordResetTokenHash;
  delete obj.passwordResetExpires;
  delete obj.passwordChangedAt;
  return obj;
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const { rawToken, tokenHash } = generateSecureToken();
  this.passwordResetTokenHash = tokenHash;
  this.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);
  return rawToken;
};

userSchema.statics.hashValue = hashValue;

module.exports = mongoose.model('User', userSchema);
