import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PropertyGrid from '../../components/property/PropertyGrid';
import favoriteService from '../../services/favoriteService';
import { getErrorMessage } from '../../services/api';

const Favorites = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Saved Properties | Haven Realty';
    favoriteService
      .getFavorites()
      .then((res) => setProperties(res.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Saved Properties</h1>
      <p className="mt-1 text-sm text-slate-500">Properties you&apos;ve saved for later</p>

      <div className="mt-6">
        <PropertyGrid
          properties={properties}
          loading={loading}
          emptyTitle="No saved properties"
          emptyDescription="Tap the heart icon on any property to save it here for later."
        />
      </div>
    </div>
  );
};

export default Favorites;
