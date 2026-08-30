import { Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { getErrorMessage } from '../../services/api';

const FavoriteButton = ({ propertyId, className = '' }) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const active = isFavorite(propertyId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please login to save properties');
      navigate('/login');
      return;
    }

    try {
      const nowSaved = await toggleFavorite(propertyId);
      toast.success(nowSaved ? 'Property saved' : 'Property removed from favorites');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? 'Remove from favorites' : 'Save to favorites'}
      aria-pressed={active}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-card transition-colors hover:bg-white ${className}`}
    >
      <Heart size={17} className={active ? 'fill-red-500 text-red-500' : 'text-slate-600'} />
    </button>
  );
};

export default FavoriteButton;
