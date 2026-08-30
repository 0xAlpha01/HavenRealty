import api from './api';

const sendMessage = (payload) => api.post('/messages', payload).then((res) => res.data);

const getConversations = () => api.get('/messages/conversations').then((res) => res.data);

const getConversationWithUser = (userId) => api.get(`/messages/${userId}`).then((res) => res.data);

export default { sendMessage, getConversations, getConversationWithUser };
