import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * PWA Splash Screen Component
 * Shows on app launch
 */
const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 300);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-primary-black flex flex-col items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo/Brand */}
      <motion.div
        className="text-center mb-12"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2
        }}
      >
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-red-black rounded-full flex items-center justify-center shadow-glow-red-strong">
          <span className="text-6xl">🏏</span>
        </div>
        <h1 className="text-4xl font-display font-bold gradient-text">
          CricScore
        </h1>
        <p className="text-neutral-mediumGray mt-2">
          Live Cricket Scoring
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-64 h-2 bg-primary-mediumGray rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-red-black"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Loading percentage */}
      <motion.p
        className="text-accent-lightRed mt-4 font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {progress}%
      </motion.p>
    </motion.div>
  );
};

export default SplashScreen;
