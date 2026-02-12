import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Milestone Animation (50s, 100s)
 * Grand celebration for batting milestones
 */
const MilestoneAnimation = ({ milestone = 50, batsman, balls, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  const isCentury = milestone >= 100;

  // Firework particles
  const fireworkCount = isCentury ? 60 : 40;
  const fireworks = Array.from({ length: fireworkCount }, (_, i) => {
    const angle = (i / fireworkCount) * Math.PI * 2;
    const distance = Math.random() * 300 + 200;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      delay: Math.random() * 0.5,
      size: Math.random() * 8 + 4
    };
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden bg-gradient-to-b from-black/50 via-red-500/20 to-black/50">
      {/* Firework explosions */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {fireworks.map((fw) => (
          <motion.div
            key={fw.id}
            className="absolute rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-red-400"
            style={{
              width: fw.size,
              height: fw.size
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: fw.x,
              y: fw.y,
              opacity: [0, 1, 1, 0],
              scale: [0, 2, 1, 0]
            }}
            transition={{
              duration: 2,
              delay: fw.delay,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Main milestone display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Trophy/Medal icon */}
        <motion.div
          className="text-9xl mb-6"
          initial={{ scale: 0, rotate: -180, y: -100 }}
          animate={{
            scale: [0, 1.3, 1],
            rotate: 0,
            y: 0
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2
          }}
        >
          {isCentury ? (
            <svg className="w-24 h-24 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721M16.27 9.728a7.454 7.454 0 01-3.522 2.503m3.522-2.503a6.003 6.003 0 00-2.48-5.228m-3.522 7.731a7.454 7.454 0 003.522-2.503" />
            </svg>
          ) : (
            <svg className="w-24 h-24 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          )}
        </motion.div>

        {/* Milestone number */}
        <motion.div
          className="relative"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 12,
            delay: 0.4
          }}
        >
          <motion.h1
            className={`text-[10rem] md:text-[14rem] font-bold ${
              isCentury ? 'text-yellow-400' : 'text-red-500'
            }`}
            style={{
              textShadow: isCentury
                ? '0 0 50px rgba(255, 215, 0, 1), 0 0 100px rgba(255, 215, 0, 0.5)'
                : '0 0 50px rgba(220, 20, 60, 1)'
            }}
            animate={{
              scale: [1, 1.05, 1],
              textShadow: isCentury
                ? [
                    '0 0 50px rgba(255, 215, 0, 1)',
                    '0 0 80px rgba(255, 215, 0, 1)',
                    '0 0 50px rgba(255, 215, 0, 1)'
                  ]
                : [
                    '0 0 50px rgba(220, 20, 60, 1)',
                    '0 0 80px rgba(220, 20, 60, 1)',
                    '0 0 50px rgba(220, 20, 60, 1)'
                  ]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {milestone}
          </motion.h1>

          {/* Glow effect behind number */}
          <motion.div
            className={`absolute inset-0 rounded-full blur-3xl ${
              isCentury ? 'bg-yellow-400' : 'bg-red-500'
            }`}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </motion.div>

        {/* Celebration text */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {isCentury ? 'CENTURY!' : 'HALF-CENTURY!'}
          </h2>

          {batsman && (
            <p className="text-3xl md:text-4xl text-red-400 mb-2">
              {batsman}
            </p>
          )}

          {balls && (
            <p className="text-xl md:text-2xl text-white/60">
              off {balls} balls
            </p>
          )}
        </motion.div>

        {/* Confetti rain */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: -50,
                backgroundColor: ['#FFD700', '#DC143C', '#FF6B6B', '#FFFFFF'][
                  Math.floor(Math.random() * 4)
                ]
              }}
              initial={{ y: -50, rotate: 0, opacity: 0 }}
              animate={{
                y: window.innerHeight + 50,
                rotate: Math.random() * 720,
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 1,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Expanding rings */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={`absolute w-60 h-60 rounded-full border-4 ${
              isCentury ? 'border-yellow-400' : 'border-red-500'
            }`}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [0, 5, 7],
              opacity: [1, 0.3, 0]
            }}
            transition={{
              duration: 3,
              delay: i * 0.2,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MilestoneAnimation;
