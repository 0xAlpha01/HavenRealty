import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title, description, actionLabel, actionTo, onAction }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-600">
      <Icon size={26} />
    </div>
    <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
    {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
    {actionLabel && actionTo && (
      <Link to={actionTo} className="btn-primary mt-5">
        {actionLabel}
      </Link>
    )}
    {actionLabel && onAction && (
      <button type="button" onClick={onAction} className="btn-primary mt-5">
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
