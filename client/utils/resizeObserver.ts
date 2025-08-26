/**
 * Utility to handle ResizeObserver errors
 * This prevents the "ResizeObserver loop completed with undelivered notifications" error
 * which is common with Radix UI components and doesn't actually break functionality
 */

// Store the original ResizeObserver
const OriginalResizeObserver = window.ResizeObserver;

// Enhanced ResizeObserver with error handling
class EnhancedResizeObserver extends OriginalResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    // Wrap the callback with error handling
    const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
      try {
        callback(entries, observer);
      } catch (error) {
        // Suppress ResizeObserver loop errors
        if (error instanceof Error && error.message.includes('ResizeObserver loop completed')) {
          console.warn('ResizeObserver loop detected and handled gracefully');
          return;
        }
        // Re-throw other errors
        throw error;
      }
    };

    super(wrappedCallback);
  }
}

// Global error handler for ResizeObserver errors
const originalErrorHandler = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  // Suppress ResizeObserver loop errors
  if (typeof message === 'string' && message.includes('ResizeObserver loop completed')) {
    console.warn('ResizeObserver loop error suppressed:', message);
    return true; // Prevent default error handling
  }
  
  // Call original error handler for other errors
  if (originalErrorHandler) {
    return originalErrorHandler(message, source, lineno, colno, error);
  }
  return false;
};

// Handle unhandled promise rejections related to ResizeObserver
const originalUnhandledRejection = window.onunhandledrejection;
window.onunhandledrejection = (event) => {
  if (event.reason && typeof event.reason === 'string' && 
      event.reason.includes('ResizeObserver loop completed')) {
    console.warn('ResizeObserver promise rejection suppressed:', event.reason);
    event.preventDefault();
    return;
  }
  
  // Call original handler for other rejections
  if (originalUnhandledRejection) {
    originalUnhandledRejection(event);
  }
};

// Replace the global ResizeObserver
window.ResizeObserver = EnhancedResizeObserver;

// Debounced ResizeObserver for high-frequency updates
export class DebouncedResizeObserver {
  private observer: ResizeObserver;
  private timeouts = new Map<Element, NodeJS.Timeout>();
  private delay: number;

  constructor(callback: ResizeObserverCallback, delay = 16) {
    this.delay = delay;
    
    this.observer = new EnhancedResizeObserver((entries, observer) => {
      entries.forEach((entry) => {
        // Clear existing timeout for this element
        const existingTimeout = this.timeouts.get(entry.target);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Set new debounced timeout
        const timeout = setTimeout(() => {
          callback([entry], observer);
          this.timeouts.delete(entry.target);
        }, this.delay);

        this.timeouts.set(entry.target, timeout);
      });
    });
  }

  observe(target: Element, options?: ResizeObserverOptions) {
    this.observer.observe(target, options);
  }

  unobserve(target: Element) {
    // Clear any pending timeout
    const timeout = this.timeouts.get(target);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(target);
    }
    
    this.observer.unobserve(target);
  }

  disconnect() {
    // Clear all timeouts
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
    
    this.observer.disconnect();
  }
}

export default EnhancedResizeObserver;
