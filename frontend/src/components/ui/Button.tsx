import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  isLoading,
  disabled,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 shadow-sm hover:shadow-md';
  
  const variants = {
    primary: 'bg-[var(--color-brand-dark-blue)] text-white hover:bg-black focus:ring-[var(--color-brand-dark-blue)]',
    secondary: 'bg-[var(--color-brand-muted-orange)] text-white hover:bg-[#c25f40] focus:ring-[var(--color-brand-muted-orange)]',
    outline: 'border-2 border-[var(--color-brand-dark-blue)] bg-transparent text-[var(--color-brand-dark-blue)] hover:bg-[var(--color-brand-dark-blue)] hover:text-white',
    ghost: 'bg-transparent text-[var(--color-brand-brown)] shadow-none hover:bg-gray-100 hover:shadow-none'
  };
  
  const sizes = {
    sm: 'h-10 px-5 text-sm',
    md: 'h-12 py-2 px-8 text-base',
    lg: 'h-14 px-10 text-lg'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 animate-spin w-5 h-5 flex-shrink-0" />
          <span className="opacity-90 tracking-wide">Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
