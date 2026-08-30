import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import authService from '../services/authService';
import { getErrorMessage } from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [state, setState] = useState('checking'); // checking | success | error
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    document.title = 'Verify Email | Haven Realty';

    if (!token) {
      setState('error');
      setMessage('Verification link is invalid or has expired.');
      return;
    }

    authService
      .verifyEmail(token)
      .then((res) => {
        setState('success');
        setResult(res.data);
      })
      .catch((error) => {
        setState('error');
        setMessage(getErrorMessage(error));
      });
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    try {
      await authService.resendVerification(resendEmail);
      toast.success('If that account exists, a new verification email has been sent.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  const handleContinue = () => {
    if (result?.phoneVerified) {
      navigate('/login');
    } else {
      navigate(
        `/verify-account?email=${encodeURIComponent(result?.email || '')}&phone=${encodeURIComponent(result?.phone || '')}`
      );
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
              <p className="mt-2 text-sm text-slate-500">You can now continue setting up your account.</p>
              <Button className="mt-6 w-full" onClick={handleContinue}>
                Continue
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
                <Button type="submit" loading={resending} className="w-full">
                  Resend Verification Email
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
