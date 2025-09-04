import React, { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import ConsoleNavbar from "@/components/layout/ConsoleNavbar";
import SiteFooter from "@/components/layout/SiteFooter";
import Sidebar, { type SidebarMenuItem } from "@/components/layout/Sidebar";
import { useSidebar } from "@/hooks/useSidebar";

interface FlexibleLayoutProps {
  children: ReactNode;
  /** Menu items for the sidebar */
  menuItems: SidebarMenuItem[];
  /** Whether to show the sidebar at all */
  showSidebar?: boolean;
  /** Whether to show user info in sidebar */
  showUserInfo?: boolean;
  /** Custom sidebar header */
  sidebarHeader?: React.ReactNode;
  /** Custom sidebar footer */
  sidebarFooter?: React.ReactNode;
  /** Custom navbar content */
  navbarContent?: React.ReactNode;
  /** Whether the navbar is fixed */
  fixedNavbar?: boolean;
}

/**
 * A flexible layout component that can be configured with different sidebar options
 * This demonstrates the reusability of the Sidebar component
 */
const FlexibleLayout: React.FC<FlexibleLayoutProps> = ({
  children,
  menuItems,
  showSidebar = true,
  showUserInfo = true,
  sidebarHeader,
  sidebarFooter,
  navbarContent,
  fixedNavbar = true,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { isOpen: sidebarOpen, open: openSidebar, close: closeSidebar } = useSidebar(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      {/* Fixed top navbar */}
      <ConsoleNavbar
        fixed={fixedNavbar}
        showMenuButton={showSidebar}
        onMenuClick={openSidebar}
      >
        {navbarContent}
      </ConsoleNavbar>

      {/* Mobile sidebar backdrop */}
      {showSidebar && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Body area */}
      <div className={`${fixedNavbar ? "pt-16" : ""} flex h-[100vh] w-full overflow-hidden`}>
        {/* Conditional Sidebar */}
        {showSidebar && (
          <Sidebar
            menuItems={menuItems}
            user={user}
            isOpen={sidebarOpen}
            onClose={closeSidebar}
            showUserInfo={showUserInfo}
            header={sidebarHeader}
            footer={sidebarFooter}
          />
        )}

        {/* Main Content */}
        <div className={`flex-1 flex flex-col min-h-0 ${showSidebar ? "lg:ml-64" : ""}`}>
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6 min-h-0 flex flex-col">
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </main>
        </div>
      </div>
    </div>
  );
};

export default FlexibleLayout;
