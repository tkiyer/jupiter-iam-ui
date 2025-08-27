/**
 * Simple accessibility validation for development
 */

const validateDialogAccessibility = () => {
  if (typeof window === "undefined") return 0;

  const dialogContents = document.querySelectorAll(
    "[data-radix-dialog-content]",
  );
  let issuesFound = 0;

  dialogContents.forEach((content, index) => {
    const hasTitle = content.querySelector("[data-radix-dialog-title]");
    if (!hasTitle) {
      console.warn(`Dialog ${index} missing DialogTitle`);
      issuesFound++;
    }
  });

  return issuesFound;
};

// Run validation in development mode only
if (process.env.NODE_ENV === "development") {
  setTimeout(validateDialogAccessibility, 1000);
}
