import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck } from 'lucide-react';
import OtpInput from '../components/ui/OtpInput';
import Button from '../components/ui/Button';
import authService from '../services/authService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RESEND_COOLDOWN_SECONDS = 45;

const VerifyPhone = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const email = user?.email || '';
  const phone = user?.phone || '';

  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [sentOnce, setSentOnce] = useState(false);

  useEffect(() => {
    document.title = 'Verify Phone Number | Haven Realty';

    if (user?.phoneVerified) {
      navigate('/dashboard/profile', { replace: true });
      return;
    }

    authService
      .sendPhoneOtp(email)
      .then(() => setSentOnce(true))
      .catch((error) => toast.error(getErrorMessage(error)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setVerifying(true);
    try {
      await authService.verifyPhoneOtp(email, otp);
      toast.success('Phone number verified successfully');
      updateUser({ ...user, phoneVerified: true });
      navigate('/dashboard/profile', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendPhoneOtp(email);
      toast.success('A new verification code has been sent.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp('');
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
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-700">
            <ShieldCheck size={26} />
          </span>
          <h1 className="mt-4 text-xl font-bold text-navy-900">Verify your phone number</h1>
          <p className="mt-2 text-sm text-slate-500">
            {sentOnce
              ? `We sent a 6-digit verification code to ${phone || 'your phone'}.`
              : 'Sending your verification code...'}
          </p>
          <p className="mt-3 rounded-lg bg-gold-50 px-3 py-2 text-xs text-gold-700">
            Verified phone numbers help clients feel more confident when contacting you. This step is optional.
          </p>

          <form onSubmit={handleVerify} className="mt-6 space-y-6">
            <OtpInput value={otp} onChange={setOtp} disabled={verifying} />

            <Button type="submit" loading={verifying} className="w-full">
              Verify Code
            </Button>
          </form>

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="mt-4 text-sm font-medium text-navy-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
          >
            {cooldown > 0 ? `Resend available in ${cooldown} seconds` : resending ? 'Resending...' : 'Resend Code'}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/dashboard/profile" className="font-semibold text-navy-800 hover:underline">
            Back to Profile
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyPhone;
