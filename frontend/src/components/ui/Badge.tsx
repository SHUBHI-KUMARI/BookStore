import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors';
  
  const variants = {
    primary: 'bg-[var(--color-brand-dark-blue)] text-white',
    accent: 'bg-[var(--color-brand-muted-orange)] text-white',
    secondary: 'bg-[var(--color-brand-brown)] text-white',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
