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

export interface ConsoleSettingsMenuItem {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

// Console Settings Navigation Items
export const consoleSettingsMenuItems: ConsoleSettingsMenuItem[] = [
  {
    id: "basic-info",
    path: "/console/settings/basic-info",
    label: "Basic Information",
    icon: Info,
    description: "Manage basic console and user information",
  },
  {
    id: "appearance",
    path: "/console/settings/appearance",
    label: "Appearance",
    icon: Palette,
    description: "Customize the look and feel of your console",
  },
  {
    id: "notifications",
    path: "/console/settings/notifications",
    label: "Notifications",
    icon: Bell,
    description: "Configure notification preferences and alerts",
  },
  {
    id: "system-integration",
    path: "/console/settings/system-integration",
    label: "System Integration",
    icon: Plug,
    description: "Manage external system integrations and APIs",
  },
  {
    id: "system-parameters",
    path: "/console/settings/system-parameters",
    label: "System Parameters",
    icon: Settings,
    description: "Configure system-wide parameters and settings",
  },
  {
    id: "language-timezone",
    path: "/console/settings/language-timezone",
    label: "Language & Timezone",
    icon: Globe,
    description: "Set your preferred language and timezone",
  },
];

// Convert to sidebar menu items format
export const getConsoleSettingsSidebarItems = (): SidebarMenuItem[] => {
  return consoleSettingsMenuItems.map((item) => ({
    path: item.path,
    label: item.label,
    icon: item.icon,
  }));
};

// Get setting item by ID
export const getConsoleSettingById = (id: string): ConsoleSettingsMenuItem | undefined => {
  return consoleSettingsMenuItems.find((item) => item.id === id);
};

// Get setting item by path
export const getConsoleSettingByPath = (path: string): ConsoleSettingsMenuItem | undefined => {
  return consoleSettingsMenuItems.find((item) => item.path === path);
};
