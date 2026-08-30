const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

export const PropertyCardSkeleton = () => (
  <div className="card overflow-hidden">
    <Shimmer className="h-52 w-full rounded-none" />
    <div className="space-y-3 p-4">
      <Shimmer className="h-4 w-3/4" />
      <Shimmer className="h-5 w-1/2" />
      <Shimmer className="h-3 w-2/3" />
      <Shimmer className="h-3 w-full" />
    </div>
  </div>
);

export const PropertyGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <PropertyCardSkeleton key={i} />
    ))}
  </div>
);

export const PropertyDetailsSkeleton = () => (
  <div className="container-page py-10">
    <Shimmer className="mb-6 h-96 w-full" />
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Shimmer className="h-8 w-2/3" />
        <Shimmer className="h-5 w-1/3" />
        <Shimmer className="h-24 w-full" />
      </div>
      <Shimmer className="h-64 w-full" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Shimmer key={i} className="h-28 w-full" />
    ))}
  </div>
);

export const AgentSkeleton = () => (
  <div className="card space-y-3 p-5">
    <Shimmer className="mx-auto h-20 w-20 rounded-full" />
    <Shimmer className="mx-auto h-4 w-2/3" />
    <Shimmer className="mx-auto h-3 w-1/2" />
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Shimmer className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export default Shimmer;
