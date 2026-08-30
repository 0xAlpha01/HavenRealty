import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Building, Clock, Heart, Inbox, ThumbsUp } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import PropertyGrid from '../../components/property/PropertyGrid';
import { DashboardSkeleton } from '../../components/ui/Skeletons';
import propertyService from '../../services/propertyService';
import favoriteService from '../../services/favoriteService';
import inquiryService from '../../services/inquiryService';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DashboardOverview = () => {
  const { user } = useAuth();
  const [myProperties, setMyProperties] = useState([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [inquiriesCount, setInquiriesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard | Haven Realty';
    Promise.all([
      propertyService.getMyProperties(),
      favoriteService.getFavorites(),
      inquiryService.getInquiries('received'),
    ])
      .then(([propertiesRes, favoritesRes, inquiriesRes]) => {
        setMyProperties(propertiesRes.data);
        setFavoritesCount(favoritesRes.data.length);
        setInquiriesCount(inquiriesRes.data.length);
      })
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(
    () => ({
      total: myProperties.length,
      approved: myProperties.filter((p) => p.status === 'approved').length,
      pending: myProperties.filter((p) => p.status === 'pending').length,
    }),
    [myProperties]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Welcome back, {user.fullName.split(' ')[0]}</h1>
      <p className="mt-1 text-sm text-slate-500">Here&apos;s an overview of your activity</p>

      {loading ? (
        <div className="mt-6">
          <DashboardSkeleton />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="My Properties" value={stats.total} icon={Building} />
          <StatCard label="Approved" value={stats.approved} icon={ThumbsUp} accent="bg-emerald-50 text-emerald-700" />
          <StatCard label="Pending" value={stats.pending} icon={Clock} accent="bg-amber-50 text-amber-700" />
          <StatCard label="Saved Properties" value={favoritesCount} icon={Heart} accent="bg-red-50 text-red-600" />
          <StatCard label="Inquiries Received" value={inquiriesCount} icon={Inbox} accent="bg-sky-50 text-sky-700" />
        </div>
      )}

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy-900">Recent Listings</h2>
          <Link to="/dashboard/properties" className="text-sm font-semibold text-navy-700 hover:text-navy-900">
            View all
          </Link>
        </div>
        <PropertyGrid
          properties={myProperties.slice(0, 3)}
          loading={loading}
          showStatus
          emptyTitle="You haven't listed any properties yet"
          emptyDescription="Start listing your first property to reach thousands of buyers and renters."
        />
      </div>
    </div>
  );
};

export default DashboardOverview;
