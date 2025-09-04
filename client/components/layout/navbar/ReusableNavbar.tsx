import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NotificationsDropdown } from "@/components/ui/notifications-dropdown";
import { Settings, Menu } from "lucide-react";
import { NavbarConfig, NavbarMenuItem } from "@/lib/navbarConfig";
import NavbarLogo from "./NavbarLogo";
import NavbarSearch from "./NavbarSearch";
import NavbarUserMenu, { NavbarUser } from "./NavbarUserMenu";

interface ReusableNavbarProps {
  /** Navbar configuration object */
  config: NavbarConfig;
  /** Current user data */
  user: NavbarUser | null;
  /** Whether the navbar is fixed position */
  fixed?: boolean;
  /** Whether to show the mobile menu button */
  showMenuButton?: boolean;
  /** Callback for mobile menu button click */
  onMenuClick?: () => void;
  /** Callback for user logout */
  onLogout?: () => void;
  /** Callback for search functionality */
  onSearch?: (query: string) => void;
  /** Whether to show the search bar */
  showSearch?: boolean;
  /** Whether to show the settings button */
  showSettings?: boolean;
  /** Whether to show notifications */
  showNotifications?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom navbar menu items (overrides config) */
  customMenuItems?: NavbarMenuItem[];
  /** Custom settings click handler (overrides default routing) */
  onSettingsClick?: () => void;
  /** Settings route path (default: /console/settings) */
  settingsPath?: string;
}

/**
 * A comprehensive reusable navbar component that can be configured
 * for different contexts and user roles
 */
const ReusableNavbar: React.FC<ReusableNavbarProps> = ({
  config,
  user,
  fixed = false,
  showMenuButton = false,
  onMenuClick,
  onLogout,
  onSearch,
  showSearch = true,
  showSettings = true,
  showNotifications = true,
  className = "",
  customMenuItems,
  onSettingsClick,
  settingsPath = "/console/settings",
}) => {
  const menuItems = customMenuItems || config.userMenuItems;

  return (
    <nav
      className={`${
        fixed ? "fixed top-0 left-0 right-0 z-50 " : ""
      }bg-white border-b border-gray-200 shadow-sm ${className}`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Mobile Menu + Logo */}
          <div className="flex items-center space-x-3">
            {showMenuButton && (
              <button
                type="button"
                onClick={onMenuClick}
                className="lg:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
            )}
            <NavbarLogo
              title={config.title}
              subtitle={config.subtitle}
              icon={config.logoIcon}
            />
          </div>

          {/* Right Side - Search, Settings, Notifications, User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search Box */}
            {showSearch && (
              <NavbarSearch
                placeholder={config.searchPlaceholder}
                onSearch={onSearch}
              />
            )}

            {/* Settings Button */}
            {showSettings && (
              onSettingsClick ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  onClick={onSettingsClick}
                  title="Console Settings"
                >
                  <Settings className="h-5 w-5 text-gray-600" />
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="p-2" asChild>
                  <Link to={settingsPath} title="Console Settings">
                    <Settings className="h-5 w-5 text-gray-600" />
                  </Link>
                </Button>
              )
            )}

            {/* Notifications */}
            {showNotifications && <NotificationsDropdown />}

            {/* User Menu */}
            <NavbarUserMenu
              user={user}
              menuItems={menuItems}
              onLogout={onLogout}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ReusableNavbar;
