/**
 * Performance Monitoring Utilities
 * Track and optimize app performance
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.observers = [];
  }

  /**
   * Measure component render time
   */
  measureRender(componentName, callback) {
    const start = performance.now();
    const result = callback();
    const end = performance.now();
    const duration = end - start;

    this.logMetric('render', componentName, duration);

    if (duration > 16.67) {
      // Slower than 60fps
      console.warn(`⚠️ Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
    }

    return result;
  }

  /**
   * Measure API call duration
   */
  async measureAPI(apiName, apiCall) {
    const start = performance.now();
    try {
      const result = await apiCall();
      const end = performance.now();
      const duration = end - start;

      this.logMetric('api', apiName, duration);

      if (duration > 1000) {
        console.warn(`⚠️ Slow API: ${apiName} took ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const end = performance.now();
      this.logMetric('api', apiName, end - start, error);
      throw error;
    }
  }

  /**
   * Measure animation frame rate
   */
  measureFPS(duration = 1000) {
    return new Promise((resolve) => {
      let frames = 0;
      let lastTime = performance.now();
      const startTime = lastTime;

      const countFrame = () => {
        frames++;
        const currentTime = performance.now();

        if (currentTime - startTime < duration) {
          requestAnimationFrame(countFrame);
        } else {
          const fps = Math.round((frames / duration) * 1000);
          this.logMetric('fps', 'animation', fps);

          if (fps < 55) {
            console.warn(`⚠️ Low FPS: ${fps} (target: 60)`);
          }

          resolve(fps);
        }
      };

      requestAnimationFrame(countFrame);
    });
  }

  /**
   * Monitor memory usage
   */
  getMemoryUsage() {
    if (performance.memory) {
      const usage = {
        usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
        totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2),
        jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)
      };

      this.logMetric('memory', 'heap', usage);
      return usage;
    }
    return null;
  }

  /**
   * Observe long tasks (> 50ms)
   */
  observeLongTasks() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
              this.logMetric('longtask', entry.name, entry.duration);
            }
          }
        });

        observer.observe({ entryTypes: ['longtask'] });
        this.observers.push(observer);
      } catch (e) {
        console.log('Long task observer not supported');
      }
    }
  }

  /**
   * Observe layout shifts
   */
  observeLayoutShifts() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.hadRecentInput) continue;

            console.warn(`⚠️ Layout shift: ${entry.value.toFixed(4)}`);
            this.logMetric('cls', 'layout-shift', entry.value);
          }
        });

        observer.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(observer);
      } catch (e) {
        console.log('Layout shift observer not supported');
      }
    }
  }

  /**
   * Get Web Vitals
   */
  getWebVitals() {
    const vitals = {};

    // First Contentful Paint
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcp) {
      vitals.fcp = fcp.startTime.toFixed(2);
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(observer);
      } catch (e) {
        console.log('LCP observer not supported');
      }
    }

    // First Input Delay
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            vitals.fid = entry.processingStart - entry.startTime;
          }
        });

        observer.observe({ entryTypes: ['first-input'] });
        this.observers.push(observer);
      } catch (e) {
        console.log('FID observer not supported');
      }
    }

    return vitals;
  }

  /**
   * Log metric
   */
  logMetric(type, name, value, error = null) {
    const metric = {
      type,
      name,
      value,
      timestamp: Date.now(),
      error
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * Disconnect all observers
   */
  disconnect() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }

  /**
   * Initialize all monitoring
   */
  init() {
    this.observeLongTasks();
    this.observeLayoutShifts();
    this.getWebVitals();

    // Log memory usage every 30 seconds
    setInterval(() => {
      this.getMemoryUsage();
    }, 30000);

    console.log('✅ Performance monitoring initialized');
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;

// Export individual functions for convenience
export const measureRender = (name, callback) => performanceMonitor.measureRender(name, callback);
export const measureAPI = (name, apiCall) => performanceMonitor.measureAPI(name, apiCall);
export const measureFPS = (duration) => performanceMonitor.measureFPS(duration);
export const getMemoryUsage = () => performanceMonitor.getMemoryUsage();
export const getMetrics = () => performanceMonitor.getMetrics();
export const initPerformanceMonitoring = () => performanceMonitor.init();
