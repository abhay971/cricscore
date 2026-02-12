import { motion } from 'framer-motion';

/**
 * Card Component
 * Dark elevated cards matching premium theme
 */
const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  hover = false,
  onClick,
  ...props
}) => {
  const variants = {
    default: 'bg-[#141620] border border-[#1E2030]',
    elevated: 'bg-[#141620] border border-[#1E2030]',
    outline: 'bg-[#141620] border border-[#1E2030]',
    transparent: 'bg-transparent',
    dark: 'bg-[#0F1118] border border-[#1E2030]'
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  return (
    <motion.div
      onClick={onClick}
      className={`
        ${variants[variant]}
        ${paddings[padding]}
        rounded-2xl
        ${hover ? 'cursor-pointer transition-colors duration-200 hover:border-white/20' : ''}
        ${className}
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? {
        y: -2,
        transition: { duration: 0.2 }
      } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
