import api from './api';

const getProperties = (params) => api.get('/properties', { params }).then((res) => res.data);

const getFeaturedProperties = (limit = 6) =>
  api.get('/properties/featured', { params: { limit } }).then((res) => res.data);

const getCategoryCounts = () => api.get('/properties/categories').then((res) => res.data);

const getMyProperties = () => api.get('/properties/my-properties').then((res) => res.data);

const getPropertyById = (id) => api.get(`/properties/${id}`).then((res) => res.data);

const createProperty = (formData) =>
  api
    .post('/properties', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data);

const updateProperty = (id, formData) =>
  api
    .put(`/properties/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data);

const deleteProperty = (id) => api.delete(`/properties/${id}`).then((res) => res.data);

const reportProperty = (id, reason) => api.post(`/properties/${id}/report`, { reason }).then((res) => res.data);

export default {
  getProperties,
  getFeaturedProperties,
  getCategoryCounts,
  getMyProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  reportProperty,
};
