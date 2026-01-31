import { motion, AnimatePresence } from 'framer-motion';

/**
 * Score Update Transition
 * Smooth animated transitions for score changes
 */
const ScoreUpdateTransition = ({ value, className = '', prefix = '', suffix = '' }) => {
  return (
    <div className="relative inline-block">
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ y: -20, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          className={className}
        >
          {prefix}{value}{suffix}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/**
 * Stagger Container for multiple score elements
 */
export const ScoreStagger = ({ children, className = '' }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Flash effect for score changes
 */
export const ScoreFlash = ({ trigger, children, className = '' }) => {
  return (
    <motion.div
      className={className}
      animate={trigger ? {
        backgroundColor: ['rgba(220, 20, 60, 0)', 'rgba(220, 20, 60, 0.3)', 'rgba(220, 20, 60, 0)'],
        scale: [1, 1.05, 1]
      } : {}}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Pulse effect for active elements
 */
export const ScorePulse = ({ active = false, children, className = '' }) => {
  return (
    <motion.div
      className={className}
      animate={active ? {
        scale: [1, 1.02, 1],
        boxShadow: [
          '0 0 0 0 rgba(220, 20, 60, 0)',
          '0 0 0 10px rgba(220, 20, 60, 0.3)',
          '0 0 0 0 rgba(220, 20, 60, 0)'
        ]
      } : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Slide in animation for new elements
 */
export const ScoreSlideIn = ({ direction = 'up', children, className = '', delay = 0 }) => {
  const directions = {
    up: { initial: { y: 50 }, animate: { y: 0 } },
    down: { initial: { y: -50 }, animate: { y: 0 } },
    left: { initial: { x: 50 }, animate: { x: 0 } },
    right: { initial: { x: -50 }, animate: { x: 0 } }
  };

  const { initial, animate } = directions[direction];

  return (
    <motion.div
      initial={{ ...initial, opacity: 0 }}
      animate={{ ...animate, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScoreUpdateTransition;
