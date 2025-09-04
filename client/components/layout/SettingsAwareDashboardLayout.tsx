import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { getSettingByPath, getSettingsSidebarItems } from "@/lib/settingsConfig";

interface SettingsAwareDashboardLayoutProps {
  children: ReactNode;
}

/**
 * Enhanced DashboardLayout that provides proper context for settings pages
 * This component adds a page header for settings pages within the main dashboard layout
 */
const SettingsAwareDashboardLayout: React.FC<SettingsAwareDashboardLayoutProps> = ({
  children,
}) => {
  const location = useLocation();
  const isSettingsPage = location.pathname.startsWith("/settings");
  
  if (!isSettingsPage) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  // Get current setting info based on path
  const currentSetting = getSettingByPath(location.pathname);
  const pageTitle = currentSetting?.label || "Settings";
  const pageDescription = currentSetting?.description || "Manage your console settings and preferences";

  return (
    <DashboardLayout>
      {/* Settings Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6 -mx-6 -mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-600 mt-1">{pageDescription}</p>
          </div>
        </div>
      </div>
      
      {/* Settings Page Content */}
      <div className="max-w-4xl mx-auto w-full">
        {children}
      </div>
    </DashboardLayout>
  );
};

export default SettingsAwareDashboardLayout;
