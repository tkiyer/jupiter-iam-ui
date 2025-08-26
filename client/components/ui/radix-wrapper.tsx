import React, { useEffect } from 'react';

/**
 * Wrapper component to handle Radix UI ResizeObserver issues
 * This component suppresses ResizeObserver errors that commonly occur
 * with Dialog, Popover, Tooltip, and other portal-based components
 */
interface RadixWrapperProps {
  children: React.ReactNode;
  suppressResizeObserverErrors?: boolean;
}

export const RadixWrapper: React.FC<RadixWrapperProps> = ({ 
  children, 
  suppressResizeObserverErrors = true 
}) => {
  useEffect(() => {
    if (!suppressResizeObserverErrors) return;

    // Create a more specific error handler for this component scope
    const handleError = (event: ErrorEvent) => {
      if (event.error && 
          typeof event.error === 'object' && 
          event.error.message && 
          event.error.message.includes('ResizeObserver loop completed')) {
        
        console.warn('RadixWrapper: ResizeObserver loop error suppressed');
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
      return false;
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && 
          typeof event.reason === 'string' && 
          event.reason.includes('ResizeObserver loop completed')) {
        
        console.warn('RadixWrapper: ResizeObserver promise rejection suppressed');
        event.preventDefault();
        return;
      }
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [suppressResizeObserverErrors]);

  return <>{children}</>;
};

/**
 * Higher-order component to wrap Radix components with error handling
 */
export function withRadixWrapper<P extends object>(
  Component: React.ComponentType<P>,
  options: { suppressResizeObserverErrors?: boolean } = {}
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <RadixWrapper suppressResizeObserverErrors={options.suppressResizeObserverErrors}>
      <Component {...props} ref={ref} />
    </RadixWrapper>
  ));

  WrappedComponent.displayName = `withRadixWrapper(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default RadixWrapper;
