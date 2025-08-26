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

// Additional accessibility validation functions
export const validateAllAccessibility = () => {
  const issues = [];

  // Check dialogs
  const dialogIssues = validateDialogAccessibility();
  if (dialogIssues > 0) {
    issues.push(`${dialogIssues} dialog title issues`);
  }

  // Check for missing alt text on images
  const images = document.querySelectorAll('img:not([alt])');
  if (images.length > 0) {
    console.warn(`🖼️  Found ${images.length} images without alt text`);
    issues.push(`${images.length} missing alt text`);
  }

  // Check for empty button text
  const emptyButtons = document.querySelectorAll('button:empty:not([aria-label]):not([aria-labelledby])');
  if (emptyButtons.length > 0) {
    console.warn(`🔲 Found ${emptyButtons.length} buttons without accessible text`);
    issues.push(`${emptyButtons.length} unlabeled buttons`);
  }

  if (issues.length === 0) {
    console.log('🎉 No accessibility issues detected!');
  } else {
    console.warn('🔍 Accessibility issues found:', issues.join(', '));
  }

  return issues;
};

// Run validation in development mode
if (process.env.NODE_ENV === 'development') {
  let validationTimeout: NodeJS.Timeout;

  // Debounced validation function
  const debouncedValidation = () => {
    clearTimeout(validationTimeout);
    validationTimeout = setTimeout(() => {
      validateDialogAccessibility();
    }, 200);
  };

  // Run validation after DOM mutations
  const observer = new MutationObserver((mutations) => {
    let shouldValidate = false;

    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.matches('[data-radix-dialog-content], [data-radix-dialog-overlay]') ||
                element.querySelector('[data-radix-dialog-content], [data-radix-dialog-overlay]')) {
              shouldValidate = true;
            }
          }
        });
      }
    });

    if (shouldValidate) {
      debouncedValidation();
    }
  });

  // Start observing when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      // Initial validation
      setTimeout(validateDialogAccessibility, 1000);
    });
  } else {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    // Initial validation
    setTimeout(validateDialogAccessibility, 1000);
  }

  // Global accessibility checker
  (window as any).__checkAccessibility = validateAllAccessibility;
  console.log('🔧 Accessibility validation enabled. Run __checkAccessibility() to check all issues.');
}

export default validateDialogAccessibility;
