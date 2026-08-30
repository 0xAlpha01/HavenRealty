import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2, Eye, EyeOff, XCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PasswordStrengthMeter from '../components/ui/PasswordStrengthMeter';
import authService from '../services/authService';
import { getErrorMessage } from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    document.title = 'Reset Password | Haven Realty';
  }, []);

  const onSubmit = async (data) => {
    if (!token) {
      return;
    }

    setSubmitting(true);
    try {
      await authService.resetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setSuccess(true);
    } catch (error) {
      setSuccess(false);
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
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
          <h1 className="mt-4 text-2xl font-bold text-navy-900">Reset Password</h1>
        </div>

        <div className="card p-6">
          {!token ? (
            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                <XCircle size={26} />
              </span>
              <p className="mt-4 text-sm font-medium text-navy-900">Reset link is invalid or has expired.</p>
              <Link to="/forgot-password" className="btn-primary mt-5 w-full">
                Request New Link
              </Link>
            </div>
          ) : success ? (
            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={26} />
              </span>
              <p className="mt-4 text-sm font-medium text-navy-900">
                Your password has been reset successfully.
              </p>
              <Button className="mt-5 w-full" onClick={() => navigate('/login')}>
                Login to Haven Realty
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <Input
                  label="New Password"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
                <PasswordStrengthMeter password={password} />
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword', {
                    required: 'Please confirm your new password',
                    validate: (value) => value === watch('password') || 'Passwords do not match',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              <Button type="submit" loading={submitting} className="w-full">
                Reset Password
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
