import React from "react";
import { Settings, Users, BarChart3, Bell, Zap } from "lucide-react";
import Sidebar, { type SidebarMenuItem, type SidebarUser } from "./Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Example component demonstrating different ways to use the reusable Sidebar component
 * This shows various configurations and customization options
 */
const SidebarExample: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Example 1: Basic menu items
  const basicMenuItems: SidebarMenuItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/users", label: "Users", icon: Users },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  // Example 2: Menu items with badges and disabled state
  const advancedMenuItems: SidebarMenuItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/users", label: "Users", icon: Users, badge: "12" },
    { path: "/notifications", label: "Notifications", icon: Bell, badge: "3" },
    { path: "/premium", label: "Premium Features", icon: Zap, disabled: true },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  // Example user data
  const exampleUser: SidebarUser = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    roles: ["admin", "user"],
  };

  // Custom header example
  const customHeader = (
    <div className="p-4 bg-blue-50 border-b">
      <h3 className="text-sm font-semibold text-blue-900">Project Name</h3>
      <p className="text-xs text-blue-700">v1.0.0</p>
    </div>
  );

  // Custom footer example
  const customFooter = (
    <div className="p-4 space-y-2">
      <Button variant="outline" size="sm" className="w-full">
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Button>
      <div className="text-center">
        <Badge variant="secondary" className="text-xs">
          Build 1.2.3
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sidebar Component Examples
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This page demonstrates various ways to use the reusable Sidebar
            component with different configurations, menu items, and
            customizations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Example 1: Basic Sidebar */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="font-semibold text-gray-900">Basic Sidebar</h2>
              <p className="text-sm text-gray-600">
                Simple sidebar with basic menu items
              </p>
            </div>
            <div className="relative h-96">
              <Sidebar
                menuItems={basicMenuItems}
                user={exampleUser}
                isOpen={true}
                onClose={() => {}}
                className="relative top-0 transform-none"
              />
            </div>
          </div>

          {/* Example 2: Advanced Sidebar */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="font-semibold text-gray-900">Advanced Sidebar</h2>
              <p className="text-sm text-gray-600">
                Sidebar with badges and disabled items
              </p>
            </div>
            <div className="relative h-96">
              <Sidebar
                menuItems={advancedMenuItems}
                user={exampleUser}
                isOpen={true}
                onClose={() => {}}
                className="relative top-0 transform-none"
              />
            </div>
          </div>

          {/* Example 3: Sidebar with Custom Header */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="font-semibold text-gray-900">Custom Header</h2>
              <p className="text-sm text-gray-600">
                Sidebar with custom header content
              </p>
            </div>
            <div className="relative h-96">
              <Sidebar
                menuItems={basicMenuItems}
                user={exampleUser}
                isOpen={true}
                onClose={() => {}}
                header={customHeader}
                className="relative top-0 transform-none"
              />
            </div>
          </div>

          {/* Example 4: Sidebar with Custom Footer */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="font-semibold text-gray-900">Custom Footer</h2>
              <p className="text-sm text-gray-600">
                Sidebar with custom footer content
              </p>
            </div>
            <div className="relative h-96">
              <Sidebar
                menuItems={basicMenuItems}
                user={exampleUser}
                isOpen={true}
                onClose={() => {}}
                footer={customFooter}
                showUserInfo={false}
                className="relative top-0 transform-none"
              />
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Usage Examples
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                1. Basic Usage
              </h3>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                {`import Sidebar from '@/components/layout/Sidebar';
import { useSidebar } from '@/hooks/useSidebar';

const { isOpen, close } = useSidebar();

<Sidebar
  menuItems={menuItems}
  user={user}
  isOpen={isOpen}
  onClose={close}
/>`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                2. Advanced Configuration
              </h3>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                {`<Sidebar
  menuItems={menuItems}
  user={user}
  isOpen={isOpen}
  onClose={close}
  showUserInfo={true}
  header={<CustomHeader />}
  footer={<CustomFooter />}
  className="custom-styles"
/>`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                3. Menu Item with Badge
              </h3>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                {`const menuItems: SidebarMenuItem[] = [
  {
    path: "/notifications",
    label: "Notifications",
    icon: Bell,
    badge: "3"
  },
  {
    path: "/premium",
    label: "Premium",
    icon: Zap,
    disabled: true
  }
];`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarExample;
