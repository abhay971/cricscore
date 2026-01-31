import { motion } from 'framer-motion';

/**
 * Branded Loader Component
 * Cricket-themed loading animation
 */
const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0 },
    show: { opacity: 1, scale: 1 }
  };

  const LoaderContent = () => (
    <motion.div
      className="flex flex-col items-center gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Cricket ball animation */}
      <div className="relative">
        <motion.div
          className={`${sizes[size]} rounded-full bg-accent-red`}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={`absolute inset-0 ${sizes[size]} rounded-full border-4 border-accent-lightRed`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Loading text */}
      <motion.div
        className="flex gap-1"
        variants={container}
      >
        {['L', 'o', 'a', 'd', 'i', 'n', 'g'].map((letter, index) => (
          <motion.span
            key={index}
            className="text-neutral-white font-display"
            variants={item}
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.1,
              ease: "easeInOut"
            }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-primary-black flex items-center justify-center z-50">
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
