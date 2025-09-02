import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Shield,
  Database,
  Cloud,
  Monitor,
  ExternalLink,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Mail,
  Calendar,
  MapPin,
  TrendingUp,
  Server,
  Zap,
  Settings,
  Lock,
  Globe,
  Plus,
} from "lucide-react";

interface AccessEvent {
  id: string;
  timestamp: string;
  action: string;
  resource: string;
  status: "success" | "failure" | "warning";
  ip: string;
  userAgent: string;
}

interface SystemAccess {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  status: "online" | "offline" | "maintenance";
  url: string;
  lastAccessed?: string;
}

interface SystemAlert {
  id: string;
  type: "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
}

const Console: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accessHistory, setAccessHistory] = useState<AccessEvent[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConsoleData();
  }, []);

  const fetchConsoleData = async () => {
    try {
      // In a real application, these would be separate API calls
      // For demo purposes, we'll use mock data
      setAccessHistory([
        {
          id: "1",
          timestamp: "2024-01-15T10:30:00Z",
          action: "Login",
          resource: "IAM Console",
          status: "success",
          ip: "192.168.1.100",
          userAgent: "Chrome/120.0.0.0",
        },
        {
          id: "2",
          timestamp: "2024-01-15T10:25:00Z",
          action: "Policy Update",
          resource: "user-access-policy",
          status: "success",
          ip: "192.168.1.100",
          userAgent: "Chrome/120.0.0.0",
        },
        {
          id: "3",
          timestamp: "2024-01-15T10:20:00Z",
          action: "Role Assignment",
          resource: "john.doe@company.com",
          status: "success",
          ip: "192.168.1.100",
          userAgent: "Chrome/120.0.0.0",
        },
        {
          id: "4",
          timestamp: "2024-01-15T10:15:00Z",
          action: "Failed Login",
          resource: "IAM Console",
          status: "failure",
          ip: "203.0.113.1",
          userAgent: "Unknown",
        },
        {
          id: "5",
          timestamp: "2024-01-15T10:10:00Z",
          action: "Permission Grant",
          resource: "api-access",
          status: "warning",
          ip: "192.168.1.100",
          userAgent: "Chrome/120.0.0.0",
        },
      ]);

      setSystemAlerts([
        {
          id: "1",
          type: "warning",
          title: "High Login Failure Rate",
          message: "Detected 15 failed login attempts in the last hour",
          timestamp: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
          type: "info",
          title: "Scheduled Maintenance",
          message: "System maintenance scheduled for tonight at 2:00 AM",
          timestamp: "2024-01-15T09:00:00Z",
        },
        {
          id: "3",
          type: "error",
          title: "Service Degradation",
          message: "Authentication service experiencing high latency",
          timestamp: "2024-01-15T08:45:00Z",
        },
      ]);
    } catch (error) {
      console.error("Error fetching console data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickAccessSystems: SystemAccess[] = [
    {
      id: "1",
      name: "User Management",
      description: "Manage users and their access",
      icon: Users,
      status: "online",
      url: "/users",
      lastAccessed: "2 hours ago",
    },
    {
      id: "2",
      name: "Security Center",
      description: "Monitor security events",
      icon: Shield,
      status: "online",
      url: "/audit",
      lastAccessed: "1 hour ago",
    },
    {
      id: "3",
      name: "Database Console",
      description: "Database administration",
      icon: Database,
      status: "online",
      url: "#",
      lastAccessed: "3 days ago",
    },
    {
      id: "4",
      name: "Cloud Services",
      description: "Manage cloud resources",
      icon: Cloud,
      status: "maintenance",
      url: "#",
      lastAccessed: "1 week ago",
    },
    {
      id: "5",
      name: "Monitoring Hub",
      description: "System performance metrics",
      icon: Monitor,
      status: "online",
      url: "#",
      lastAccessed: "5 minutes ago",
    },
    {
      id: "6",
      name: "API Gateway",
      description: "API management and analytics",
      icon: Globe,
      status: "online",
      url: "/access-control",
      lastAccessed: "30 minutes ago",
    },
  ];

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failure":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800";
      case "offline":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSystemClick = (system: SystemAccess) => {
    if (system.status === "online" && system.url !== "#") {
      navigate(system.url);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-blue-100 text-sm">
              Monitor and manage your integrated systems from this central
              console
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-xs">Last login</p>
            <p className="text-white text-sm font-medium">Today at 10:30 AM</p>
          </div>
        </div>
      </div>

      {/* Quick System Access */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Quick System Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickAccessSystems.map((system) => {
            const Icon = system.icon;
            return (
              <Card
                key={system.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSystemClick(system)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {system.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {system.description}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={getSystemStatusColor(system.status)}>
                      {system.status}
                    </Badge>
                    {system.lastAccessed && (
                      <span className="text-xs text-gray-500">
                        Last: {system.lastAccessed}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Account Information */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-bold text-lg">
                  {user
                    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                    : "U"}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {user ? `${user.firstName} ${user.lastName}` : "Unknown User"}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{user?.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Member since Jan 2024
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">San Francisco, CA</span>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Assigned Roles
              </p>
              <div className="flex flex-wrap gap-2">
                {user?.roles.map((role, index) => (
                  <Badge key={index} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Manage Account
            </Button>
          </CardContent>
        </Card>

        {/* Access History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Recent Access History
            </CardTitle>
            <CardDescription>
              Your latest system interactions and security events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accessHistory.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(event.status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {event.action}
                      </p>
                      <p className="text-sm text-gray-500">{event.resource}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {formatTimestamp(event.timestamp)}
                    </p>
                    <p className="text-xs text-gray-500">{event.ip}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View Complete History
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Monitoring & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>
              Real-time system performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center">
                  <Server className="mr-2 h-4 w-4" />
                  Server Performance
                </span>
                <span className="font-medium">98%</span>
              </div>
              <Progress value={98} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  Security Score
                </span>
                <span className="font-medium">94%</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center">
                  <Zap className="mr-2 h-4 w-4" />
                  Response Time
                </span>
                <span className="font-medium">87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center">
                  <Lock className="mr-2 h-4 w-4" />
                  Authentication Rate
                </span>
                <span className="font-medium">99%</span>
              </div>
              <Progress value={99} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              System Alerts
            </CardTitle>
            <CardDescription>
              Important notifications and warnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.type === "error"
                      ? "bg-red-50 border-red-400"
                      : alert.type === "warning"
                        ? "bg-yellow-50 border-yellow-400"
                        : "bg-blue-50 border-blue-400"
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`p-1 rounded-full mr-3 ${
                        alert.type === "error"
                          ? "bg-red-100"
                          : alert.type === "warning"
                            ? "bg-yellow-100"
                            : "bg-blue-100"
                      }`}
                    >
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          alert.type === "error"
                            ? "text-red-600"
                            : alert.type === "warning"
                              ? "text-yellow-600"
                              : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {alert.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTimestamp(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Alerts
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Console;
