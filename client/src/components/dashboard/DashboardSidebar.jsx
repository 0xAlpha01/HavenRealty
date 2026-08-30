import { NavLink } from 'react-router-dom';
import {
  Heart,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  User,
  Building,
  Inbox,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/dashboard/properties', label: 'My Properties', icon: Building },
  { to: '/dashboard/properties/create', label: 'Add Property', icon: Plus },
  { to: '/dashboard/favorites', label: 'Saved Properties', icon: Heart },
  { to: '/dashboard/inquiries', label: 'Inquiries', icon: Inbox },
  { to: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const DashboardSidebar = () => {
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

export default DashboardSidebar;
