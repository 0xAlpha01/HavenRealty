import api from './api';

const register = (payload) => api.post('/auth/register', payload).then((res) => res.data);

const login = (payload) => api.post('/auth/login', payload).then((res) => res.data);

const logout = () => api.post('/auth/logout').then((res) => res.data);

const getMe = () => api.get('/auth/me').then((res) => res.data);

const updateProfile = (formData) =>
  api
    .put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);

const changePassword = (payload) => api.put('/auth/change-password', payload).then((res) => res.data);

export default { register, login, logout, getMe, updateProfile, changePassword };
