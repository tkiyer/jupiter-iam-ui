import { useState, useCallback } from "react";

interface UseSidebarReturn {
  /** Whether the sidebar is open (for mobile) */
  isOpen: boolean;
  /** Opens the sidebar */
  open: () => void;
  /** Closes the sidebar */
  close: () => void;
  /** Toggles the sidebar open/closed state */
  toggle: () => void;
}

/**
 * Hook for managing sidebar open/close state, particularly useful for mobile layouts
 */
export const useSidebar = (initialOpen = false): UseSidebarReturn => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};
