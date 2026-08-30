import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Select from '../ui/Select';
import Input from '../ui/Input';

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
  { value: 'sale', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
];

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n}+ Beds` }));

const SearchBar = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    search: '',
    type: '',
    listingType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
  });

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(form).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid w-full grid-cols-1 gap-3 rounded-2xl bg-white/95 p-4 shadow-elevated backdrop-blur sm:grid-cols-2 lg:grid-cols-6"
    >
      <div className="lg:col-span-2">
        <Input
          id="search"
          placeholder="Search by location e.g. Lekki"
          value={form.search}
          onChange={update('search')}
        />
      </div>
      <Select id="type" placeholder="Property Type" options={PROPERTY_TYPES} value={form.type} onChange={update('type')} />
      <Select id="listingType" placeholder="Buy / Rent" options={LISTING_TYPES} value={form.listingType} onChange={update('listingType')} />
      <Select id="bedrooms" placeholder="Bedrooms" options={BEDROOM_OPTIONS} value={form.bedrooms} onChange={update('bedrooms')} />
      <button type="submit" className="btn-gold h-full w-full">
        <Search size={16} /> Search
      </button>
    </form>
  );
};

export default SearchBar;
