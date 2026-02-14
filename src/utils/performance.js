/**
 * Performance Utilities
 * Optimized for React 19 + Vite
 */

// Debounce function (limits rate of execution)
export const debounce = (func, wait) => {
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

// Throttle function (ensures execution at most once per period)
export const throttle = (func, limit) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

// RAF Scheduler (for smooth visual updates)
export const scheduleUpdate = (callback) => {
    requestAnimationFrame(() => {
        callback();
    });
};

// Measure execution time
export const measure = (label, fn) => {
    console.time(label);
    const result = fn();
    console.timeEnd(label);
    return result;
};

// Async Lazy Loader helper
export const lazyLoad = (importFunc, minDuration = 300) => {
    return Promise.all([
        importFunc(),
        new Promise(resolve => setTimeout(resolve, minDuration))
    ]).then(([moduleExports]) => moduleExports);
};
