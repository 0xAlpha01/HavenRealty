import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Building, Clock, Inbox, ThumbsUp, Users } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import { DashboardSkeleton } from '../../components/ui/Skeletons';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { propertyTypeLabel } from '../../utils/formatters';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#16233c', '#c98c1e', '#37578a', '#e6a92f', '#7e93ba', '#f4da8f', '#a9b7d1', '#eec257'];

const formatMonthlyData = (entries = []) =>
  entries.map((entry) => ({
    label: `${MONTH_NAMES[entry._id.month - 1]} ${entry._id.year}`,
    count: entry.count,
  }));

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Admin Dashboard | Haven Realty';
    adminService
      .getStats()
      .then((res) => setStats(res.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!stats) return null;

  const propertyTypeData = stats.propertiesByType.map((item) => ({
    name: propertyTypeLabel(item._id),
    value: item.count,
  }));

  const usersPerMonth = formatMonthlyData(stats.usersPerMonth);
  const propertiesPerMonth = formatMonthlyData(stats.propertiesPerMonth);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Platform-wide statistics and insights</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard label="Total Properties" value={stats.totalProperties} icon={Building} />
        <StatCard label="Pending" value={stats.pendingProperties} icon={Clock} accent="bg-amber-50 text-amber-700" />
        <StatCard label="Approved" value={stats.approvedProperties} icon={ThumbsUp} accent="bg-emerald-50 text-emerald-700" />
        <StatCard label="Total Inquiries" value={stats.totalInquiries} icon={Inbox} accent="bg-sky-50 text-sky-700" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-navy-900">Properties by Type</h2>
          {propertyTypeData.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={propertyTypeData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {propertyTypeData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-navy-900">New Listings per Month</h2>
          {propertiesPerMonth.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={propertiesPerMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#16233c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-navy-900">New Users per Month</h2>
          {usersPerMonth.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={usersPerMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#c98c1e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
