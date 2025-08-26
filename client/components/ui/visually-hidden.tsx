import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * VisuallyHidden component - renders content that is accessible to screen readers
 * but visually hidden from sighted users.
 *
 * This is useful for providing accessible labels and descriptions without
 * affecting the visual design.
 */
const VisuallyHidden = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & {
    asChild?: boolean;
  }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "span";

  if (asChild) {
    return <>{props.children}</>;
  }

  return (
    <Comp
      ref={ref}
      className={cn(
        // Screen reader only styles - visually hidden but accessible
        "absolute w-px h-px p-0 -m-px overflow-hidden clip-[rect(0,0,0,0)] whitespace-nowrap border-0",
        className
      )}
      {...props}
    />
  );
});

VisuallyHidden.displayName = "VisuallyHidden";

export { VisuallyHidden };
