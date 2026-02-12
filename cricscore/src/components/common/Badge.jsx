/**
 * Badge Component
 * Status badges for matches and events
 */
const Badge = ({
  children,
  variant = 'blue',
  size = 'md',
  className = ''
}) => {
  const variants = {
    blue: 'bg-blue-500/20 text-blue-400',
    success: 'bg-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/20 text-amber-400',
    danger: 'bg-red-500/20 text-red-400',
    gray: 'bg-white/10 text-white/60',
    outline: 'bg-transparent border border-[#1E2030] text-white/60'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };

  return (
    <span
      className={`
        ${variants[variant]}
        ${sizes[size]}
        inline-flex items-center justify-center
        rounded-full
        font-semibold
        whitespace-nowrap
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
