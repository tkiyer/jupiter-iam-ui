import "./global.css";

// Import ResizeObserver fix FIRST to prevent Radix UI errors
import "@/utils/resizeObserver";

// Import accessibility validation and debug utilities in development
if (process.env.NODE_ENV === "development") {
  import("@/utils/accessibility-check");
  import("@/utils/debugAuth");
}

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ConsoleLayout from "@/components/layout/ConsoleLayout";
import SettingsAwareDashboardLayout from "@/components/layout/SettingsAwareDashboardLayout";
import RootRedirect from "@/components/RootRedirect";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Console from "./pages/Console";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Permissions from "./pages/Permissions";
import Policies from "./pages/Policies";
import AccessControl from "./pages/AccessControl";
import BusinessScenarios from "./pages/BusinessScenarios";
import Audit from "./pages/Audit";
import NotFound from "./pages/NotFound";
import SidebarExample from "./components/layout/SidebarExample";
import Profile from "./pages/Profile";

// Settings Pages
import BasicInformation from "./pages/console-settings/BasicInformation";
import Appearance from "./pages/console-settings/Appearance";
import Notifications from "./pages/console-settings/Notifications";
import SystemIntegration from "./pages/console-settings/SystemIntegration";
import SystemParameters from "./pages/console-settings/SystemParameters";
import LanguageTimezone from "./pages/console-settings/LanguageTimezone";
import SettingsIndex from "./pages/console-settings/index";

// Error Boundary Component for catching React errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Suppress ResizeObserver errors
    if (error.message.includes("ResizeObserver loop completed")) {
      console.warn(
        "ResizeObserver error caught and suppressed in ErrorBoundary",
      );
      this.setState({ hasError: false, error: undefined });
      return;
    }

    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (
      this.state.hasError &&
      this.state.error &&
      !this.state.error.message.includes("ResizeObserver loop completed")
    ) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">An unexpected error occurred</p>
            <button
              onClick={() =>
                this.setState({ hasError: false, error: undefined })
              }
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on ResizeObserver-related errors
        if (
          error instanceof Error &&
          error.message.includes("ResizeObserver")
        ) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// Debug message to confirm ResizeObserver fix is loaded
console.log("✅ ResizeObserver error handling initialized");

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200} skipDelayDuration={300}>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/profile"
                element={
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                }
              />
              <Route
                path="/console"
                element={
                  <ConsoleLayout>
                    <Console />
                  </ConsoleLayout>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                }
              />
              <Route
                path="/users"
                element={
                  <DashboardLayout>
                    <Users />
                  </DashboardLayout>
                }
              />
              <Route
                path="/roles"
                element={
                  <DashboardLayout>
                    <Roles />
                  </DashboardLayout>
                }
              />
              <Route
                path="/permissions"
                element={
                  <DashboardLayout>
                    <Permissions />
                  </DashboardLayout>
                }
              />
              <Route
                path="/policies"
                element={
                  <DashboardLayout>
                    <Policies />
                  </DashboardLayout>
                }
              />
              <Route
                path="/access-control"
                element={
                  <DashboardLayout>
                    <AccessControl />
                  </DashboardLayout>
                }
              />
              <Route
                path="/business-scenarios"
                element={
                  <DashboardLayout>
                    <BusinessScenarios />
                  </DashboardLayout>
                }
              />
              <Route
                path="/audit"
                element={
                  <DashboardLayout>
                    <Audit />
                  </DashboardLayout>
                }
              />
              <Route
                path="/sidebar-example"
                element={<SidebarExample />}
              />

              {/* Settings Routes */}
              <Route
                path="/settings"
                element={<SettingsIndex />}
              />
              <Route
                path="/settings/basic-info"
                element={
                  <SettingsAwareDashboardLayout>
                    <BasicInformation />
                  </SettingsAwareDashboardLayout>
                }
              />
              <Route
                path="/settings/appearance"
                element={
                  <SettingsAwareDashboardLayout>
                    <Appearance />
                  </SettingsAwareDashboardLayout>
                }
              />
              <Route
                path="/settings/notifications"
                element={
                  <SettingsAwareDashboardLayout>
                    <Notifications />
                  </SettingsAwareDashboardLayout>
                }
              />
              <Route
                path="/settings/system-integration"
                element={
                  <SettingsAwareDashboardLayout>
                    <SystemIntegration />
                  </SettingsAwareDashboardLayout>
                }
              />
              <Route
                path="/settings/system-parameters"
                element={
                  <SettingsAwareDashboardLayout>
                    <SystemParameters />
                  </SettingsAwareDashboardLayout>
                }
              />
              <Route
                path="/settings/language-timezone"
                element={
                  <SettingsAwareDashboardLayout>
                    <LanguageTimezone />
                  </SettingsAwareDashboardLayout>
                }
              />

              {/* Backwards compatibility redirects for old console/settings URLs */}
              <Route path="/console/settings" element={<SettingsIndex />} />
              <Route path="/console/settings/*" element={<SettingsIndex />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

createRoot(document.getElementById("root")!).render(<App />);
