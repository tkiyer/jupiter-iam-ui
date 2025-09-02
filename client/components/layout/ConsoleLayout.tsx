import React, { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import ConsoleNavbar from "@/components/layout/ConsoleNavbar";
import Footer from "@/components/layout/Footer";

interface ConsoleLayoutProps {
  children: ReactNode;
}

const ConsoleLayout: React.FC<ConsoleLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsoleNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {children}
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default ConsoleLayout;
