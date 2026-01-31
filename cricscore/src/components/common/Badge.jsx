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
    blue: 'bg-accent-info text-white',
    success: 'bg-accent-success text-white',
    warning: 'bg-accent-warning text-white',
    danger: 'bg-accent-danger text-white',
    gray: 'bg-[#4A4B5E] text-text-secondary',
    outline: 'bg-transparent border border-[#4A4B5E] text-text-secondary'
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
