import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PropertyForm from '../../components/property/PropertyForm';
import propertyService from '../../services/propertyService';
import { getErrorMessage } from '../../services/api';

const CreateProperty = () => {
  const navigate = useNavigate();
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

      <div className="mt-6">
        <PropertyForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Submit Property" />
      </div>
    </div>
  );
};

export default CreateProperty;
