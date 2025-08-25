/**
 * Accessibility validation utilities for Dialog components
 * This helps ensure all dialogs meet accessibility requirements
 */

export const validateDialogAccessibility = () => {
  if (typeof window === 'undefined') return;

  // Check for dialogs without proper titles
  const dialogContents = document.querySelectorAll('[data-radix-dialog-content]');
  
  dialogContents.forEach((content, index) => {
    const hasTitle = content.querySelector('[data-radix-dialog-title]');
    
    if (!hasTitle) {
      console.warn(
        `Dialog accessibility warning: Dialog at index ${index} is missing a DialogTitle. ` +
        'Add a DialogTitle or wrap it with VisuallyHidden component for screen reader accessibility.'
      );
    }
  });
};

// Run validation in development mode
if (process.env.NODE_ENV === 'development') {
  // Run validation after DOM mutations
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.matches('[data-radix-dialog-content]') || 
                element.querySelector('[data-radix-dialog-content]')) {
              // Delay validation to allow for complete rendering
              setTimeout(validateDialogAccessibility, 100);
            }
          }
        });
      }
    });
  });

  // Start observing when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  } else {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

export default validateDialogAccessibility;
