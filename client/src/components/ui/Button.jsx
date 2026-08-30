import { Loader2 } from 'lucide-react';

const VARIANT_CLASS = {
  primary: 'btn-primary',
  gold: 'btn-gold',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const Button = ({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={`${VARIANT_CLASS[variant] || VARIANT_CLASS.primary} ${className}`}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading && <Loader2 size={16} className="animate-spin" />}
    {children}
  </button>
);

export default Button;
