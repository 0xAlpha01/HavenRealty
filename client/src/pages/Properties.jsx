import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { toast } from 'react-toastify';
import PropertyFilters from '../components/property/PropertyFilters';
import PropertyGrid from '../components/property/PropertyGrid';
import Pagination from '../components/ui/Pagination';
import PropertyCard from '../components/property/PropertyCard';
import Select from '../components/ui/Select';
import propertyService from '../services/propertyService';
import { getErrorMessage } from '../services/api';
import useDebounce from '../hooks/useDebounce';
import { PropertyGridSkeleton } from '../components/ui/Skeletons';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'most_viewed', label: 'Most Viewed' },
];

const FILTER_KEYS = [
  'search',
  'city',
  'type',
  'listingType',
  'minPrice',
  'maxPrice',
  'bedrooms',
  'bathrooms',
  'amenities',
];

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => {
    const initial = {};
    FILTER_KEYS.forEach((key) => {
      const value = searchParams.get(key);
      if (value) initial[key] = value;
    });
    return initial;
  });
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [view, setView] = useState('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [result, setResult] = useState({ properties: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const debouncedFilters = useDebounce(filters, 450);

  useEffect(() => {
    document.title = 'Properties for Sale & Rent | Haven Realty';
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedFilters, sort]);

  useEffect(() => {
    const params = { ...debouncedFilters, sort, page, limit: 12 };
    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key];
    });

    setSearchParams(params, { replace: true });

    setLoading(true);
    propertyService
      .getProperties(params)
      .then((res) => setResult(res))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters, sort, page]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => setFilters({});

  const rangeLabel = useMemo(() => {
    if (!result.total) return 'Showing 0 properties';
    const start = (page - 1) * 12 + 1;
    const end = Math.min(page * 12, result.total);
    return `Showing ${start}–${end} of ${result.total} properties`;
  }, [page, result.total]);

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900">Properties</h1>
        <p className="mt-1 text-slate-500">{rangeLabel}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="hidden lg:col-span-1 lg:block">
          <PropertyFilters filters={filters} onChange={handleFilterChange} onReset={handleReset} />
        </div>

        <div className="lg:col-span-3">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="btn-outline lg:hidden"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>

            <div className="ml-auto flex items-center gap-3">
              <Select
                id="sort"
                options={SORT_OPTIONS}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-44"
              />
              <div className="hidden items-center gap-1 rounded-lg border border-gray-200 p-1 sm:flex">
                <button
                  type="button"
                  onClick={() => setView('grid')}
                  aria-label="Grid view"
                  className={`rounded-md p-1.5 ${view === 'grid' ? 'bg-navy-800 text-white' : 'text-slate-500'}`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  aria-label="List view"
                  className={`rounded-md p-1.5 ${view === 'list' ? 'bg-navy-800 text-white' : 'text-slate-500'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <PropertyGridSkeleton count={9} />
          ) : view === 'grid' ? (
            <PropertyGrid properties={result.properties} loading={false} />
          ) : (
            <div className="space-y-4">
              {result.properties.length === 0 ? (
                <PropertyGrid properties={[]} loading={false} />
              ) : (
                result.properties.map((property) => (
                  <div key={property._id} className="max-w-md">
                    <PropertyCard property={property} />
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-10">
            <Pagination page={page} pages={result.pages} onPageChange={setPage} />
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-900/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-gray-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-navy-900">Filters</h2>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                <X size={20} />
              </button>
            </div>
            <PropertyFilters filters={filters} onChange={handleFilterChange} onReset={handleReset} />
            <button type="button" onClick={() => setMobileFiltersOpen(false)} className="btn-primary mt-4 w-full">
              Show Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;
