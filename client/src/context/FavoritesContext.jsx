import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import favoriteService from '../services/favoriteService';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const res = await favoriteService.getFavorites();
      setFavoriteIds(new Set(res.data.map((property) => property._id)));
    } catch {
      setFavoriteIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const toggleFavorite = async (propertyId) => {
    const isFavorited = favoriteIds.has(propertyId);
    const next = new Set(favoriteIds);

    if (isFavorited) {
      next.delete(propertyId);
      setFavoriteIds(next);
      await favoriteService.removeFavorite(propertyId);
    } else {
      next.add(propertyId);
      setFavoriteIds(next);
      await favoriteService.addFavorite(propertyId);
    }

    return !isFavorited;
  };

  const isFavorite = (propertyId) => favoriteIds.has(propertyId);

  const value = useMemo(
    () => ({ favoriteIds, loading, isFavorite, toggleFavorite, refreshFavorites }),
    [favoriteIds, loading]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
  return context;
};
