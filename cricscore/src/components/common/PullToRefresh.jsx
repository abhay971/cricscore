import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePullToRefresh } from '../../hooks/useGesture';

/**
 * Pull to Refresh Component
 * Mobile-style pull-to-refresh for live matches and viewer page
 */
const PullToRefresh = ({ onRefresh, children, threshold = 80 }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (isRefreshing || window.scrollY !== 0) return;

    const touchY = e.touches[0].clientY;
    const distance = Math.max(0, touchY - touchStartY.current);

    // Cap at 150px
    setPullDistance(Math.min(distance, 150));
  };

  const handleTouchEnd = async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold); // Lock at threshold during refresh

      try {
        await onRefresh?.();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const progress = Math.min((pullDistance / threshold) * 100, 100);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ height: pullDistance > 0 ? pullDistance : threshold }}
            className="absolute top-0 left-0 right-0 flex items-center justify-center overflow-hidden"
          >
            <div className="text-center">
              {isRefreshing ? (
                <>
                  <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-brand-blue font-semibold">Refreshing...</p>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ rotate: progress >= 100 ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-2"
                  >
                    <svg
                      className="w-8 h-8 text-brand-blue mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </motion.div>
                  <p className="text-sm text-brand-blue font-semibold">
                    {progress >= 100 ? 'Release to refresh' : 'Pull to refresh'}
                  </p>
                  {/* Progress indicator */}
                  <div className="w-24 h-1 bg-[#4A4B5E] rounded-full mx-auto mt-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-blue rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        animate={{
          marginTop: pullDistance > 0 || isRefreshing ? (isRefreshing ? threshold : pullDistance) : 0
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;
