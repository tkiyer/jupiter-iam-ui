import {
  Info,
  Palette,
  Bell,
  Plug,
  Settings,
  Globe,
  LucideIcon,
} from "lucide-react";
import type { SidebarMenuItem } from "@/components/layout/Sidebar";

/**
 * Settings Configuration
 * Manages the navigation and configuration for the Settings module
 */

export interface SettingsMenuItem {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

// Settings Navigation Items
export const settingsMenuItems: SettingsMenuItem[] = [
  {
    id: "basic-info",
    path: "/settings/basic-info",
    label: "Basic Information",
    icon: Info,
    description: "Manage basic console and user information",
  },
  {
    id: "appearance",
    path: "/settings/appearance",
    label: "Appearance",
    icon: Palette,
    description: "Customize the look and feel of your console",
  },
  {
    id: "notifications",
    path: "/settings/notifications",
    label: "Notifications",
    icon: Bell,
    description: "Configure notification preferences and alerts",
  },
  {
    id: "system-integration",
    path: "/settings/system-integration",
    label: "System Integration",
    icon: Plug,
    description: "Manage external system integrations and APIs",
  },
  {
    id: "system-parameters",
    path: "/settings/system-parameters",
    label: "System Parameters",
    icon: Settings,
    description: "Configure system-wide parameters and settings",
  },
  {
    id: "language-timezone",
    path: "/settings/language-timezone",
    label: "Language & Timezone",
    icon: Globe,
    description: "Set your preferred language and timezone",
  },
];

// Convert to sidebar menu items format
export const getSettingsSidebarItems = (): SidebarMenuItem[] => {
  return settingsMenuItems.map((item) => ({
    path: item.path,
    label: item.label,
    icon: item.icon,
  }));
};

// Get setting item by ID
export const getSettingById = (id: string): SettingsMenuItem | undefined => {
  return settingsMenuItems.find((item) => item.id === id);
};

// Get setting item by path
export const getSettingByPath = (
  path: string,
): SettingsMenuItem | undefined => {
  return settingsMenuItems.find((item) => item.path === path);
};
