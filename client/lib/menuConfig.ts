import {
  Shield,
  Users,
  Key,
  Settings,
  FileText,
  BarChart3,
  Home,
  Building2,
} from "lucide-react";
import type { SidebarMenuItem } from "@/components/layout/Sidebar";

// Default dashboard navigation items
export const defaultDashboardMenuItems: SidebarMenuItem[] = [
  { path: "/console", label: "Console", icon: Home },
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/users", label: "User Management", icon: Users },
  { path: "/roles", label: "Role Management", icon: Key },
  { path: "/permissions", label: "Permissions", icon: Settings },
  { path: "/policies", label: "ABAC Policies", icon: FileText },
  { path: "/access-control", label: "Access Control", icon: Shield },
  { path: "/business-scenarios", label: "Business Scenarios", icon: Building2 },
  { path: "/audit", label: "Audit Logs", icon: BarChart3 },
];

// Console-specific navigation items (if console needs a sidebar)
export const consoleMenuItems: SidebarMenuItem[] = [
  { path: "/console", label: "Console Home", icon: Home },
  { path: "/dashboard", label: "Go to Dashboard", icon: BarChart3 },
];

// Admin-specific menu items
export const adminMenuItems: SidebarMenuItem[] = [
  ...defaultDashboardMenuItems,
  // Additional admin-only items can be added here
];

// User-specific menu items (filtered based on permissions)
export const getUserMenuItems = (userRoles: string[]): SidebarMenuItem[] => {
  const isAdmin = userRoles.includes("admin");
  const isSuperAdmin = userRoles.includes("super-admin");

  if (isAdmin || isSuperAdmin) {
    return adminMenuItems;
  }

  // Filter menu items based on user roles
  return defaultDashboardMenuItems.filter((item) => {
    // Example role-based filtering logic
    switch (item.path) {
      case "/users":
      case "/roles":
        return userRoles.includes("admin") || userRoles.includes("user-manager");
      case "/policies":
      case "/access-control":
        return userRoles.includes("admin") || userRoles.includes("policy-manager");
      case "/audit":
        return userRoles.includes("admin") || userRoles.includes("auditor");
      default:
        return true; // Show basic items to all users
    }
  });
};

/**
 * Utility function to create menu items with optional badges
 */
export const createMenuItem = (
  path: string,
  label: string,
  icon: any,
  options?: {
    badge?: string;
    disabled?: boolean;
  },
): SidebarMenuItem => ({
  path,
  label,
  icon,
  ...options,
});

/**
 * Utility function to add badges to existing menu items
 */
export const addBadgeToMenuItem = (
  menuItems: SidebarMenuItem[],
  path: string,
  badge: string,
): SidebarMenuItem[] => {
  return menuItems.map((item) =>
    item.path === path ? { ...item, badge } : item,
  );
};
