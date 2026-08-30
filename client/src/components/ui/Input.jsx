import { forwardRef } from 'react';

const Input = forwardRef(({ label, id, error, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
    )}
    <input
      id={id}
      ref={ref}
      className={`input-field ${error ? 'border-red-400 focus:border-red-500' : ''} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));

Input.displayName = 'Input';

export default Input;
