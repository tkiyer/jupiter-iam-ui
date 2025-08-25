/**
 * Accessibility validation utilities for Dialog components
 * This helps ensure all dialogs meet accessibility requirements
 */

export const validateDialogAccessibility = () => {
  if (typeof window === 'undefined') return;

  // Check for dialogs without proper titles
  const dialogContents = document.querySelectorAll('[data-radix-dialog-content]');

  let issuesFound = 0;

  dialogContents.forEach((content, index) => {
    const hasTitle = content.querySelector('[data-radix-dialog-title]');
    const hasVisuallyHiddenTitle = content.querySelector('.sr-only [data-radix-dialog-title], [data-radix-dialog-title].sr-only');

    if (!hasTitle && !hasVisuallyHiddenTitle) {
      console.warn(
        `🚨 Dialog accessibility issue #${issuesFound + 1}: Dialog at index ${index} is missing a DialogTitle.`,
        '\n📖 Solution: Add a DialogTitle or wrap it with VisuallyHidden component.',
        '\n🔗 More info: https://radix-ui.com/primitives/docs/components/dialog',
        '\n📍 Element:', content
      );
      issuesFound++;
    }
  });

  if (issuesFound === 0) {
    console.log('✅ All dialogs have proper accessibility titles');
  } else {
    console.warn(`⚠️  Found ${issuesFound} dialog accessibility issue(s)`);
  }

  return issuesFound;
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
