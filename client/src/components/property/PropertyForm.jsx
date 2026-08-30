import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import TagInput from '../ui/TagInput';
import Button from '../ui/Button';
import ImageUploader from './ImageUploader';

const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'villa', label: 'Villa' },
  { value: 'office', label: 'Office' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
  { value: 'shop', label: 'Shop' },
];

const LISTING_TYPES = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
];

const AMENITY_SUGGESTIONS = [
  '24/7 Security',
  'Swimming Pool',
  'Gym',
  'Backup Power',
  'Parking',
  'CCTV',
  'Elevator',
  'Water Treatment Plant',
];

const FEATURE_SUGGESTIONS = ['Fitted Kitchen', 'Air Conditioning', 'Balcony', 'Walk-in Closet', 'Furnished'];

const PropertyForm = ({ initialValues, onSubmit, submitting, submitLabel = 'Submit' }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: initialValues });

  const [amenities, setAmenities] = useState(initialValues?.amenities || []);
  const [features, setFeatures] = useState(initialValues?.features || []);
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(initialValues?.images || []);
  const [removedImageIds, setRemovedImageIds] = useState([]);

  const handleRemoveExisting = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img._id !== imageId));
    setRemovedImageIds((prev) => [...prev, imageId]);
  };

  const submitForm = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') formData.append(key, value);
    });
    formData.append('amenities', JSON.stringify(amenities));
    formData.append('features', JSON.stringify(features));
    files.forEach((file) => formData.append('images', file));
    removedImageIds.forEach((id) => formData.append('removedImageIds', id));

    onSubmit(formData, { hasImages: files.length > 0 || existingImages.length > 0 });
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-8">
      <section className="card space-y-4 p-6">
        <h2 className="text-base font-semibold text-navy-900">Basic Information</h2>
        <Input
          label="Property Title"
          id="title"
          placeholder="e.g. Modern 3 Bedroom Apartment"
          error={errors.title?.message}
          {...register('title', { required: 'Title is required' })}
        />
        <Textarea
          label="Description"
          id="description"
          placeholder="Describe the property in detail..."
          error={errors.description?.message}
          {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Description is too short' } })}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Price (₦)"
            id="price"
            type="number"
            min="0"
            error={errors.price?.message}
            {...register('price', { required: 'Price is required', min: { value: 1, message: 'Enter a valid price' } })}
          />
          <Select
            label="Property Type"
            id="propertyType"
            options={PROPERTY_TYPES}
            placeholder="Select type"
            error={errors.propertyType?.message}
            {...register('propertyType', { required: 'Property type is required' })}
          />
          <Select
            label="Listing Type"
            id="listingType"
            options={LISTING_TYPES}
            placeholder="Sale or Rent"
            error={errors.listingType?.message}
            {...register('listingType', { required: 'Listing type is required' })}
          />
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-base font-semibold text-navy-900">Location</h2>
        <Input
          label="Address"
          id="address"
          error={errors.address?.message}
          {...register('address', { required: 'Address is required' })}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="City"
            id="city"
            error={errors.city?.message}
            {...register('city', { required: 'City is required' })}
          />
          <Input
            label="State"
            id="state"
            error={errors.state?.message}
            {...register('state', { required: 'State is required' })}
          />
          <Input label="Country" id="country" defaultValue="Nigeria" {...register('country')} />
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-base font-semibold text-navy-900">Property Details</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Input label="Bedrooms" id="bedrooms" type="number" min="0" {...register('bedrooms')} />
          <Input label="Bathrooms" id="bathrooms" type="number" min="0" {...register('bathrooms')} />
          <Input label="Parking Spaces" id="parkingSpaces" type="number" min="0" {...register('parkingSpaces')} />
          <Input
            label="Area (sqm)"
            id="area"
            type="number"
            min="0"
            error={errors.area?.message}
            {...register('area', { required: 'Area is required' })}
          />
          <Input label="Year Built" id="yearBuilt" type="number" min="1900" {...register('yearBuilt')} />
        </div>
      </section>

      <section className="card space-y-5 p-6">
        <h2 className="text-base font-semibold text-navy-900">Amenities & Features</h2>
        <TagInput label="Amenities" tags={amenities} onChange={setAmenities} suggestions={AMENITY_SUGGESTIONS} />
        <TagInput label="Features" tags={features} onChange={setFeatures} suggestions={FEATURE_SUGGESTIONS} />
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-base font-semibold text-navy-900">Property Images</h2>
        <ImageUploader
          files={files}
          onFilesChange={setFiles}
          existingImages={existingImages}
          onRemoveExisting={handleRemoveExisting}
        />
      </section>

      <Button type="submit" loading={submitting} className="w-full sm:w-auto">
        {submitLabel}
      </Button>
    </form>
  );
};

export default PropertyForm;
