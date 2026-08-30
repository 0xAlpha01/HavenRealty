import { forwardRef } from 'react';

const Textarea = forwardRef(({ label, id, error, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
    )}
    <textarea
      id={id}
      ref={ref}
      className={`input-field min-h-[120px] resize-y ${error ? 'border-red-400' : ''} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));

Textarea.displayName = 'Textarea';

export default Textarea;
