import { motion } from 'framer-motion';
import { forwardRef } from 'react';

/**
 * Professional Button Component
 * Clean, modern design matching reference
 */
const Button = forwardRef(({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}, ref) => {

  const handleClick = (e) => {
    if (disabled || loading) return;

    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    onClick?.(e);
  };

  const variants = {
    primary: 'bg-[#8BC9E8] hover:bg-[#A8D5E8] text-[#2C2D3F] shadow-lg',
    secondary: 'bg-[#353647] hover:bg-[#3D3E52] text-white border border-[#4A4B5E]',
    outline: 'bg-transparent hover:bg-[#353647] text-white border-2 border-[#4A4B5E]',
    ghost: 'bg-transparent hover:bg-[#353647]/50 text-white',
    danger: 'bg-red-500/100 hover:bg-red-600 text-white shadow-lg',
    success: 'bg-green-500/100 hover:bg-green-600 text-white shadow-lg',
    // Grid button style (for scorer interface)
    grid: 'bg-[#353647] hover:bg-[#3D3E52] text-white border border-[#4A4B5E] shadow-lg font-semibold'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
    // Grid size for number buttons
    grid: 'px-4 py-4 text-lg min-h-[56px]'
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        font-body font-medium
        rounded-button
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.98]
        flex items-center justify-center gap-2
        ${className}
      `}
      whileHover={!disabled && !loading ? { scale: 1.01 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
