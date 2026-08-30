import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Building, Eye, Trash2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/Skeletons';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { formatDate, formatPrice, propertyTypeLabel } from '../../utils/formatters';

const STATUS_FILTERS = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'sold', label: 'Sold' },
  { value: 'rented', label: 'Rented' },
];

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    document.title = 'Manage Properties | Haven Realty Admin';
  }, []);

  useEffect(() => {
    loadProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const loadProperties = () => {
    setLoading(true);
    adminService
      .getAllProperties(status ? { status } : {})
      .then((res) => setProperties(res.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  };

  const handleDelete = async () => {
    setProcessing(true);
    try {
      await adminService.deleteProperty(deleteTarget._id);
      setProperties((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      toast.success('Property deleted successfully');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Manage Properties</h1>
          <p className="mt-1 text-sm text-slate-500">View and manage all property listings</p>
        </div>
        <Select
          id="status-filter"
          placeholder="All Statuses"
          options={STATUS_FILTERS}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-48"
        />
      </div>

      {!loading && properties.length === 0 ? (
        <EmptyState icon={Building} title="No properties found" description="Try a different status filter." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)
                : properties.map((property) => (
                    <tr key={property._id}>
                      <td className="max-w-[200px] truncate px-4 py-3 font-medium text-navy-900">{property.title}</td>
                      <td className="px-4 py-3 text-slate-500">{property.owner?.fullName}</td>
                      <td className="whitespace-nowrap px-4 py-3">{formatPrice(property.price, property.listingType)}</td>
                      <td className="px-4 py-3">{propertyTypeLabel(property.propertyType)}</td>
                      <td className="px-4 py-3">
                        <Badge status={property.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">{formatDate(property.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/properties/${property._id}`}
                            className="rounded-lg p-2 text-slate-500 hover:bg-gray-100"
                            aria-label="View property"
                          >
                            <Eye size={16} />
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
            <Button variant="danger" loading={processing} onClick={handleDelete}>
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

export default AdminProperties;
