import api from './api';

const getAgents = () => api.get('/agents').then((res) => res.data);

const getAgentById = (id) => api.get(`/agents/${id}`).then((res) => res.data);

export default { getAgents, getAgentById };
