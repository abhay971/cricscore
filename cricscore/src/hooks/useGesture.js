import { useEffect, useRef } from 'react';

/**
 * Mobile Gesture Hook
 * Detects swipe, long-press, and touch gestures
 */

export const useSwipe = (onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50) => {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;

    // Horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }
    }
    // Vertical swipe
    else {
      if (Math.abs(diffY) > threshold) {
        if (diffY > 0) {
          onSwipeUp?.();
        } else {
          onSwipeDown?.();
        }
      }
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

export const useLongPress = (onLongPress, duration = 500) => {
  const timerRef = useRef(null);
  const isLongPress = useRef(false);

  const handleStart = () => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress?.();
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, duration);
  };

  const handleEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleClick = (callback) => {
    return (e) => {
      if (!isLongPress.current && callback) {
        callback(e);
      }
    };
  };

  return {
    onMouseDown: handleStart,
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
    onTouchStart: handleStart,
    onTouchEnd: handleEnd,
    onClick: handleClick
  };
};

export const useHapticFeedback = () => {
  const light = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const medium = () => {
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const heavy = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const success = () => {
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
  };

  const error = () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 100, 50]);
    }
  };

  return { light, medium, heavy, success, error };
};

export const usePullToRefresh = (onRefresh, threshold = 80) => {
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  const isPulling = useRef(false);
  const isRefreshing = useRef(false);

  const handleTouchStart = (e) => {
    // Only trigger at top of page
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling.current || isRefreshing.current) return;

    touchCurrentY.current = e.touches[0].clientY;
    const pullDistance = touchCurrentY.current - touchStartY.current;

    if (pullDistance > 0 && window.scrollY === 0) {
      // Show pull indicator
      if (pullDistance > threshold) {
        // Visual feedback - ready to refresh
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current || isRefreshing.current) {
      isPulling.current = false;
      return;
    }

    const pullDistance = touchCurrentY.current - touchStartY.current;

    if (pullDistance > threshold && window.scrollY === 0) {
      isRefreshing.current = true;
      // Trigger refresh
      await onRefresh?.();
      isRefreshing.current = false;
    }

    isPulling.current = false;
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};
