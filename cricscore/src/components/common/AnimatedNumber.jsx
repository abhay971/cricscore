import { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

/**
 * Animated Number Component with Count-Up Animation
 * Smoothly animates number changes using spring physics
 */
const AnimatedNumber = ({
  value,
  duration = 0.5,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0
}) => {
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    mass: 0.5
  });

  const display = useTransform(spring, (current) => {
    return `${prefix}${current.toFixed(decimals)}${suffix}`;
  });

  const prevValue = useRef(0);

  useEffect(() => {
    // Animate from previous value to new value
    spring.set(value);
    prevValue.current = value;
  }, [value, spring]);

  return (
    <motion.span
      className={`font-mono tabular-nums ${className}`}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.3 }}
      key={value} // Force re-animation on value change
    >
      {display.get().includes('NaN') ? `${prefix}${value.toFixed(decimals)}${suffix}` : display}
    </motion.span>
  );
};

export default AnimatedNumber;
