import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2, Circle, Mail, Phone } from 'lucide-react';
import Button from '../components/ui/Button';
import authService from '../services/authService';
import { getErrorMessage } from '../services/api';

const RESEND_COOLDOWN_SECONDS = 45;

const StatusRow = ({ icon: Icon, label, verified, action }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4">
    <div className="flex items-center gap-3">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          verified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
        }`}
      >
        <Icon size={18} />
      </span>
      <div>
        <p className="text-sm font-semibold text-navy-900">{label}</p>
        <p className={`flex items-center gap-1 text-xs font-medium ${verified ? 'text-emerald-600' : 'text-amber-600'}`}>
          {verified ? <CheckCircle2 size={13} /> : <Circle size={13} />}
          {verified ? 'Verified' : 'Not verified'}
        </p>
      </div>
    </div>
    {!verified && action}
  </div>
);

const VerifyAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';

  const [status, setStatus] = useState({ emailVerified: false, phoneVerified: false });
  const [checking, setChecking] = useState(true);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    document.title = 'Verify your account | Haven Realty';
    if (!email) navigate('/register', { replace: true });
  }, [email, navigate]);

  const checkStatus = useCallback(() => {
    if (!email) return;
    authService
      .getVerificationStatus(email)
      .then((res) => setStatus(res.data))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [email]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResendEmail = async () => {
    setResending(true);
    try {
      await authService.resendVerification(email);
      toast.success('Verification email sent. Please check your inbox.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  const bothVerified = status.emailVerified && status.phoneVerified;

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-navy-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-gold-400">
              <Building2 size={22} />
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-navy-900">Verify your account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Check your email and phone number to activate your Haven Realty account.
          </p>
        </div>

        <div className="card space-y-3 p-6">
          <StatusRow
            icon={Mail}
            label={email}
            verified={status.emailVerified}
            action={
              <Button variant="outline" loading={resending} disabled={cooldown > 0} onClick={handleResendEmail}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Email'}
              </Button>
            }
          />
          <StatusRow
            icon={Phone}
            label={phone || 'Phone number'}
            verified={status.phoneVerified}
            action={
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/verify-phone?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`)
                }
              >
                Verify Phone Number
              </Button>
            }
          />

          {!checking && bothVerified && (
            <div className="rounded-xl bg-emerald-50 p-4 text-center">
              <p className="text-sm font-semibold text-emerald-700">Your account is verified.</p>
              <Button className="mt-3 w-full" onClick={() => navigate('/login')}>
                Continue to Login
              </Button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already verified?{' '}
          <Link to="/login" className="font-semibold text-navy-800 hover:underline">
            Go to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyAccount;
