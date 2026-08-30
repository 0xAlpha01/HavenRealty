import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Building, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/Skeletons';
import propertyService from '../../services/propertyService';
import { getErrorMessage } from '../../services/api';
import { formatDate, formatNumber, formatPrice, propertyTypeLabel } from '../../utils/formatters';

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = 'My Properties | Haven Realty';
    loadProperties();
  }, []);

  const loadProperties = () => {
    setLoading(true);
    propertyService
      .getMyProperties()
      .then((res) => setProperties(res.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await propertyService.deleteProperty(deleteTarget._id);
      toast.success('Property deleted successfully');
      setProperties((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">My Properties</h1>
        <Link to="/dashboard/properties/create" className="btn-primary">
          <Plus size={16} /> Add Property
        </Link>
      </div>

      {!loading && properties.length === 0 ? (
        <EmptyState
          icon={Building}
          title="No properties listed yet"
          description="Create your first listing to start reaching buyers and renters."
          actionLabel="Add Property"
          actionTo="/dashboard/properties/create"
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)
                : properties.map((property) => (
                    <tr key={property._id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={property.images?.[0]?.url}
                            alt={property.title}
                            className="h-12 w-14 shrink-0 rounded-lg object-cover"
                          />
                          <span className="max-w-[180px] truncate font-medium text-navy-900">{property.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatPrice(property.price, property.listingType)}</td>
                      <td className="px-4 py-3">{propertyTypeLabel(property.propertyType)}</td>
                      <td className="px-4 py-3">
                        <Badge status={property.status} />
                      </td>
                      <td className="px-4 py-3">{formatNumber(property.views)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(property.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/properties/${property._id}`}
                            className="rounded-lg p-2 text-slate-500 hover:bg-gray-100"
                            aria-label="View property"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            to={`/dashboard/properties/${property._id}/edit`}
                            className="rounded-lg p-2 text-slate-500 hover:bg-gray-100"
                            aria-label="Edit property"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(property)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            aria-label="Delete property"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete property"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot be undone.
      </Modal>
    </div>
  );
};

export default MyProperties;
