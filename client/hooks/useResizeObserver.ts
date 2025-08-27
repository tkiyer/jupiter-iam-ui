import { useEffect, useRef, useCallback } from "react";

export interface UseResizeObserverOptions {
  /**
   * Whether to observe immediately when the element is available
   * @default true
   */
  observeImmediately?: boolean;
}

/**
 * Custom hook for using ResizeObserver with enhanced error handling
 * Specifically designed to work well with Radix UI components
 */
export function useResizeObserver<T extends HTMLElement = HTMLElement>(
  callback: ResizeObserverCallback,
  options: UseResizeObserverOptions = {},
) {
  const { observeImmediately = true } = options;

  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const observe = useCallback((element: T | null) => {
    if (!element) return;

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    try {
      // Create new observer
      observerRef.current = new ResizeObserver((entries, observer) => {
        try {
          callbackRef.current(entries, observer);
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("ResizeObserver loop completed")
          ) {
            console.warn(
              "ResizeObserver loop handled gracefully in useResizeObserver",
            );
            return;
          }
          console.error("Error in ResizeObserver callback:", error);
        }
      });

      // Start observing
      observerRef.current.observe(element);
    } catch (error) {
      console.warn("Failed to create ResizeObserver:", error);
    }
  }, []);

  const unobserve = useCallback(() => {
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  // Ref callback for setting the element
  const setRef = useCallback(
    (element: T | null) => {
      elementRef.current = element;

      if (observeImmediately && element) {
        observe(element);
      }
    },
    [observe, observeImmediately],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ref: setRef,
    observe,
    unobserve,
    disconnect,
    element: elementRef.current,
  };
}

/**
 * Simplified hook for basic resize observation
 */
export function useElementSize<T extends HTMLElement = HTMLElement>(
  onResize?: (size: { width: number; height: number }) => void,
) {
  const callback = useCallback<ResizeObserverCallback>(
    (entries) => {
      if (entries.length > 0 && onResize) {
        const entry = entries[0];
        const { width, height } = entry.contentRect;
        onResize({ width, height });
      }
    },
    [onResize],
  );

  return useResizeObserver<T>(callback);
}

export default useResizeObserver;
