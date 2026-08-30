import PropertyCard from './PropertyCard';
import EmptyState from '../ui/EmptyState';
import { PropertyGridSkeleton } from '../ui/Skeletons';
import { Home } from 'lucide-react';

const PropertyGrid = ({
  properties,
  loading,
  emptyTitle = 'No properties found',
  emptyDescription,
  showStatus = false,
}) => {
  if (loading) return <PropertyGridSkeleton />;

  if (!properties || properties.length === 0) {
    return (
      <EmptyState
        icon={Home}
        title={emptyTitle}
        description={emptyDescription || 'Try adjusting your search or filters to find more results.'}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property._id} property={property} showStatus={showStatus} />
      ))}
    </div>
  );
};

export default PropertyGrid;
