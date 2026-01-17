/**
 * Button Component
 * Reusable button with variants and states
 */

import { useHaptics } from '../../hooks/useHaptics';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick, 
  disabled = false,
  type = 'button',
  className = '',
  enableHaptics = true,
  ...props 
}) => {
  const { lightTap } = useHaptics();
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-sm hover:shadow-md active:scale-95';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus:ring-primary-400 active:from-primary-800 active:to-primary-900',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400 active:bg-gray-300 border border-gray-200',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-400 active:from-red-800 active:to-red-900',
    outline: 'border-2 border-primary-600 text-primary-700 hover:bg-primary-50 hover:border-primary-700 focus:ring-primary-400 active:bg-primary-100',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-400 active:bg-gray-200',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const handleClick = (e) => {
    if (enableHaptics && !disabled) {
      lightTap();
    }
    onClick?.(e);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
