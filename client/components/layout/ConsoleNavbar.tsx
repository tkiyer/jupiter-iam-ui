import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import ReusableNavbar from "./navbar/ReusableNavbar";
import { getNavbarConfig, filterMenuItemsByPermissions } from "@/lib/navbarConfig";

interface ConsoleNavbarProps {
  fixed?: boolean;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  showSearch?: boolean;
  showSettings?: boolean;
  showNotifications?: boolean;
  context?: "console" | "dashboard" | "admin";
}

/**
 * Console Navbar component - now using the reusable navbar system
 * Maintains the same API for backward compatibility while using the new architecture
 */
const ConsoleNavbar: React.FC<ConsoleNavbarProps> = ({
  fixed = false,
  onMenuClick,
  showMenuButton = false,
  showSearch = true,
  showSettings = true,
  showNotifications = true,
  context = "console",
}) => {
  const { user, logout } = useAuth();

  // Get navbar configuration based on user role and context
  const config = getNavbarConfig(user?.roles || [], context);

  // Filter menu items based on user permissions
  const filteredMenuItems = filterMenuItemsByPermissions(
    config.userMenuItems,
    user?.roles || []
  );

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    // Add custom search logic here
  };

  return (
    <ReusableNavbar
      config={config}
      user={user}
      fixed={fixed}
      showMenuButton={showMenuButton}
      onMenuClick={onMenuClick}
      onLogout={logout}
      onSearch={handleSearch}
      showSearch={showSearch}
      showSettings={showSettings}
      showNotifications={showNotifications}
      customMenuItems={filteredMenuItems}
    />
  );
};

export default ConsoleNavbar;
