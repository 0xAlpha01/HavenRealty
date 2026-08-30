import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AlertTriangle, Check, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { formatPrice } from '../../utils/formatters';

const AdminReports = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    document.title = 'Reported Properties | Haven Realty Admin';
    loadReports();
  }, []);

  const loadReports = () => {
    setLoading(true);
    adminService
      .getAllProperties({ reported: 'true' })
      .then((res) => setProperties(res.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  };

  const handleDismiss = async (id) => {
    setProcessingId(id);
    try {
      await adminService.dismissReport(id);
      setProperties((prev) => prev.filter((p) => p._id !== id));
      toast.success('Report dismissed');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    setProcessingId(id);
    try {
      await adminService.deleteProperty(id);
      setProperties((prev) => prev.filter((p) => p._id !== id));
      toast.success('Property deleted');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Reported Properties</h1>
      <p className="mt-1 text-sm text-slate-500">Listings flagged by users for review</p>

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner label="Loading reports" />
        ) : properties.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="No reported properties" description="Flagged listings will show up here for review." />
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property._id} className="card flex flex-wrap items-center gap-4 p-5">
                <img
                  src={property.images?.[0]?.url}
                  alt={property.title}
                  className="h-16 w-20 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link to={`/properties/${property._id}`} className="font-semibold text-navy-900 hover:underline">
                    {property.title}
                  </Link>
                  <p className="text-xs text-slate-500">{formatPrice(property.price, property.listingType)}</p>
                  <p className="mt-1 text-xs font-medium text-red-600">Reason: {property.reportReason}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    loading={processingId === property._id}
                    onClick={() => handleDismiss(property._id)}
                  >
                    <Check size={15} /> Dismiss
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(property._id)}>
                    <Trash2 size={15} /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
