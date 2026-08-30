import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const AgentCard = ({ agent }) => (
  <div className="card flex flex-col items-center p-6 text-center">
    <div className="h-20 w-20 overflow-hidden rounded-full bg-navy-100">
      {agent.avatar?.url ? (
        <img src={agent.avatar.url} alt={agent.fullName} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-navy-700">
          {agent.fullName?.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
    <h3 className="mt-4 text-base font-semibold text-navy-900">{agent.fullName}</h3>
    {agent.location && (
      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
        <MapPin size={13} /> {agent.location}
      </p>
    )}
    <p className="mt-2 text-xs font-medium text-gold-600">{agent.propertiesCount || 0} properties listed</p>

    <div className="mt-4 w-full space-y-1.5 border-t border-gray-100 pt-4 text-left text-xs text-slate-500">
      {agent.phone && (
        <p className="flex items-center gap-2">
          <Phone size={13} /> {agent.phone}
        </p>
      )}
      {agent.email && (
        <p className="flex items-center gap-2 truncate">
          <Mail size={13} /> {agent.email}
        </p>
      )}
    </div>

    <Link to={`/agents/${agent._id}`} className="btn-outline mt-5 w-full">
      View Profile
    </Link>
  </div>
);

export default AgentCard;
