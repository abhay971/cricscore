/**
 * Mobile Optimizations Utilities
 * Performance and UX optimizations for mobile devices
 */

/**
 * Prevent default touch behaviors that interfere with app
 */
export const preventMobileScrollBounce = () => {
  document.body.style.overscrollBehavior = 'none';
};

/**
 * Enable smooth scrolling for mobile
 */
export const enableSmoothScroll = () => {
  document.documentElement.style.scrollBehavior = 'smooth';
};

/**
 * Disable zoom on input focus (iOS Safari)
 */
export const disableInputZoom = () => {
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
  }
};

/**
 * Set theme color for mobile browsers
 */
export const setThemeColor = (color) => {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = color;
};

/**
 * Hide address bar on mobile
 */
export const hideAddressBar = () => {
  window.scrollTo(0, 1);
};

/**
 * Detect if device is mobile
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Detect if device supports touch
 */
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get device pixel ratio for optimized graphics
 */
export const getDevicePixelRatio = () => {
  return window.devicePixelRatio || 1;
};

/**
 * Request fullscreen mode (for PWA)
 */
export const requestFullscreen = () => {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
};

/**
 * Exit fullscreen mode
 */
export const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
};

/**
 * Lock screen orientation (for mobile PWA)
 */
export const lockOrientation = (orientation = 'portrait') => {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock(orientation).catch((err) => {
      console.log('Orientation lock not supported:', err);
    });
  }
};

/**
 * Unlock screen orientation
 */
export const unlockOrientation = () => {
  if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock();
  }
};

/**
 * Initialize mobile optimizations
 */
export const initMobileOptimizations = () => {
  if (isMobile() || isTouchDevice()) {
    preventMobileScrollBounce();
    enableSmoothScroll();
    setThemeColor('#2D2E3F'); // Navy theme color

    // Hide address bar after page load
    window.addEventListener('load', () => {
      setTimeout(hideAddressBar, 0);
    });

    // Lock to portrait on mobile
    lockOrientation('portrait-primary');
  }
};

/**
 * Optimize animations for performance
 * Use will-change CSS property sparingly
 */
export const optimizeAnimations = (element, properties = ['transform', 'opacity']) => {
  if (element) {
    element.style.willChange = properties.join(', ');

    // Remove after animation completes
    setTimeout(() => {
      element.style.willChange = 'auto';
    }, 1000);
  }
};

/**
 * Debounce function for scroll/resize handlers
 */
export const debounce = (func, wait = 100) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for frequent events
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Preload critical images
 */
export const preloadImages = (imageUrls) => {
  imageUrls.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
};

/**
 * Check if app is in standalone mode (installed PWA)
 */
export const isStandalone = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
};

export default {
  preventMobileScrollBounce,
  enableSmoothScroll,
  disableInputZoom,
  setThemeColor,
  hideAddressBar,
  isMobile,
  isTouchDevice,
  getDevicePixelRatio,
  requestFullscreen,
  exitFullscreen,
  lockOrientation,
  unlockOrientation,
  initMobileOptimizations,
  optimizeAnimations,
  debounce,
  throttle,
  preloadImages,
  isStandalone
};
