import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BedDouble, Bath, MapPin, Ruler } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import Badge from '../ui/Badge';
import { formatPrice, propertyTypeLabel } from '../../utils/formatters';

const PropertyCard = ({ property, showStatus = false }) => {
  const coverImage = property.images?.[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
      className="card group overflow-hidden"
    >
      <Link to={`/properties/${property._id}`} className="block">
        <div className="relative h-52 w-full overflow-hidden bg-gray-100">
          {coverImage ? (
            <img
              src={coverImage}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
              No image available
            </div>
          )}

          <div className="absolute left-3 top-3 flex gap-2">
            <span className="badge bg-navy-900/85 text-white">
              For {property.listingType === 'rent' ? 'Rent' : 'Sale'}
            </span>
            {showStatus && <Badge status={property.status} />}
          </div>

          <FavoriteButton propertyId={property._id} className="absolute right-3 top-3" />
        </div>

        <div className="p-4">
          <p className="text-lg font-bold text-navy-900">{formatPrice(property.price, property.listingType)}</p>
          <h3 className="mt-1 truncate text-sm font-semibold text-slate-800">{property.title}</h3>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
            <MapPin size={13} /> {property.city}, {property.state}
          </p>

          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-slate-500">
            <span className="badge bg-navy-50 text-navy-700">{propertyTypeLabel(property.propertyType)}</span>
            <div className="flex items-center gap-3">
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-1">
                  <BedDouble size={14} /> {property.bedrooms}
                </span>
              )}
              {property.bathrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bath size={14} /> {property.bathrooms}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Ruler size={14} /> {property.area}sqm
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PropertyCard;
