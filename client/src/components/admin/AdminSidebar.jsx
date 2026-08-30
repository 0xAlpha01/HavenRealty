import { NavLink } from 'react-router-dom';
import { AlertTriangle, Building, Clock, LayoutGrid, LogOut, Settings, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/properties', label: 'Properties', icon: Building },
  { to: '/admin/properties/pending', label: 'Pending Listings', icon: Clock },
  { to: '/admin/agents', label: 'Agents', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: AlertTriangle },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminSidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="flex h-full w-full flex-col justify-between border-r border-gray-100 bg-white px-4 py-6">
      <nav className="space-y-1">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-navy-800 text-white' : 'text-slate-600 hover:bg-gray-50'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        onClick={logout}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <LogOut size={17} /> Logout
      </button>
    </aside>
  );
};

export default AdminSidebar;
