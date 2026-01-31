import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Wicket Celebration Animation
 * Confetti explosion, screen shake, and bold text for wickets
 */
const WicketCelebration = ({ dismissalType = 'bowled', batsman, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  // Generate confetti particles
  const confettiCount = 50;
  const confetti = Array.from({ length: confettiCount }, (_, i) => ({
    id: i,
    x: Math.random() * window.innerWidth,
    y: -50,
    rotation: Math.random() * 360,
    color: ['#DC143C', '#FF6B6B', '#FFFFFF', '#FFD700'][Math.floor(Math.random() * 4)],
    delay: Math.random() * 0.5
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Screen shake effect */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: [0, -10, 10, -10, 10, 0],
          y: [0, -5, 5, -5, 5, 0]
        }}
        transition={{ duration: 0.5, repeat: 2 }}
      >
        {/* Confetti particles */}
        {confetti.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-3 h-3 rounded-sm"
            style={{
              left: particle.x,
              backgroundColor: particle.color
            }}
            initial={{
              y: particle.y,
              rotate: particle.rotation,
              opacity: 0
            }}
            animate={{
              y: [particle.y, window.innerHeight + 100],
              rotate: [particle.rotation, particle.rotation + 720],
              opacity: [0, 1, 1, 0],
              x: [0, Math.random() * 200 - 100]
            }}
            transition={{
              duration: 2.5,
              delay: particle.delay,
              ease: "easeIn"
            }}
          />
        ))}
      </motion.div>

      {/* Central celebration text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: [0, 1.2, 1], rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
        >
          {/* WICKET text */}
          <motion.h1
            className="text-8xl md:text-9xl font-display font-black text-accent-red mb-4"
            style={{ textShadow: '0 0 30px rgba(220, 20, 60, 0.8)' }}
            animate={{
              scale: [1, 1.1, 1],
              textShadow: [
                '0 0 30px rgba(220, 20, 60, 0.8)',
                '0 0 50px rgba(220, 20, 60, 1)',
                '0 0 30px rgba(220, 20, 60, 0.8)'
              ]
            }}
            transition={{
              duration: 1,
              repeat: 2,
              repeatType: "reverse"
            }}
          >
            WICKET!
          </motion.h1>

          {/* Dismissal details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl md:text-3xl font-display text-neutral-white"
          >
            <p className="capitalize">{batsman} - {dismissalType}</p>
          </motion.div>

          {/* Animated stumps flying */}
          {dismissalType === 'bowled' && (
            <motion.div
              className="mt-8 text-6xl"
              initial={{ y: 0, rotate: 0 }}
              animate={{
                y: [-50, -100],
                rotate: [0, 360],
                opacity: [1, 0]
              }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              🏏
            </motion.div>
          )}
        </motion.div>

        {/* Explosion rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full border-4 border-accent-red"
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [0, 3, 5],
              opacity: [1, 0.5, 0]
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.2,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default WicketCelebration;
