import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Inbox, Mail, Phone, ShieldCheck } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import inquiryService from '../../services/inquiryService';
import { getErrorMessage } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
];

const Inquiries = () => {
  const { user } = useAuth();
  const [scope, setScope] = useState('received');
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    document.title = 'Inquiries | Haven Realty';
  }, []);

  useEffect(() => {
    setLoading(true);
    inquiryService
      .getInquiries(scope)
      .then((res) => setInquiries(res.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [scope]);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await inquiryService.updateInquiry(id, { status });
      setInquiries((prev) => prev.map((item) => (item._id === id ? { ...item, status } : item)));
      toast.success('Inquiry status updated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Inquiries</h1>
      <p className="mt-1 text-sm text-slate-500">Manage property inquiries you&apos;ve sent or received</p>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => setScope('received')}
          className={`btn ${scope === 'received' ? 'bg-navy-800 text-white' : 'border border-gray-200 text-slate-600'}`}
        >
          Received
        </button>
        <button
          type="button"
          onClick={() => setScope('sent')}
          className={`btn ${scope === 'sent' ? 'bg-navy-800 text-white' : 'border border-gray-200 text-slate-600'}`}
        >
          Sent by Me
        </button>
      </div>

      {scope === 'received' && !user.phoneVerified && inquiries.length > 0 && (
        <div className="mt-5 flex items-center gap-2 rounded-lg bg-gold-50 px-4 py-3 text-sm text-gold-700">
          <ShieldCheck size={16} className="shrink-0" />
          <span>
            Verify your phone number to increase client trust.{' '}
            <Link to="/verify-phone" className="font-semibold underline">
              Verify now
            </Link>
          </span>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner label="Loading inquiries" />
        ) : inquiries.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No inquiries yet"
            description={
              scope === 'received'
                ? 'When someone contacts you about a listing, it will show up here.'
                : "You haven't sent any inquiries yet. Browse properties to get started."
            }
            actionLabel={scope === 'sent' ? 'Browse Properties' : undefined}
            actionTo={scope === 'sent' ? '/properties' : undefined}
          />
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <div key={inquiry._id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/properties/${inquiry.property?._id}`}
                      className="font-semibold text-navy-900 hover:underline"
                    >
                      {inquiry.property?.title || 'Property no longer available'}
                    </Link>
                    <p className="mt-1 text-xs text-slate-400">{formatDate(inquiry.createdAt)}</p>
                  </div>
                  {scope === 'received' ? (
                    <Select
                      id={`status-${inquiry._id}`}
                      options={STATUS_OPTIONS}
                      value={inquiry.status}
                      disabled={updatingId === inquiry._id}
                      onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                      className="w-36"
                    />
                  ) : (
                    <Badge status={inquiry.status} />
                  )}
                </div>

                <p className="mt-3 text-sm text-slate-600">{inquiry.message}</p>

                <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-100 pt-4 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{inquiry.name}</span>
                  <span className="flex items-center gap-1">
                    <Mail size={13} /> {inquiry.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone size={13} /> {inquiry.phone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inquiries;
