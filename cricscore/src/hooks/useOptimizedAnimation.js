import { useEffect, useRef, useCallback } from 'react';

/**
 * Optimized Animation Hooks
 * Performance-optimized animation utilities
 */

/**
 * Use RAF (RequestAnimationFrame) for smooth animations
 */
export const useRAF = (callback, deps = []) => {
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const animate = useCallback((time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, deps);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);
};

/**
 * Use Intersection Observer for visibility-based animations
 */
export const useIntersectionObserver = (callback, options = {}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting, entry);
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [callback, options]);

  return elementRef;
};

/**
 * Use throttled animation
 */
export const useThrottledAnimation = (callback, limit = 16) => {
  const inThrottle = useRef(false);
  const lastRan = useRef(Date.now());

  return useCallback(
    (...args) => {
      if (!inThrottle.current) {
        callback(...args);
        lastRan.current = Date.now();
        inThrottle.current = true;

        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [callback, limit]
  );
};

/**
 * Use GPU-accelerated animation
 * Automatically adds will-change and removes after animation
 */
export const useGPUAnimation = (elementRef, properties = ['transform', 'opacity']) => {
  const enableGPU = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.style.willChange = properties.join(', ');
    }
  }, [elementRef, properties]);

  const disableGPU = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.style.willChange = 'auto';
    }
  }, [elementRef]);

  return { enableGPU, disableGPU };
};

/**
 * Use reduced motion detection
 */
export const useReducedMotion = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return prefersReducedMotion;
};

/**
 * Use optimized scroll listener
 */
export const useOptimizedScroll = (callback, throttleMs = 100) => {
  const throttled = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!throttled.current) {
        callback();
        throttled.current = true;

        setTimeout(() => {
          throttled.current = false;
        }, throttleMs);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [callback, throttleMs]);
};

/**
 * Use lazy animation - only animate when element is visible
 */
export const useLazyAnimation = (animationCallback, options = {}) => {
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          animationCallback();
          hasAnimated.current = true;

          // Optionally disconnect after first animation
          if (options.once !== false) {
            observer.disconnect();
          }
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px'
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [animationCallback, options]);

  return elementRef;
};

/**
 * Use frame budget - ensure animations don't exceed 16ms budget
 */
export const useFrameBudget = () => {
  const checkBudget = useCallback((callback) => {
    const start = performance.now();
    callback();
    const end = performance.now();
    const duration = end - start;

    if (duration > 16.67) {
      console.warn(`⚠️ Frame budget exceeded: ${duration.toFixed(2)}ms (target: 16.67ms)`);
    }

    return duration;
  }, []);

  return checkBudget;
};

export default {
  useRAF,
  useIntersectionObserver,
  useThrottledAnimation,
  useGPUAnimation,
  useReducedMotion,
  useOptimizedScroll,
  useLazyAnimation,
  useFrameBudget
};
