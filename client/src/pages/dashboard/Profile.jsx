import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Camera } from 'lucide-react';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import authService from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar?.url || '');
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = 'My Profile | Haven Realty';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: user.fullName,
      phone: user.phone,
      bio: user.bio || '',
      location: user.location || '',
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await authService.updateProfile(formData);
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">My Profile</h1>
      <p className="mt-1 text-sm text-slate-500">Update your personal information</p>

      <form onSubmit={handleSubmit(onSubmit)} className="card mt-6 max-w-2xl space-y-5 p-6">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-navy-100">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-navy-700">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-navy-800 text-white"
              aria-label="Change avatar"
            >
              <Camera size={13} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="text-sm font-semibold text-navy-900">{user.fullName}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <Input
          label="Full Name"
          id="fullName"
          error={errors.fullName?.message}
          {...register('fullName', { required: 'Full name is required' })}
        />
        <Input
          label="Phone Number"
          id="phone"
          error={errors.phone?.message}
          {...register('phone', { required: 'Phone number is required' })}
        />
        <Input label="Location" id="location" placeholder="e.g. Lagos, Nigeria" {...register('location')} />
        <Textarea label="Bio" id="bio" placeholder="Tell us about yourself..." {...register('bio')} />

        <Button type="submit" loading={submitting}>
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default Profile;
