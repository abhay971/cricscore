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
      className="fixed inset-0 bg-[#0B0D14] flex flex-col items-center justify-center z-50"
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
        <div className="w-32 h-32 mx-auto mb-6 bg-[#141620] border border-[#1E2030] rounded-full flex items-center justify-center">
          <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path d="M2 12h4M18 12h4M12 2v4M12 18v4" stroke="currentColor" strokeWidth="2" /></svg>
        </div>
        <h1 className="text-4xl font-bold text-white">
          CricScore
        </h1>
        <p className="text-white/40 mt-2">
          Live Cricket Scoring
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-64 h-2 bg-[#1E2030] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white/60"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Loading percentage */}
      <motion.p
        className="text-white/40 mt-4 font-mono"
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
