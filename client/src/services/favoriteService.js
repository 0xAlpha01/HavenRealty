import api from './api';

const getFavorites = () => api.get('/favorites').then((res) => res.data);

const addFavorite = (propertyId) => api.post(`/favorites/${propertyId}`).then((res) => res.data);

const removeFavorite = (propertyId) => api.delete(`/favorites/${propertyId}`).then((res) => res.data);

export default { getFavorites, addFavorite, removeFavorite };
