import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Building2, MailCheck } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import authService from '../services/authService';
import { getErrorMessage } from '../services/api';

const ForgotPassword = () => {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.title = 'Forgot Password | Haven Realty';
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMessage('');
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
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
          <h1 className="mt-4 text-2xl font-bold text-navy-900">Forgot Password?</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your email address and we&apos;ll send you a secure password reset link.
          </p>
        </div>

        <div className="card p-6">
          {sent ? (
            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <MailCheck size={26} />
              </span>
              <p className="mt-4 text-sm font-medium text-navy-900">
                Check your email for instructions to reset your password.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                The link will expire in 15 minutes. If you don&apos;t see it, check your spam folder.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                id="email"
                type="email"
                error={errors.email?.message}
                {...register('email', { required: 'Email is required' })}
              />
              {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
              <Button type="submit" loading={submitting} className="w-full">
                Send Reset Link
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-navy-800 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
