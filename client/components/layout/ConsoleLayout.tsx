import React, { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import ConsoleNavbar from "@/components/layout/ConsoleNavbar";
import SiteFooter from "@/components/layout/SiteFooter";
import Sidebar, { type SidebarMenuItem } from "@/components/layout/Sidebar";
import { useSidebar } from "@/hooks/useSidebar";
import { consoleMenuItems } from "@/lib/menuConfig";

interface ConsoleLayoutProps {
  children: ReactNode;
  /** Whether to show sidebar (default: false for console) */
  showSidebar?: boolean;
  /** Custom menu items for sidebar */
  menuItems?: SidebarMenuItem[];
  /** Whether to show user info in sidebar */
  showUserInfo?: boolean;
}

const ConsoleLayout: React.FC<ConsoleLayoutProps> = ({
  children,
  showSidebar = false,
  menuItems = consoleMenuItems,
  showUserInfo = false,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { isOpen: sidebarOpen, open: openSidebar, close: closeSidebar } = useSidebar(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!showSidebar) {
    // Original console layout without sidebar
    return (
      <div className="h-screen overflow-hidden bg-gray-50 pt-16">
        <ConsoleNavbar fixed />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </main>
      </div>
    );
  }

  // Console layout with optional sidebar
  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <ConsoleNavbar
        fixed
        showMenuButton
        onMenuClick={openSidebar}
      />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <div className="pt-16 flex h-[100vh] w-full overflow-hidden">
        <Sidebar
          menuItems={menuItems}
          user={user}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          showUserInfo={showUserInfo}
        />

        <div className="flex-1 flex flex-col min-h-0 lg:ml-64">
          <main className="w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 overflow-y-auto flex flex-col">
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ConsoleLayout;
