import { statusColors } from '../../utils/formatters';

const Badge = ({ status, children, className = '' }) => (
  <span className={`badge ${statusColors[status] || 'bg-gray-100 text-slate-600'} ${className}`}>
    {children || status}
  </span>
);

export default Badge;
