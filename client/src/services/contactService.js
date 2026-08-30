import api from './api';

const sendContactMessage = (payload) => api.post('/contact', payload).then((res) => res.data);

export default { sendContactMessage };
