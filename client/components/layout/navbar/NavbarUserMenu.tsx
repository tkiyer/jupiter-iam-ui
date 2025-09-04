import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { NavbarMenuItem } from "@/lib/navbarConfig";
import { cn } from "@/lib/utils";

export interface NavbarUser {
  firstName: string;
  lastName: string;
  roles: string[];
  email?: string;
}

interface NavbarUserMenuProps {
  user: NavbarUser | null;
  menuItems: NavbarMenuItem[];
  onLogout?: () => void;
}

const NavbarUserMenu: React.FC<NavbarUserMenuProps> = ({
  user,
  menuItems,
  onLogout,
}) => {
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleMenuItemClick = (item: NavbarMenuItem) => {
    if (item.id === "logout" && onLogout) {
      onLogout();
    } else if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 pl-2 pr-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
              {user ? getUserInitials(user.firstName, user.lastName) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900">
              {user ? `${user.firstName} ${user.lastName}` : "User"}
            </p>
            <p className="text-xs text-gray-500">
              {user?.roles[0] || "User"}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {menuItems.map((item, index) => {
          if (item.separator) {
            return <DropdownMenuSeparator key={`separator-${index}`} />;
          }

          const Icon = item.icon;
          const isDestructive = item.variant === "destructive";

          if (item.href) {
            return (
              <DropdownMenuItem key={item.id} asChild>
                <Link
                  to={item.href}
                  className={cn(isDestructive && "text-red-600")}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          }

          return (
            <DropdownMenuItem
              key={item.id}
              onClick={() => handleMenuItemClick(item)}
              className={cn(isDestructive && "text-red-600")}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavbarUserMenu;
