import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PropertyForm from '../../components/property/PropertyForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import propertyService from '../../services/propertyService';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Edit Property | Haven Realty';
    propertyService
      .getPropertyById(id)
      .then((res) => {
        const fetched = res.data.property;
        if (String(fetched.owner._id) !== String(user._id) && user.role !== 'admin') {
          toast.error('You are not authorized to edit this property');
          navigate('/dashboard/properties');
          return;
        }
        setProperty(fetched);
      })
      .catch((error) => {
        toast.error(getErrorMessage(error));
        navigate('/dashboard/properties');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (formData, { hasImages }) => {
    if (!hasImages) {
      toast.error('A property must have at least one image');
      return;
    }

    setSubmitting(true);
    try {
      await propertyService.updateProperty(id, formData);
      toast.success('Property updated successfully');
      navigate('/dashboard/properties');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner className="min-h-[50vh]" label="Loading property" />;
  if (!property) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Edit Property</h1>
      <p className="mt-1 text-sm text-slate-500">Editing your listing will require re-approval from admin.</p>

      <div className="mt-6">
        <PropertyForm
          initialValues={property}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Update Property"
        />
      </div>
    </div>
  );
};

export default EditProperty;
