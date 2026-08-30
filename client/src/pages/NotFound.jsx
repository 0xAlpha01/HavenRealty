import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  useEffect(() => {
    document.title = 'Page Not Found | Haven Realty';
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-extrabold text-navy-800">404</p>
      <h1 className="mt-3 text-2xl font-bold text-navy-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link to="/" className="btn-primary mt-6">
        <Home size={16} /> Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
