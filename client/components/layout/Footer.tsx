import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800">IAM Console</span>
          <span>© {year}</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="#" className="hover:text-gray-900">
            Privacy
          </Link>
          <Link to="#" className="hover:text-gray-900">
            Terms
          </Link>
          <Link to="#" className="hover:text-gray-900">
            Support
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
