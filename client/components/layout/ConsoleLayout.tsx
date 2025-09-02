import React, { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import ConsoleNavbar from "@/components/layout/ConsoleNavbar";

interface ConsoleLayoutProps {
  children: ReactNode;
}

const ConsoleLayout: React.FC<ConsoleLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 pt-16">
      <ConsoleNavbar fixed />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 h-[100vh] overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default ConsoleLayout;
