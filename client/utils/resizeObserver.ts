/**
 * Enhanced ResizeObserver error handling utility
 * Prevents "ResizeObserver loop completed with undelivered notifications" error
 */

// Store original handlers
const originalErrorHandler = window.onerror;
const originalUnhandledRejection = window.onunhandledrejection;

// Enhanced error detection patterns
const RESIZE_OBSERVER_PATTERNS = [
  "ResizeObserver loop completed",
  "ResizeObserver loop limit exceeded",
  "Script error.",
];

const isResizeObserverError = (message: string | Event | Error) => {
  const messageStr =
    typeof message === "string"
      ? message
      : message instanceof Error
        ? message.message
        : String(message);

  return RESIZE_OBSERVER_PATTERNS.some((pattern) =>
    messageStr.includes(pattern),
  );
};

// Enhanced global error handler
window.onerror = (message, source, lineno, colno, error) => {
  // Suppress ResizeObserver loop errors
  if (isResizeObserverError(message)) {
    if (process.env.NODE_ENV === "development") {
      console.warn("ResizeObserver error suppressed:", message);
    }
    return true; // Prevent default error handling
  }

  // Call original error handler for other errors
  if (originalErrorHandler) {
    return originalErrorHandler(message, source, lineno, colno, error);
  }
  return false;
};

// Enhanced unhandled promise rejection handler
window.onunhandledrejection = (event) => {
  const reason = event.reason;

  if (reason && isResizeObserverError(reason)) {
    if (process.env.NODE_ENV === "development") {
      console.warn("ResizeObserver promise rejection suppressed:", reason);
    }
    event.preventDefault();
    return;
  }

  // Call original handler for other rejections
  if (originalUnhandledRejection) {
    originalUnhandledRejection(event);
  }
};

// Additional console error suppression for ResizeObserver
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(" ");
  if (isResizeObserverError(message)) {
    if (process.env.NODE_ENV === "development") {
      console.warn("ResizeObserver console error suppressed:", message);
    }
    return;
  }
  originalConsoleError.apply(console, args);
};
