import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Check, Clock, X } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import EmptyState from '../../components/ui/EmptyState';
import { PropertyGridSkeleton } from '../../components/ui/Skeletons';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { formatPrice, propertyTypeLabel } from '../../utils/formatters';

const AdminPendingListings = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    document.title = 'Pending Listings | Haven Realty Admin';
    loadPending();
  }, []);

  const loadPending = () => {
    setLoading(true);
    adminService
      .getAllProperties({ status: 'pending' })
      .then((res) => setProperties(res.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await adminService.approveProperty(id);
      setProperties((prev) => prev.filter((p) => p._id !== id));
      toast.success('Property approved');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    setProcessingId(rejectTarget._id);
    try {
      await adminService.rejectProperty(rejectTarget._id, rejectReason);
      setProperties((prev) => prev.filter((p) => p._id !== rejectTarget._id));
      toast.success('Property rejected');
      setRejectTarget(null);
      setRejectReason('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Pending Listings</h1>
      <p className="mt-1 text-sm text-slate-500">Review and approve or reject new property submissions</p>

      <div className="mt-6">
        {loading ? (
          <PropertyGridSkeleton />
        ) : properties.length === 0 ? (
          <EmptyState icon={Clock} title="No pending listings" description="All submitted properties have been reviewed." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div key={property._id} className="card overflow-hidden">
                <Link to={`/properties/${property._id}`}>
                  <img
                    src={property.images?.[0]?.url}
                    alt={property.title}
                    className="h-44 w-full object-cover"
                  />
                </Link>
                <div className="p-4">
                  <p className="font-bold text-navy-900">{formatPrice(property.price, property.listingType)}</p>
                  <h3 className="mt-1 truncate text-sm font-semibold text-slate-800">{property.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {property.city}, {property.state} &middot; {propertyTypeLabel(property.propertyType)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Submitted by {property.owner?.fullName}</p>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="primary"
                      loading={processingId === property._id}
                      onClick={() => handleApprove(property._id)}
                      className="flex-1"
                    >
                      <Check size={15} /> Approve
                    </Button>
                    <Button variant="danger" onClick={() => setRejectTarget(property)} className="flex-1">
                      <X size={15} /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Reject property"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={processingId === rejectTarget?._id} onClick={handleReject}>
              Reject Listing
            </Button>
          </>
        }
      >
        <p className="mb-3">Provide a reason for rejecting &quot;{rejectTarget?.title}&quot;:</p>
        <Textarea
          id="rejectReason"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g. Images are unclear, description is incomplete..."
        />
      </Modal>
    </div>
  );
};

export default AdminPendingListings;
