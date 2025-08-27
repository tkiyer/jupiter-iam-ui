/**
 * Simple utility to handle ResizeObserver errors
 * Prevents "ResizeObserver loop completed with undelivered notifications" error
 */

// Global error handler for ResizeObserver errors
const originalErrorHandler = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  // Suppress ResizeObserver loop errors
  if (typeof message === 'string' && message.includes('ResizeObserver loop completed')) {
    console.warn('ResizeObserver loop error suppressed');
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
    console.warn('ResizeObserver promise rejection suppressed');
    event.preventDefault();
    return;
  }
  
  // Call original handler for other rejections
  if (originalUnhandledRejection) {
    originalUnhandledRejection(event);
  }
};
