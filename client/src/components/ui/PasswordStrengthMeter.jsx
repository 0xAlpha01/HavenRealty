const getStrength = (password) => {
  if (!password) return { label: '', score: 0 };

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { label: 'Weak', score };
  if (score <= 3) return { label: 'Fair', score };
  return { label: 'Strong', score };
};

const STYLES = {
  Weak: { bar: 'bg-red-500', text: 'text-red-600', width: 'w-1/3' },
  Fair: { bar: 'bg-amber-500', text: 'text-amber-600', width: 'w-2/3' },
  Strong: { bar: 'bg-emerald-500', text: 'text-emerald-600', width: 'w-full' },
};

const PasswordStrengthMeter = ({ password }) => {
  const { label } = getStrength(password);
  if (!password) return null;

  const style = STYLES[label];

  return (
    <div className="mt-1.5">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div className={`h-full rounded-full transition-all duration-300 ${style.bar} ${style.width}`} />
      </div>
      <p className={`mt-1 text-xs font-medium ${style.text}`}>{label}</p>
    </div>
  );
};

export default PasswordStrengthMeter;
