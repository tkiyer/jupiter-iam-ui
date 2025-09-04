import React, { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ConsoleNavbar from "@/components/layout/ConsoleNavbar";
import SiteFooter from "@/components/layout/SiteFooter";
import Sidebar from "@/components/layout/Sidebar";
import { useSidebar } from "@/hooks/useSidebar";
import { getConsoleSettingsSidebarItems, getConsoleSettingByPath } from "@/lib/consoleSettingsConfig";

interface ConsoleSettingsLayoutProps {
  children: ReactNode;
  /** Page title override */
  title?: string;
  /** Page description override */
  description?: string;
}

const ConsoleSettingsLayout: React.FC<ConsoleSettingsLayoutProps> = ({
  children,
  title,
  description,
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const { isOpen: sidebarOpen, open: openSidebar, close: closeSidebar } = useSidebar(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Get current setting info based on path
  const currentSetting = getConsoleSettingByPath(location.pathname);
  const pageTitle = title || currentSetting?.label || "Console Settings";
  const pageDescription = description || currentSetting?.description || "Manage your console settings and preferences";

  const sidebarMenuItems = getConsoleSettingsSidebarItems();

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      {/* Fixed top navbar */}
      <ConsoleNavbar
        fixed
        showMenuButton
        onMenuClick={openSidebar}
        context="console"
      />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Body area below navbar */}
      <div className="pt-16 flex h-[100vh] w-full overflow-hidden">
        {/* Settings Sidebar */}
        <Sidebar
          menuItems={sidebarMenuItems}
          user={user}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          showUserInfo={false}
          header={
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/console" className="flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Console
                  </Link>
                </Button>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Console Settings</h2>
                <p className="text-sm text-gray-600">Manage your console preferences</p>
              </div>
            </div>
          }
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 lg:ml-64">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
                <p className="text-sm text-gray-600 mt-1">{pageDescription}</p>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6 min-h-0 flex flex-col">
            <div className="flex-1 max-w-4xl mx-auto w-full">
              {children}
            </div>
            <SiteFooter />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ConsoleSettingsLayout;
