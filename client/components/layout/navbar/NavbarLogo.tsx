import React from "react";
import { Link } from "react-router-dom";
import { LucideIcon, Home } from "lucide-react";

interface NavbarLogoProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  href?: string;
  showHomeIcon?: boolean;
}

const NavbarLogo: React.FC<NavbarLogoProps> = ({
  title,
  subtitle,
  icon: Icon,
  href = "/console",
  showHomeIcon = true,
}) => {
  return (
    <Link to={href} className="flex items-center space-x-3">
      <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {showHomeIcon && (
            <Home className="h-5 w-5 text-gray-600 hover:text-blue-600 transition-colors" />
          )}
        </div>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </Link>
  );
};

export default NavbarLogo;
