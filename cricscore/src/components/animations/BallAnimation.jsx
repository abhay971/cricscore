import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Ball Trajectory Animation
 * Animates cricket ball moving across screen for scoring moments
 */
const BallAnimation = ({ runs = 0, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  // Different trajectories based on runs
  const trajectories = {
    0: { x: [0, 50, 0], y: [0, -30, 0], rotate: [0, 180, 360] },
    1: { x: [0, 100, 200], y: [0, -50, -20], rotate: [0, 360, 720] },
    2: { x: [0, 150, 300], y: [0, -70, -30], rotate: [0, 540, 1080] },
    3: { x: [0, 200, 400], y: [0, -90, -40], rotate: [0, 720, 1440] },
    4: { x: [0, 250, 500], y: [0, -120, -60], rotate: [0, 900, 1800] },
    6: { x: [0, 200, 400, 600], y: [0, -150, -200, -100], rotate: [0, 1080, 2160, 3240] }
  };

  const trajectory = trajectories[runs] || trajectories[0];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <motion.div
        className="absolute left-10 top-1/2"
        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
        animate={{
          x: trajectory.x,
          y: trajectory.y,
          rotate: trajectory.rotate,
          opacity: [0, 1, 1, 0],
          scale: [0, 1, 1, 0.5]
        }}
        transition={{
          duration: 2,
          ease: "easeOut",
          times: runs === 6 ? [0, 0.3, 0.7, 1] : [0, 0.5, 1]
        }}
      >
        {/* Cricket ball */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-red-500" style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)' }} />
          {/* Ball seam */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-0.5 bg-white rounded-full opacity-50" />
          </div>
        </div>

        {/* Trail effect */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-12 h-12 rounded-full bg-red-400 blur-md" />
        </motion.div>
      </motion.div>

      {/* Run number display */}
      <motion.div
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <div className="text-8xl font-bold text-white">
          {runs}
        </div>
      </motion.div>
    </div>
  );
};

export default BallAnimation;
