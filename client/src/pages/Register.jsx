import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Building2 } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

const Register = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.title = 'Register | Haven Realty';
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const result = await registerUser(data);
      toast.success('Registration successful. Please verify your email and phone number.');
      navigate(`/verify-account?email=${encodeURIComponent(result.email)}&phone=${encodeURIComponent(result.phone)}`, {
        replace: true,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
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
          <h1 className="mt-4 text-2xl font-bold text-navy-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Join Haven Realty to save and list properties</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          <Input
            label="Full Name"
            id="fullName"
            error={errors.fullName?.message}
            {...register('fullName', { required: 'Full name is required', minLength: { value: 2, message: 'Name is too short' } })}
          />
          <Input
            label="Email"
            id="email"
            type="email"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
            })}
          />
          <Input
            label="Phone Number"
            id="phone"
            error={errors.phone?.message}
            {...register('phone', { required: 'Phone number is required' })}
          />
          <Input
            label="Password"
            id="password"
            type="password"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
          />
          <Input
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === watch('password') || 'Passwords do not match',
            })}
          />
          <Button type="submit" loading={submitting} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-navy-800 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
