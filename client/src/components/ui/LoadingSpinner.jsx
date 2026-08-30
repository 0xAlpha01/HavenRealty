import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 28, className = '', label = 'Loading' }) => (
  <div className={`flex flex-col items-center justify-center gap-2 py-10 text-navy-600 ${className}`}>
    <Loader2 size={size} className="animate-spin" />
    <span className="text-sm text-slate-500">{label}&hellip;</span>
  </div>
);

export default LoadingSpinner;
