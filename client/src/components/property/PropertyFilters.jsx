import { RotateCcw } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';

const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'villa', label: 'Villa' },
  { value: 'office', label: 'Office' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
  { value: 'shop', label: 'Shop' },
];

const LISTING_TYPES = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
];

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n}+` }));

const AMENITIES = ['24/7 Security', 'Swimming Pool', 'Gym', 'Backup Power', 'Parking', 'CCTV', 'Elevator'];

const PropertyFilters = ({ filters, onChange, onReset }) => {
  const update = (key) => (e) => onChange(key, e.target.value);

  const toggleAmenity = (amenity) => {
    const current = filters.amenities ? filters.amenities.split(',').filter(Boolean) : [];
    const next = current.includes(amenity)
      ? current.filter((item) => item !== amenity)
      : [...current, amenity];
    onChange('amenities', next.join(','));
  };

  const selectedAmenities = filters.amenities ? filters.amenities.split(',').filter(Boolean) : [];

  return (
    <div className="card space-y-5 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy-900">Filters</h3>
        <button type="button" onClick={onReset} className="flex items-center gap-1 text-xs font-medium text-navy-600 hover:text-navy-800">
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      <Input
        label="Location"
        id="city"
        placeholder="City e.g. Lekki"
        value={filters.city || ''}
        onChange={update('city')}
      />

      <Select
        label="Property Type"
        id="type"
        placeholder="All types"
        options={PROPERTY_TYPES}
        value={filters.type || ''}
        onChange={update('type')}
      />

      <Select
        label="Listing Type"
        id="listingType"
        placeholder="Buy or Rent"
        options={LISTING_TYPES}
        value={filters.listingType || ''}
        onChange={update('listingType')}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Min Price"
          id="minPrice"
          type="number"
          min="0"
          placeholder="0"
          value={filters.minPrice || ''}
          onChange={update('minPrice')}
        />
        <Input
          label="Max Price"
          id="maxPrice"
          type="number"
          min="0"
          placeholder="Any"
          value={filters.maxPrice || ''}
          onChange={update('maxPrice')}
        />
      </div>

      <Select
        label="Bedrooms"
        id="bedrooms"
        placeholder="Any"
        options={BEDROOM_OPTIONS}
        value={filters.bedrooms || ''}
        onChange={update('bedrooms')}
      />

      <Select
        label="Bathrooms"
        id="bathrooms"
        placeholder="Any"
        options={BEDROOM_OPTIONS}
        value={filters.bathrooms || ''}
        onChange={update('bathrooms')}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Amenities</p>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((amenity) => (
            <button
              type="button"
              key={amenity}
              onClick={() => toggleAmenity(amenity)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedAmenities.includes(amenity)
                  ? 'border-navy-800 bg-navy-800 text-white'
                  : 'border-gray-200 text-slate-600 hover:border-navy-300'
              }`}
            >
              {amenity}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters;
