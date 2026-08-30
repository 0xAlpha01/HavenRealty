import api from './api';

const createInquiry = (payload) => api.post('/inquiries', payload).then((res) => res.data);

const getInquiries = (scope = 'sent') =>
  api.get('/inquiries', { params: { scope } }).then((res) => res.data);

const getInquiryById = (id) => api.get(`/inquiries/${id}`).then((res) => res.data);

const updateInquiry = (id, payload) => api.put(`/inquiries/${id}`, payload).then((res) => res.data);

export default { createInquiry, getInquiries, getInquiryById, updateInquiry };
