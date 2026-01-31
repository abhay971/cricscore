/**
 * Memory Optimization Utilities
 * Prevent memory leaks and optimize memory usage
 */

/**
 * Cleanup utility for event listeners
 */
export class EventCleanup {
  constructor() {
    this.listeners = [];
  }

  add(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    this.listeners.push({ element, event, handler, options });
  }

  cleanup() {
    this.listeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this.listeners = [];
  }
}

/**
 * Cleanup utility for intervals and timeouts
 */
export class TimerCleanup {
  constructor() {
    this.timers = [];
  }

  addInterval(callback, delay) {
    const id = setInterval(callback, delay);
    this.timers.push({ type: 'interval', id });
    return id;
  }

  addTimeout(callback, delay) {
    const id = setTimeout(callback, delay);
    this.timers.push({ type: 'timeout', id });
    return id;
  }

  cleanup() {
    this.timers.forEach(({ type, id }) => {
      if (type === 'interval') {
        clearInterval(id);
      } else {
        clearTimeout(id);
      }
    });
    this.timers = [];
  }
}

/**
 * Object pool for reusing objects instead of creating new ones
 */
export class ObjectPool {
  constructor(factory, resetFn = null, initialSize = 10) {
    this.factory = factory;
    this.resetFn = resetFn;
    this.pool = [];

    // Pre-create objects
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.factory();
  }

  release(obj) {
    if (this.resetFn) {
      this.resetFn(obj);
    }
    this.pool.push(obj);
  }

  clear() {
    this.pool = [];
  }

  get size() {
    return this.pool.length;
  }
}

/**
 * WeakMap cache for component data
 */
export class WeakCache {
  constructor() {
    this.cache = new WeakMap();
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    return this.cache.delete(key);
  }
}

/**
 * LRU Cache for limiting memory usage
 */
export class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;

    const value = this.cache.get(key);
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    // Delete if exists (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add to end
    this.cache.set(key, value);

    // Remove oldest if over max size
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

/**
 * Image preloader with memory management
 */
export class ImagePreloader {
  constructor(maxCached = 50) {
    this.cache = new LRUCache(maxCached);
    this.loading = new Map();
  }

  preload(url) {
    // Return cached image if exists
    if (this.cache.has(url)) {
      return Promise.resolve(this.cache.get(url));
    }

    // Return existing loading promise if in progress
    if (this.loading.has(url)) {
      return this.loading.get(url);
    }

    // Load new image
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(url, img);
        this.loading.delete(url);
        resolve(img);
      };
      img.onerror = () => {
        this.loading.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });

    this.loading.set(url, promise);
    return promise;
  }

  clear() {
    this.cache.clear();
    this.loading.clear();
  }
}

/**
 * Detect memory leaks by tracking object creation
 */
export class MemoryLeakDetector {
  constructor() {
    this.objects = new Map();
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  track(name, obj) {
    if (!this.enabled) return;

    if (!this.objects.has(name)) {
      this.objects.set(name, []);
    }

    this.objects.get(name).push({
      obj,
      timestamp: Date.now(),
      stack: new Error().stack
    });
  }

  getReport() {
    const report = {};

    this.objects.forEach((items, name) => {
      report[name] = {
        count: items.length,
        oldest: new Date(items[0]?.timestamp).toISOString(),
        newest: new Date(items[items.length - 1]?.timestamp).toISOString()
      };
    });

    return report;
  }

  clear() {
    this.objects.clear();
  }
}

/**
 * Global instances
 */
export const imagePreloader = new ImagePreloader();
export const memoryLeakDetector = new MemoryLeakDetector();

/**
 * Utility to force garbage collection (dev only)
 */
export const forceGC = () => {
  if (window.gc) {
    window.gc();
    console.log('✅ Garbage collection forced');
  } else {
    console.warn('⚠️ Garbage collection not available. Run Chrome with --expose-gc flag.');
  }
};

/**
 * Check for memory leaks in development
 */
export const checkMemoryLeaks = () => {
  if (import.meta.env.DEV) {
    const report = memoryLeakDetector.getReport();
    console.log('📊 Memory Leak Report:', report);

    // Warn if any object type has more than 100 instances
    Object.entries(report).forEach(([name, data]) => {
      if (data.count > 100) {
        console.warn(`⚠️ Potential memory leak: ${name} has ${data.count} instances`);
      }
    });
  }
};

export default {
  EventCleanup,
  TimerCleanup,
  ObjectPool,
  WeakCache,
  LRUCache,
  ImagePreloader,
  MemoryLeakDetector,
  imagePreloader,
  memoryLeakDetector,
  forceGC,
  checkMemoryLeaks
};
