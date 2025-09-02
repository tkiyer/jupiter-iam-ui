import React, { ReactNode, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation, Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ConsoleNavbar from "@/components/layout/ConsoleNavbar";
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

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigationItems = [
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

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed top navbar */}
      <ConsoleNavbar
        fixed
        showMenuButton
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Body area below navbar */}
      <div className="pt-16 flex min-h-[calc(100vh-4rem)] w-full">
        {/* Sidebar */}
        <div
          className={cn(
            "fixed top-16 bottom-0 left-0 z-40 w-64 bg-white shadow-lg overflow-y-auto transform transition-transform duration-300 ease-in-out shrink-0 lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      isActive ? "text-blue-700" : "text-gray-400",
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                  {user ? getUserInitials(user.firstName, user.lastName) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user ? `${user.firstName} ${user.lastName}` : "Unknown User"}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  {user?.roles.map((role, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 lg:ml-64">
          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-gray-50 p-6 min-h-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
