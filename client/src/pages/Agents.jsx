import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Users } from 'lucide-react';
import AgentCard from '../components/agent/AgentCard';
import { AgentSkeleton } from '../components/ui/Skeletons';
import EmptyState from '../components/ui/EmptyState';
import agentService from '../services/agentService';
import { getErrorMessage } from '../services/api';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Our Agents | Haven Realty';
    agentService
      .getAgents()
      .then((res) => setAgents(res.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-navy-900">Meet Our Agents</h1>
        <p className="mt-2 text-slate-500">Trusted professionals ready to help you find your next property</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <AgentSkeleton key={i} />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <EmptyState icon={Users} title="No agents found" description="Check back soon as more agents join the platform." />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {agents.map((agent) => (
            <AgentCard key={agent._id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Agents;
