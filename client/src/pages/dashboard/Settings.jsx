import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import authService from '../../services/authService';
import { getErrorMessage } from '../../services/api';

const Settings = () => {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.title = 'Settings | Haven Realty';
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await authService.changePassword(data);
      toast.success('Password changed successfully');
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Manage your account security</p>

      <form onSubmit={handleSubmit(onSubmit)} className="card mt-6 max-w-md space-y-4 p-6">
        <h2 className="text-base font-semibold text-navy-900">Change Password</h2>
        <Input
          label="Current Password"
          id="currentPassword"
          type="password"
          error={errors.currentPassword?.message}
          {...register('currentPassword', { required: 'Current password is required' })}
        />
        <Input
          label="New Password"
          id="newPassword"
          type="password"
          error={errors.newPassword?.message}
          {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Must be at least 6 characters' } })}
        />
        <Input
          label="Confirm New Password"
          id="confirmNewPassword"
          type="password"
          error={errors.confirmNewPassword?.message}
          {...register('confirmNewPassword', {
            required: 'Please confirm your new password',
            validate: (value) => value === watch('newPassword') || 'Passwords do not match',
          })}
        />
        <Button type="submit" loading={submitting}>
          Change Password
        </Button>
      </form>
    </div>
  );
};

export default Settings;
