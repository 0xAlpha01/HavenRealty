import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Mail, MapPin, Phone } from 'lucide-react';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import contactService from '../services/contactService';
import { getErrorMessage } from '../services/api';

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.title = 'Contact Us | Haven Realty';
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await contactService.sendContactMessage(data);
      toast.success('Message sent successfully');
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-16">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-navy-900">Get in Touch</h1>
        <p className="mt-2 text-slate-500">We would love to hear from you. Send us a message below.</p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="card flex items-start gap-3 p-5">
            <MapPin className="mt-0.5 text-navy-600" size={20} />
            <div>
              <p className="text-sm font-semibold text-navy-900">Office</p>
              <p className="text-sm text-slate-500">Victoria Island, Lagos, Nigeria</p>
            </div>
          </div>
          <div className="card flex items-start gap-3 p-5">
            <Phone className="mt-0.5 text-navy-600" size={20} />
            <div>
              <p className="text-sm font-semibold text-navy-900">Phone</p>
              <p className="text-sm text-slate-500">+234 800 000 0000</p>
            </div>
          </div>
          <div className="card flex items-start gap-3 p-5">
            <Mail className="mt-0.5 text-navy-600" size={20} />
            <div>
              <p className="text-sm font-semibold text-navy-900">Email</p>
              <p className="text-sm text-slate-500">hello@havenrealty.example</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              id="name"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
            <Input
              label="Email"
              id="email"
              type="email"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
          </div>
          <Input
            label="Subject"
            id="subject"
            error={errors.subject?.message}
            {...register('subject', { required: 'Subject is required' })}
          />
          <Textarea
            label="Message"
            id="message"
            error={errors.message?.message}
            {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Message is too short' } })}
          />
          <Button type="submit" loading={submitting} className="w-full sm:w-auto">
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
