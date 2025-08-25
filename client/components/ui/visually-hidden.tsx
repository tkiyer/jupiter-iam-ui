import * as React from "react";
import * as VisuallyHiddenPrimitive from "@radix-ui/react-visually-hidden";

/**
 * VisuallyHidden component - renders content that is accessible to screen readers
 * but visually hidden from sighted users.
 * 
 * This is useful for providing accessible labels and descriptions without 
 * affecting the visual design.
 */
const VisuallyHidden = React.forwardRef<
  React.ElementRef<typeof VisuallyHiddenPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof VisuallyHiddenPrimitive.Root>
>(({ ...props }, ref) => (
  <VisuallyHiddenPrimitive.Root ref={ref} {...props} />
));

VisuallyHidden.displayName = "VisuallyHidden";

export { VisuallyHidden };
