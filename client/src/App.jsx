import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const Agents = lazy(() => import('./pages/Agents'));
const AgentProfile = lazy(() => import('./pages/AgentProfile'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyAccount = lazy(() => import('./pages/VerifyAccount'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const VerifyPhone = lazy(() => import('./pages/VerifyPhone'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));

const DashboardOverview = lazy(() => import('./pages/dashboard/DashboardOverview'));
const MyProperties = lazy(() => import('./pages/dashboard/MyProperties'));
const CreateProperty = lazy(() => import('./pages/dashboard/CreateProperty'));
const EditProperty = lazy(() => import('./pages/dashboard/EditProperty'));
const Favorites = lazy(() => import('./pages/dashboard/Favorites'));
const Messages = lazy(() => import('./pages/dashboard/Messages'));
const Inquiries = lazy(() => import('./pages/dashboard/Inquiries'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminProperties = lazy(() => import('./pages/admin/AdminProperties'));
const AdminPendingListings = lazy(() => import('./pages/admin/AdminPendingListings'));
const AdminAgents = lazy(() => import('./pages/admin/AdminAgents'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

const App = () => (
  <>
    <Suspense fallback={<LoadingSpinner className="min-h-[70vh]" label="Loading" />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/agents/:id" element={<AgentProfile />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-account" element={<VerifyAccount />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-phone" element={<VerifyPhone />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/dashboard/properties" element={<MyProperties />} />
            <Route path="/dashboard/properties/create" element={<CreateProperty />} />
            <Route path="/dashboard/properties/:id/edit" element={<EditProperty />} />
            <Route path="/dashboard/favorites" element={<Favorites />} />
            <Route path="/dashboard/messages" element={<Messages />} />
            <Route path="/dashboard/inquiries" element={<Inquiries />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="/dashboard/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/properties" element={<AdminProperties />} />
            <Route path="/admin/properties/pending" element={<AdminPendingListings />} />
            <Route path="/admin/agents" element={<AdminAgents />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route element={<MainLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>

    <ToastContainer position="top-right" autoClose={3500} hideProgressBar newestOnTop closeOnClick />
  </>
);

export default App;
