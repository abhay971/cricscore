import { motion } from 'framer-motion';

/**
 * Loader Component
 * Clean loading animation
 */
const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const LoaderContent = () => (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={`${sizes[size]} border-2 border-white/20 border-t-white/60 rounded-full animate-spin`} />
      <span className="text-white/50 text-sm">Loading...</span>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#0B0D14] flex items-center justify-center z-50">
        <LoaderContent />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <LoaderContent />
    </div>
  );
};

export default Loader;
