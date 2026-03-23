import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', id, ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && <label htmlFor={id} className="text-sm font-semibold text-[var(--color-brand-brown)] transition-colors group-focus-within:text-[var(--color-brand-dark-blue)]">{label}</label>}
      <div className="relative group">
        <textarea 
          id={id}
          className={`
            w-full rounded-xl border-2 bg-white px-4 py-3 text-base text-[var(--color-brand-brown)]
            transition-all duration-300 placeholder:text-gray-400 min-h-[120px] resize-y
            focus:border-[var(--color-brand-dark-blue)] focus:outline-none focus:ring-4 focus:ring-[var(--color-brand-dark-blue)]/10
            hover:border-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-sm font-medium text-red-500 animate-in slide-in-from-top-1 fade-in duration-200">{error}</span>}
    </div>
  );
};
