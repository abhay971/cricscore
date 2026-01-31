import { motion } from 'framer-motion';

/**
 * Professional Card Component
 * Clean white elevated cards matching reference design
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
    default: 'bg-bg-card shadow-card',
    elevated: 'bg-bg-card shadow-card-elevated',
    outline: 'bg-bg-card border border-[#4A4B5E]',
    transparent: 'bg-transparent',
    dark: 'bg-gray-800 text-text-onDark'
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
        rounded-card
        ${hover ? 'cursor-pointer transition-shadow duration-200 hover:shadow-card-hover' : ''}
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
