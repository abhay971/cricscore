import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Boundary Animation (4s and 6s)
 * Explosive celebration for boundaries with particle effects
 */
const BoundaryAnimation = ({ runs = 4, batsman, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  const isSix = runs === 6;

  // Particle burst effect
  const particleCount = isSix ? 40 : 25;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * Math.PI * 2;
    const distance = isSix ? 400 : 300;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      delay: Math.random() * 0.2,
      color: isSix ? '#FFD700' : '#FF6B6B'
    };
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden bg-black/30 backdrop-blur-sm">
      {/* Particle burst from center */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-4 h-4 rounded-full"
            style={{ backgroundColor: particle.color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: particle.x,
              y: particle.y,
              opacity: [1, 1, 0],
              scale: [1, 1.5, 0]
            }}
            transition={{
              duration: 1.5,
              delay: particle.delay,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Main boundary text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 10
          }}
        >
          {/* Runs display */}
          <motion.div
            className={`text-9xl md:text-[12rem] font-bold ${
              isSix ? 'text-yellow-400' : 'text-red-400'
            } mb-4`}
            style={{
              textShadow: isSix
                ? '0 0 40px rgba(255, 215, 0, 0.8), 0 0 80px rgba(255, 215, 0, 0.5)'
                : '0 0 40px rgba(255, 107, 107, 0.8)'
            }}
            animate={{
              scale: [1, 1.15, 1],
              rotate: isSix ? [0, 5, -5, 0] : [0, 2, -2, 0]
            }}
            transition={{
              duration: 0.8,
              repeat: 2,
              repeatType: "reverse"
            }}
          >
            {runs}
          </motion.div>

          {/* Boundary label */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-5xl font-bold text-white"
          >
            {isSix ? 'MAXIMUM!' : 'FOUR!'}
          </motion.div>

          {/* Batsman name */}
          {batsman && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-white/60 mt-4"
            >
              {batsman}
            </motion.p>
          )}
        </motion.div>

        {/* Circular ripple effect */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`absolute w-40 h-40 rounded-full border-4 ${
              isSix ? 'border-yellow-400' : 'border-red-400'
            }`}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [0, 4, 6],
              opacity: [1, 0.5, 0]
            }}
            transition={{
              duration: 2,
              delay: i * 0.15,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Stars for six */}
      {isSix && (
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                rotate: [0, 180]
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 0.5,
                ease: "easeOut"
              }}
            >
              <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoundaryAnimation;
