import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Users } from 'lucide-react';
import AgentCard from '../../components/agent/AgentCard';
import { AgentSkeleton } from '../../components/ui/Skeletons';
import EmptyState from '../../components/ui/EmptyState';
import agentService from '../../services/agentService';
import { getErrorMessage } from '../../services/api';

const AdminAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Manage Agents | Haven Realty Admin';
    agentService
      .getAgents()
      .then((res) => setAgents(res.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Agents</h1>
      <p className="mt-1 text-sm text-slate-500">Agents and property owners active on the platform</p>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <AgentSkeleton key={i} />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <EmptyState icon={Users} title="No agents found" />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {agents.map((agent) => (
              <AgentCard key={agent._id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAgents;
