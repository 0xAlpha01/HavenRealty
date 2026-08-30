import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShieldCheck } from 'lucide-react';
import PropertyForm from '../../components/property/PropertyForm';
import propertyService from '../../services/propertyService';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CreateProperty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Add Property | Haven Realty';
  }, []);

  const handleSubmit = async (formData, { hasImages }) => {
    if (!hasImages) {
      toast.error('Please upload at least one property image');
      return;
    }

    setSubmitting(true);
    try {
      const res = await propertyService.createProperty(formData);
      toast.success('Property created successfully');
      navigate(`/dashboard/properties`);
      return res;
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Add New Property</h1>
      <p className="mt-1 text-sm text-slate-500">
        Submit your property details below. New listings are reviewed before going live.
      </p>

      {!user.phoneVerified && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-gold-50 px-4 py-3 text-sm text-gold-700">
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
        <PropertyForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Submit Property" />
      </div>
    </div>
  );
};

export default CreateProperty;
