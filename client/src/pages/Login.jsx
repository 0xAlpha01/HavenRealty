import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Building2 } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { getErrorMessage } from '../services/api';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { rememberMe: true } });

  useEffect(() => {
    document.title = 'Login | Haven Realty';
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setVerificationNotice(null);
    try {
      await login(data);
      toast.success('Login successful');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (error) {
      const responseData = error?.response?.data?.data;
      if (responseData?.requiresEmailVerification) {
        setVerificationNotice({ email: responseData.email });
      }
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationNotice?.email) return;
    setResending(true);
    try {
      await authService.resendVerification(verificationNotice.email);
      toast.success('Verification email sent. Please check your inbox.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-navy-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-gold-400">
              <Building2 size={22} />
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-navy-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Login to manage your properties and favorites</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          <Input
            label="Email"
            id="email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Input
            label="Password"
            id="password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" {...register('rememberMe')} />
              Remember me
            </label>
            <Link to="/forgot-password" className="font-medium text-navy-700 hover:underline">
              Forgot password?
            </Link>
          </div>

          {verificationNotice && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <p>Your email address hasn&apos;t been verified yet.</p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="mt-1.5 font-semibold underline disabled:opacity-60"
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}

          <Button type="submit" loading={submitting} className="w-full">
            Login
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-navy-800 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
