import api from './api';

const getStats = () => api.get('/admin/stats').then((res) => res.data);

const getUsers = () => api.get('/admin/users').then((res) => res.data);

const deleteUser = (id) => api.delete(`/admin/users/${id}`).then((res) => res.data);

const updateUserStatus = (id) => api.put(`/admin/users/${id}/status`).then((res) => res.data);

const getAllProperties = (params) => api.get('/admin/properties', { params }).then((res) => res.data);

const approveProperty = (id) => api.put(`/admin/properties/${id}/approve`).then((res) => res.data);

const rejectProperty = (id, reason) =>
  api.put(`/admin/properties/${id}/reject`, { reason }).then((res) => res.data);

const deleteProperty = (id) => api.delete(`/admin/properties/${id}`).then((res) => res.data);

const dismissReport = (id) => api.put(`/admin/properties/${id}/dismiss-report`).then((res) => res.data);

export default {
  getStats,
  getUsers,
  deleteUser,
  updateUserStatus,
  getAllProperties,
  approveProperty,
  rejectProperty,
  deleteProperty,
  dismissReport,
};
