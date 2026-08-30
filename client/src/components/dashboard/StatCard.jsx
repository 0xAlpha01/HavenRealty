const StatCard = ({ label, value, icon: Icon, accent = 'bg-navy-50 text-navy-700' }) => (
  <div className="card flex items-center gap-4 p-5">
    <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}>
      <Icon size={22} />
    </span>
    <div>
      <p className="text-2xl font-bold text-navy-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
);

export default StatCard;
