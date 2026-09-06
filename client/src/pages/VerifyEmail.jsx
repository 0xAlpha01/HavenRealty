import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2, Loader2, MailCheck, XCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import authService from '../services/authService';
import { getErrorMessage } from '../services/api';

const RESEND_COOLDOWN_SECONDS = 45;

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const emailFromQuery = searchParams.get('email') || '';

  // pending (just registered, no token yet) | checking | success | error
  const [state, setState] = useState(token ? 'checking' : 'pending');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState(emailFromQuery);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    document.title = 'Verify Email | Haven Realty';

    if (!token) return;

    authService
      .verifyEmail(token)
      .then(() => setState('success'))
      .catch((error) => {
        setState('error');
        setMessage(getErrorMessage(error));
      });
  }, [token]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    try {
      await authService.resendVerification(resendEmail);
      toast.success('If that account exists, a new verification email has been sent.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

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
        </div>

        <div className="card p-8 text-center">
          {state === 'pending' && (
            <>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                <MailCheck size={26} />
              </span>
              <h1 className="mt-4 text-xl font-bold text-navy-900">Verify your email</h1>
              <p className="mt-2 text-sm text-slate-500">
                We&apos;ve sent a verification link to{' '}
                {emailFromQuery ? <span className="font-medium text-navy-800">{emailFromQuery}</span> : 'your email address'}.
                Please verify your email before continuing.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Delivery can occasionally take up to 10-15 minutes. Please check your spam folder before requesting a new link.
              </p>

              <form onSubmit={handleResend} className="mt-6 space-y-3 text-left">
                <Input
                  label="Email address"
                  id="resendEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                />
                <Button type="submit" loading={resending} disabled={cooldown > 0} className="w-full">
                  {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Verification Email'}
                </Button>
              </form>
            </>
          )}

          {state === 'checking' && (
            <>
              <Loader2 size={40} className="mx-auto animate-spin text-navy-600" />
              <p className="mt-4 text-sm text-slate-500">Verifying your email address...</p>
            </>
          )}

          {state === 'success' && (
            <>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={28} />
              </span>
              <h1 className="mt-4 text-xl font-bold text-navy-900">Email verified successfully</h1>
              <p className="mt-2 text-sm text-slate-500">You can now log in to your Haven Realty account.</p>
              <Button className="mt-6 w-full" onClick={() => navigate('/login')}>
                Continue to Login
              </Button>
            </>
          )}

          {state === 'error' && (
            <>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                <XCircle size={28} />
              </span>
              <h1 className="mt-4 text-xl font-bold text-navy-900">Verification failed</h1>
              <p className="mt-2 text-sm text-slate-500">{message}</p>

              <form onSubmit={handleResend} className="mt-6 space-y-3 text-left">
                <Input
                  label="Email address"
                  id="resendEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                />
                <Button type="submit" loading={resending} disabled={cooldown > 0} className="w-full">
                  {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Verification Email'}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" className="font-semibold text-navy-800 hover:underline">
            Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
