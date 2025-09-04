import { LucideIcon, User, Home, LogOut, Settings, Shield } from "lucide-react";

export interface NavbarMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "destructive";
  separator?: boolean;
}

export interface NavbarConfig {
  title: string;
  subtitle: string;
  logoIcon: LucideIcon;
  searchPlaceholder: string;
  userMenuItems: NavbarMenuItem[];
}

// Default navbar configuration
export const defaultNavbarConfig: NavbarConfig = {
  title: "IAM Console",
  subtitle: "Identity & Access Management",
  logoIcon: Shield,
  searchPlaceholder: "Search systems, users, policies...",
  userMenuItems: [
    {
      id: "profile",
      label: "Profile Settings",
      icon: User,
      href: "/profile",
    },
    {
      id: "dashboard",
      label: "IAM Center",
      icon: Home,
      href: "/dashboard",
    },
    {
      id: "separator-1",
      label: "",
      icon: User, // Will be ignored due to separator
      separator: true,
    },
    {
      id: "logout",
      label: "Sign Out",
      icon: LogOut,
      variant: "destructive",
    },
  ],
};

// Console-specific navbar configuration
export const consoleNavbarConfig: NavbarConfig = {
  ...defaultNavbarConfig,
  userMenuItems: [
    {
      id: "profile",
      label: "Profile Settings",
      icon: User,
      href: "/profile",
    },
    {
      id: "dashboard",
      label: "IAM Center",
      icon: Home,
      href: "/dashboard",
    },
    {
      id: "console-settings",
      label: "Console Setting",
      icon: Settings,
      href: "/console/settings",
    },
    {
      id: "separator-1",
      label: "",
      icon: User,
      separator: true,
    },
    {
      id: "logout",
      label: "Sign Out",
      icon: LogOut,
      variant: "destructive",
    },
  ],
};

// Admin-specific navbar configuration
export const adminNavbarConfig: NavbarConfig = {
  ...defaultNavbarConfig,
  userMenuItems: [
    {
      id: "profile",
      label: "Profile Settings",
      icon: User,
      href: "/profile",
    },
    {
      id: "dashboard",
      label: "IAM Center",
      icon: Home,
      href: "/dashboard",
    },
    {
      id: "admin-settings",
      label: "Admin Settings",
      icon: Settings,
      href: "/admin/settings",
    },
    {
      id: "separator-1",
      label: "",
      icon: User,
      separator: true,
    },
    {
      id: "logout",
      label: "Sign Out",
      icon: LogOut,
      variant: "destructive",
    },
  ],
};

/**
 * Get navbar configuration based on user role and context
 */
export const getNavbarConfig = (
  userRoles: string[] = [],
  context: "console" | "dashboard" | "admin" = "console",
): NavbarConfig => {
  const isAdmin = userRoles.includes("admin") || userRoles.includes("super-admin");
  
  if (isAdmin && context === "admin") {
    return adminNavbarConfig;
  }
  
  if (context === "console") {
    return consoleNavbarConfig;
  }
  
  return defaultNavbarConfig;
};

/**
 * Filter navbar menu items based on user permissions
 */
export const filterMenuItemsByPermissions = (
  menuItems: NavbarMenuItem[],
  userRoles: string[],
): NavbarMenuItem[] => {
  return menuItems.filter((item) => {
    // Example permission filtering logic
    switch (item.id) {
      case "admin-settings":
        return userRoles.includes("admin") || userRoles.includes("super-admin");
      default:
        return true;
    }
  });
};

/**
 * Create a custom navbar menu item
 */
export const createNavbarMenuItem = (
  id: string,
  label: string,
  icon: LucideIcon,
  options?: {
    href?: string;
    onClick?: () => void;
    variant?: "default" | "destructive";
    separator?: boolean;
  },
): NavbarMenuItem => ({
  id,
  label,
  icon,
  ...options,
});
