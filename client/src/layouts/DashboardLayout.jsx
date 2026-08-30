import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';

const DashboardLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <div className="hidden w-64 shrink-0 lg:block">
          <DashboardSidebar />
        </div>

        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-navy-900/50" onClick={() => setDrawerOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-elevated">
              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-sm font-semibold text-navy-900">Dashboard Menu</span>
                <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>
              <DashboardSidebar />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="m-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-navy-800 lg:hidden"
          >
            <Menu size={16} /> Menu
          </button>
          <div className="container-page py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
