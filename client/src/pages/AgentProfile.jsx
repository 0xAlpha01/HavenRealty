import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BadgeCheck, Calendar, Mail, MapPin, Phone } from 'lucide-react';
import PropertyGrid from '../components/property/PropertyGrid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import agentService from '../services/agentService';
import { getErrorMessage } from '../services/api';
import { formatDate } from '../utils/formatters';

const AgentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    agentService
      .getAgentById(id)
      .then((res) => {
        setAgent(res.data.agent);
        setProperties(res.data.properties);
      })
      .catch((error) => {
        toast.error(getErrorMessage(error));
        navigate('/agents');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (agent) document.title = `${agent.fullName} | Haven Realty Agent`;
  }, [agent]);

  if (loading) return <LoadingSpinner className="min-h-[60vh]" label="Loading agent profile" />;
  if (!agent) return null;

  return (
    <div className="container-page py-10">
      <div className="card flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-start">
        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-navy-100">
          {agent.avatar?.url ? (
            <img src={agent.avatar.url} alt={agent.fullName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-navy-700">
              {agent.fullName?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-navy-900 sm:justify-start">
            {agent.fullName}
            {agent.phoneVerified && (
              <span className="badge bg-emerald-50 text-emerald-700">
                <BadgeCheck size={13} className="mr-1" /> Verified Agent
              </span>
            )}
          </h1>
          {agent.location && (
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-slate-500 sm:justify-start">
              <MapPin size={14} /> {agent.location}
            </p>
          )}
          {agent.bio && <p className="mt-4 text-sm leading-relaxed text-slate-600">{agent.bio}</p>}

          <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm text-slate-600 sm:justify-start">
            <span className="flex items-center gap-1.5">
              <Phone size={15} /> {agent.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail size={15} /> {agent.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={15} /> Joined {formatDate(agent.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-6 text-xl font-bold text-navy-900">Properties by {agent.fullName}</h2>
        <PropertyGrid
          properties={properties}
          loading={false}
          emptyTitle="No properties listed yet"
          emptyDescription={`${agent.fullName} hasn't listed any approved properties yet.`}
        />
      </div>
    </div>
  );
};

export default AgentProfile;
