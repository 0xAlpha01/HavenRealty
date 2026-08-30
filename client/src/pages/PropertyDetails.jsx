import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  BedDouble,
  Bath,
  Building2,
  Calendar,
  Car,
  Check,
  Eye,
  Flag,
  MapPin,
  Ruler,
  Share2,
} from 'lucide-react';
import PropertyGallery from '../components/property/PropertyGallery';
import PropertyCard from '../components/property/PropertyCard';
import FavoriteButton from '../components/property/FavoriteButton';
import Textarea from '../components/ui/Textarea';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { PropertyDetailsSkeleton } from '../components/ui/Skeletons';
import propertyService from '../services/propertyService';
import inquiryService from '../services/inquiryService';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { formatDate, formatNumber, formatPrice, propertyTypeLabel } from '../utils/formatters';

const PropertyDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const loadProperty = () => {
    setLoading(true);
    propertyService
      .getPropertyById(id)
      .then((res) => {
        setProperty(res.data.property);
        setSimilarProperties(res.data.similarProperties);
      })
      .catch((error) => {
        toast.error(getErrorMessage(error));
        navigate('/properties');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProperty();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (property) document.title = `${property.title} | Haven Realty`;
  }, [property]);

  useEffect(() => {
    if (user) {
      reset({ name: user.fullName, email: user.email, phone: user.phone, message: '' });
    }
  }, [user, reset]);

  const handleShare = async () => {
    const shareData = { title: property.title, url: window.location.href };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const onSubmitInquiry = async (data) => {
    if (!isAuthenticated) {
      toast.info('Please login to contact the agent');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await inquiryService.createInquiry({ propertyId: property._id, ...data });
      toast.success('Message sent to the agent');
      reset({ name: user.fullName, email: user.email, phone: user.phone, message: '' });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to report a property');
      navigate('/login');
      return;
    }
    if (!reportReason.trim()) {
      toast.error('Please provide a reason for the report');
      return;
    }

    setReporting(true);
    try {
      await propertyService.reportProperty(property._id, reportReason.trim());
      toast.success('Property reported. Our team will review it shortly.');
      setReportOpen(false);
      setReportReason('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setReporting(false);
    }
  };

  if (loading) return <PropertyDetailsSkeleton />;
  if (!property) return null;

  const isOwner = user && String(property.owner._id) === String(user._id);

  return (
    <div className="container-page py-10">
      <nav className="mb-4 text-xs text-slate-400">
        <Link to="/" className="hover:text-navy-700">Home</Link> /{' '}
        <Link to="/properties" className="hover:text-navy-700">Properties</Link> /{' '}
        <span className="text-slate-600">{property.title}</span>
      </nav>

      <PropertyGallery images={property.images} title={property.title} />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="badge bg-navy-900 text-white">
                For {property.listingType === 'rent' ? 'Rent' : 'Sale'}
              </span>
              {isOwner && <span className="badge ml-2 bg-amber-100 text-amber-700">Your Listing - {property.status}</span>}
              <h1 className="mt-3 text-2xl font-bold text-navy-900 sm:text-3xl">{property.title}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin size={15} /> {property.address}, {property.city}, {property.state}, {property.country}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FavoriteButton propertyId={property._id} className="static shadow-none border border-gray-200" />
              <button type="button" onClick={handleShare} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-slate-600 hover:bg-gray-50" aria-label="Share property">
                <Share2 size={16} />
              </button>
              {!isOwner && (
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-slate-600 hover:bg-gray-50"
                  aria-label="Report property"
                >
                  <Flag size={16} />
                </button>
              )}
            </div>
          </div>

          <p className="mt-4 text-2xl font-extrabold text-gold-600">
            {formatPrice(property.price, property.listingType)}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-white p-5 sm:grid-cols-4">
            <div className="flex flex-col items-center gap-1 text-center">
              <BedDouble className="text-navy-600" size={20} />
              <span className="text-sm font-semibold text-navy-900">{property.bedrooms}</span>
              <span className="text-xs text-slate-500">Bedrooms</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Bath className="text-navy-600" size={20} />
              <span className="text-sm font-semibold text-navy-900">{property.bathrooms}</span>
              <span className="text-xs text-slate-500">Bathrooms</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Car className="text-navy-600" size={20} />
              <span className="text-sm font-semibold text-navy-900">{property.parkingSpaces}</span>
              <span className="text-xs text-slate-500">Parking</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Ruler className="text-navy-600" size={20} />
              <span className="text-sm font-semibold text-navy-900">{property.area}</span>
              <span className="text-xs text-slate-500">sqm</span>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-navy-900">Description</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{property.description}</p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 size={16} className="text-navy-500" /> Type: {propertyTypeLabel(property.propertyType)}
            </div>
            {property.yearBuilt && (
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={16} className="text-navy-500" /> Built in {property.yearBuilt}
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-600">
              <Eye size={16} className="text-navy-500" /> {formatNumber(property.views)} views
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar size={16} className="text-navy-500" /> Listed on {formatDate(property.createdAt)}
            </div>
          </div>

          {property.amenities?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-navy-900">Amenities</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check size={15} className="text-emerald-600" /> {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}

          {property.features?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-navy-900">Features</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {property.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check size={15} className="text-emerald-600" /> {feature}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-navy-900">Listed by</h3>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-navy-100">
                {property.owner.avatar?.url ? (
                  <img src={property.owner.avatar.url} alt={property.owner.fullName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-navy-700">
                    {property.owner.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <Link to={`/agents/${property.owner._id}`} className="text-sm font-semibold text-navy-900 hover:underline">
                  {property.owner.fullName}
                </Link>
                <p className="text-xs text-slate-500">{property.owner.phone}</p>
              </div>
            </div>
          </div>

          {!isOwner && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-navy-900">Contact Agent</h3>
              <form onSubmit={handleSubmit(onSubmitInquiry)} className="mt-4 space-y-3">
                <Input
                  id="name"
                  placeholder="Your name"
                  error={errors.name?.message}
                  {...register('name', { required: 'Name is required' })}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  error={errors.email?.message}
                  {...register('email', { required: 'Email is required' })}
                />
                <Input
                  id="phone"
                  placeholder="Your phone number"
                  error={errors.phone?.message}
                  {...register('phone', { required: 'Phone number is required' })}
                />
                <Textarea
                  id="message"
                  placeholder="I'm interested in this property..."
                  error={errors.message?.message}
                  {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Message is too short' } })}
                />
                <Button type="submit" loading={submitting} className="w-full">
                  Send Message
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {similarProperties.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-navy-900">Similar Properties</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similarProperties.map((item) => (
              <PropertyCard key={item._id} property={item} />
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Report this property"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReportOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={reporting} onClick={handleReportSubmit}>
              Submit Report
            </Button>
          </>
        }
      >
        <p className="mb-3">Let us know what&apos;s wrong with this listing.</p>
        <Textarea
          id="reportReason"
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          placeholder="e.g. Inaccurate information, suspicious listing, already sold..."
        />
      </Modal>
    </div>
  );
};

export default PropertyDetails;
