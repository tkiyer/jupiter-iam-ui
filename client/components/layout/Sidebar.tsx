import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface SidebarMenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
}

export interface SidebarUser {
  firstName: string;
  lastName: string;
  roles: string[];
  email?: string;
}

export interface SidebarProps {
  /** Menu items to display in the sidebar */
  menuItems: SidebarMenuItem[];
  /** User information to display at the bottom */
  user?: SidebarUser | null;
  /** Whether the sidebar is open (for mobile) */
  isOpen: boolean;
  /** Callback when sidebar should close (for mobile) */
  onClose: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show user info section */
  showUserInfo?: boolean;
  /** Custom header content */
  header?: React.ReactNode;
  /** Custom footer content */
  footer?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({
  menuItems,
  user,
  isOpen,
  onClose,
  className,
  showUserInfo = true,
  header,
  footer,
}) => {
  const location = useLocation();

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div
      className={cn(
        "fixed top-16 bottom-0 left-0 z-40 w-64 bg-white shadow-lg overflow-y-auto transform transition-transform duration-300 ease-in-out shrink-0 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className,
      )}
    >
      {/* Custom Header */}
      {header && <div className="border-b border-gray-200">{header}</div>}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                item.disabled
                  ? "text-gray-400 cursor-not-allowed"
                  : isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault();
                  return;
                }
                onClose();
              }}
              aria-disabled={item.disabled}
            >
              <Icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  item.disabled
                    ? "text-gray-400"
                    : isActive
                      ? "text-blue-700"
                      : "text-gray-400 group-hover:text-gray-600",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info Section */}
      {showUserInfo && user && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                {getUserInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {`${user.firstName} ${user.lastName}`}
              </p>
              {user.email && (
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              )}
              <div className="flex items-center space-x-2 mt-1">
                {user.roles.map((role, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Footer */}
      {footer && <div className="border-t border-gray-200">{footer}</div>}
    </div>
  );
};

export default Sidebar;
