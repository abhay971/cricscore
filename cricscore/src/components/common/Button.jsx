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
    primary: 'bg-white hover:bg-white/90 text-[#0B0D14]',
    secondary: 'bg-[#141620] hover:bg-[#1A1D2E] text-white border border-[#1E2030]',
    outline: 'bg-transparent hover:bg-white/5 text-white border border-[#1E2030]',
    ghost: 'bg-transparent hover:bg-white/5 text-white',
    danger: 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20',
    success: 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20',
    grid: 'bg-[#141620] hover:bg-[#1A1D2E] text-white border border-[#1E2030] font-semibold'
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
        font-medium
        rounded-xl
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
