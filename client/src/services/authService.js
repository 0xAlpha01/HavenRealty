import api from './api';

const register = (payload) => api.post('/auth/register', payload).then((res) => res.data);

const login = (payload) => api.post('/auth/login', payload).then((res) => res.data);

const logout = () => api.post('/auth/logout').then((res) => res.data);

const getMe = () => api.get('/auth/me').then((res) => res.data);

const getVerificationStatus = (email) =>
  api.get('/auth/verification-status', { params: { email } }).then((res) => res.data);

const verifyEmail = (token) => api.post('/auth/verify-email', { token }).then((res) => res.data);

const resendVerification = (email) =>
  api.post('/auth/resend-verification', { email }).then((res) => res.data);

const sendPhoneOtp = (email) => api.post('/auth/send-phone-otp', { email }).then((res) => res.data);

const resendPhoneOtp = (email) => api.post('/auth/resend-phone-otp', { email }).then((res) => res.data);

const verifyPhoneOtp = (email, otp) =>
  api.post('/auth/verify-phone-otp', { email, otp }).then((res) => res.data);

const forgotPassword = (email) => api.post('/auth/forgot-password', { email }).then((res) => res.data);

const resetPassword = (payload) => api.post('/auth/reset-password', payload).then((res) => res.data);

const updateProfile = (formData) =>
  api
    .put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);

const changePassword = (payload) => api.put('/auth/change-password', payload).then((res) => res.data);

export default {
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
};
