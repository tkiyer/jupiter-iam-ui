import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Bell,
  BellRing,
  MessageSquare,
  Eye,
  EyeOff,
  Trash2,
  Info,
  X,
  Check,
  ArrowRight,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

interface AccessEvent {
  id: string;
  timestamp: string;
  action: string;
  resource: string;
  module: string;
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

const getSystemPath = (resource: string): string | null => {
  const r = resource.toLowerCase();
  if (r.includes("iam")) return "/console";
  if (r.includes("policy")) return "/policies";
  if (r.includes("api")) return "/permissions";
  if (r.includes("user") || r.includes("@")) return "/users";
  if (r.includes("access")) return "/access-control";
  return null;
};

const SystemLink: React.FC<{ resource: string }> = ({ resource }) => {
  const path = getSystemPath(resource);
  if (path) {
    return (
      <Link
        to={path}
        className="text-sm text-blue-600 hover:underline truncate"
      >
        {resource}
      </Link>
    );
  }
  return <span className="text-sm text-gray-900 truncate">{resource}</span>;
};

const getModulePath = (module: string): string | null => {
  const m = module.toLowerCase();
  if (m.includes("auth") || m.includes("login")) return "/console";
  if (m.includes("policy")) return "/policies";
  if (m.includes("user")) return "/users";
  if (m.includes("api") || m.includes("permission")) return "/permissions";
  if (m.includes("access")) return "/access-control";
  if (m.includes("audit") || m.includes("security")) return "/audit";
  return null;
};

const ModuleLink: React.FC<{ module: string }> = ({ module }) => {
  const path = getModulePath(module);
  if (path) {
    return (
      <Link
        to={path}
        className="text-sm text-blue-600 hover:underline truncate"
      >
        {module}
      </Link>
    );
  }
  return <span className="text-sm text-gray-900 truncate">{module}</span>;
};

const Console: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const [accessHistory, setAccessHistory] = useState<AccessEvent[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickAccess, setQuickAccess] = useState<SystemAccess[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newIcon, setNewIcon] = useState("Globe");

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
          module: "Authentication",
          status: "success",
          ip: "192.168.1.100",
          userAgent: "Chrome/120.0.0.0",
        },
        {
          id: "2",
          timestamp: "2024-01-15T10:25:00Z",
          action: "Policy Update",
          resource: "user-access-policy",
          module: "Policies",
          status: "success",
          ip: "192.168.1.100",
          userAgent: "Chrome/120.0.0.0",
        },
        {
          id: "3",
          timestamp: "2024-01-15T10:20:00Z",
          action: "Role Assignment",
          resource: "john.doe@company.com",
          module: "Users",
          status: "success",
          ip: "192.168.1.100",
          userAgent: "Chrome/120.0.0.0",
        },
        {
          id: "4",
          timestamp: "2024-01-15T10:15:00Z",
          action: "Failed Login",
          resource: "IAM Console",
          module: "Authentication",
          status: "failure",
          ip: "203.0.113.1",
          userAgent: "Unknown",
        },
        {
          id: "5",
          timestamp: "2024-01-15T10:10:00Z",
          action: "Permission Grant",
          resource: "api-access",
          module: "API",
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

  useEffect(() => {
    setQuickAccess(quickAccessSystems);
  }, []);

  const iconMap = useMemo(
    () => ({
      Users,
      Shield,
      Database,
      Cloud,
      Monitor,
      Globe,
    }),
    [],
  );

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {quickAccess.map((system) => {
            const Icon = system.icon;
            return (
              <Card
                key={system.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSystemClick(system)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-2 bg-blue-50 rounded-md">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {system.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {system.description}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge
                      className={`${getSystemStatusColor(system.status)} text-xs px-2 py-0.5`}
                    >
                      {system.status}
                    </Badge>
                    {system.lastAccessed && (
                      <span className="text-[11px] text-gray-500">
                        Last: {system.lastAccessed}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 flex items-center justify-center min-h-[88px]"
                onClick={() => setAddOpen(true)}
              >
                <CardContent className="p-4 w-full h-full flex flex-col items-center justify-center text-gray-600">
                  <Plus className="h-6 w-6 mb-1" />
                  <span className="text-sm font-medium">Add Shortcut</span>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add System Shortcut</DialogTitle>
                <DialogDescription>
                  Quickly add a system to your console shortcuts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="name" className="col-span-1">
                    Name
                  </Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="desc" className="col-span-1">
                    Description
                  </Label>
                  <Input
                    id="desc"
                    className="col-span-3"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="url" className="col-span-1">
                    URL
                  </Label>
                  <Input
                    id="url"
                    className="col-span-3"
                    placeholder="/path-or-https://..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label className="col-span-1">Icon</Label>
                  <div className="col-span-3">
                    <Select value={newIcon} onValueChange={setNewIcon}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Users">Users</SelectItem>
                        <SelectItem value="Shield">Shield</SelectItem>
                        <SelectItem value="Database">Database</SelectItem>
                        <SelectItem value="Cloud">Cloud</SelectItem>
                        <SelectItem value="Monitor">Monitor</SelectItem>
                        <SelectItem value="Globe">Globe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    if (!newName.trim() || !newUrl.trim()) return;
                    const IconComp =
                      iconMap[newIcon as keyof typeof iconMap] || Globe;
                    const item: SystemAccess = {
                      id: String(Date.now()),
                      name: newName.trim(),
                      description: newDesc.trim(),
                      icon: IconComp,
                      status: "online",
                      url: newUrl.trim(),
                      lastAccessed: "just now",
                    };
                    setQuickAccess((prev) => [...prev, item]);
                    setAddOpen(false);
                    setNewName("");
                    setNewDesc("");
                    setNewUrl("");
                    setNewIcon("Globe");
                  }}
                >
                  Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            <div className="space-y-2">
              {accessHistory.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="grid justify-items-start items-start gap-2 p-2.5 grid-cols-1 sm:grid-cols-[auto_12rem_minmax(0,1fr)_10rem_10rem_8rem]">
                    <div className="flex items-start justify-start text-gray-500 self-start">
                      {getStatusIcon(event.status)}
                    </div>
                    <ModuleLink module={event.module} />
                    <SystemLink resource={event.resource} />
                    <div className="text-[13px] text-gray-700 truncate leading-tight self-start">
                      {event.action}
                    </div>
                    <div className="text-xs text-gray-900 whitespace-nowrap leading-tight self-start">
                      {formatTimestamp(event.timestamp)}
                    </div>
                    <div className="text-[11px] text-gray-500 whitespace-nowrap leading-tight self-start">
                      {event.ip}
                    </div>
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
        {/* Notification Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <MessageSquare className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Notification Messages</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Latest system notifications and important alerts</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    {unreadCount} new
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-xs hover:bg-blue-50"
                >
                  <Check className="mr-1 h-3 w-3" />
                  Mark all read
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notificationsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 5).map((notification, index) => {
                  const getNotificationIcon = () => {
                    switch (notification.type) {
                      case "error":
                        return <AlertTriangle className="h-4 w-4 text-red-500" />;
                      case "warning":
                        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
                      case "success":
                        return <CheckCircle className="h-4 w-4 text-green-500" />;
                      case "security":
                        return <Shield className="h-4 w-4 text-purple-500" />;
                      default:
                        return <Info className="h-4 w-4 text-blue-500" />;
                    }
                  };

                  const getNotificationBorder = () => {
                    if (!notification.isRead) {
                      switch (notification.type) {
                        case "error":
                          return "border-l-red-400 bg-red-50/30";
                        case "warning":
                          return "border-l-yellow-400 bg-yellow-50/30";
                        case "success":
                          return "border-l-green-400 bg-green-50/30";
                        case "security":
                          return "border-l-purple-400 bg-purple-50/30";
                        default:
                          return "border-l-blue-400 bg-blue-50/30";
                      }
                    }
                    return "border-l-gray-300 bg-white";
                  };

                  // Generate action links
                  const getActionLinks = (notification: any) => {
                    const links = [];

                    if (notification.type === "error" || notification.type === "warning") {
                      links.push({
                        text: "View Details",
                        action: () => navigate("/audit"),
                        color: "text-blue-600 hover:text-blue-800"
                      });
                    }

                    if (notification.type === "security") {
                      links.push({
                        text: "Resolve",
                        action: () => navigate("/policies"),
                        color: "text-purple-600 hover:text-purple-800"
                      });
                    }

                    if (notification.actionUrl && notification.actionText) {
                      links.push({
                        text: notification.actionText,
                        action: () => navigate(notification.actionUrl!),
                        color: "text-green-600 hover:text-green-800"
                      });
                    }

                    return links;
                  };

                  const actionLinks = getActionLinks(notification);

                  return (
                    <div
                      key={notification.id}
                      className={`border-l-3 hover:bg-gray-50/80 transition-all duration-150 ${getNotificationBorder()}`}
                    >
                      <div className="flex items-center justify-between py-4 px-4">
                        {/* Left side - Icon and content */}
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {getNotificationIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className={`text-sm font-medium truncate ${
                                !notification.isRead ? "text-gray-900" : "text-gray-600"
                              }`}>
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 animate-pulse"></div>
                              )}
                            </div>
                            <p className={`text-xs mt-1 truncate ${
                              !notification.isRead ? "text-gray-700" : "text-gray-500"
                            }`}>
                              {notification.message}
                            </p>
                          </div>
                        </div>

                        {/* Middle - Time and actions */}
                        <div className="flex items-center space-x-4 flex-shrink-0">
                          {/* Action links */}
                          {actionLinks.length > 0 && (
                            <div className="hidden sm:flex items-center space-x-3">
                              {actionLinks.map((link, index) => (
                                <button
                                  key={index}
                                  onClick={link.action}
                                  className={`text-xs font-medium underline-offset-2 hover:underline transition-colors ${link.color}`}
                                >
                                  {link.text}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Time */}
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(notification.createdAt).toLocaleDateString('zh-CN', {
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {/* Right side - Quick actions */}
                        <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 hover:bg-green-100 rounded-md transition-colors"
                              title="Mark as read"
                            >
                              <Check className="h-3.5 w-3.5 text-green-600" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1.5 hover:bg-red-100 rounded-md transition-colors"
                            title="Delete notification"
                          >
                            <X className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <BellRing className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  No notifications
                </h3>
                <p className="text-xs text-gray-500">
                  New system messages will appear here
                </p>
              </div>
            )}

            {/* View All Messages Button */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate("/notifications")}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View All Messages
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
                {notifications.length > 0 && (
                  <span className="text-xs text-gray-500">
                    Showing latest {Math.min(5, notifications.length)} of {notifications.length} messages
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <AlertTriangle className="h-5 w-5 text-orange-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Important system status notifications</p>
                </div>
              </div>
              {systemAlerts.length > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {systemAlerts.length} alerts
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {systemAlerts.length > 0 ? (
              <>
                <div className="space-y-3">
                  {systemAlerts.map((alert, index) => {
                    const getAlertStyles = () => {
                      switch (alert.type) {
                        case "error":
                          return {
                            bg: "bg-red-50 hover:bg-red-100/50",
                            icon: "text-red-500",
                            dot: "bg-red-500"
                          };
                        case "warning":
                          return {
                            bg: "bg-yellow-50 hover:bg-yellow-100/50",
                            icon: "text-yellow-500",
                            dot: "bg-yellow-500"
                          };
                        default:
                          return {
                            bg: "bg-blue-50 hover:bg-blue-100/50",
                            icon: "text-blue-500",
                            dot: "bg-blue-500"
                          };
                      }
                    };

                    const styles = getAlertStyles();

                    return (
                      <div
                        key={alert.id}
                        className={`relative rounded-lg border transition-all duration-200 ${styles.bg}`}
                      >
                        <div className="flex items-start p-4">
                          {/* Status dot */}
                          <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${styles.dot} animate-pulse`}></div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 mb-1">
                                  {alert.title}
                                </h4>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                  {alert.message}
                                </p>
                              </div>

                              {/* Priority indicator */}
                              {alert.type === "error" && (
                                <div className="ml-2 px-2 py-1 bg-red-100 rounded-full">
                                  <span className="text-xs font-medium text-red-700">High</span>
                                </div>
                              )}
                              {alert.type === "warning" && (
                                <div className="ml-2 px-2 py-1 bg-yellow-100 rounded-full">
                                  <span className="text-xs font-medium text-yellow-700">Medium</span>
                                </div>
                              )}
                            </div>

                            {/* Footer with time and actions */}
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/50">
                              <span className="text-xs text-gray-400">
                                {new Date(alert.timestamp).toLocaleDateString('zh-CN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>

                              <div className="flex items-center space-x-2">
                                {alert.type === "error" && (
                                  <button
                                    className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline"
                                    onClick={() => navigate("/audit")}
                                  >
                                    Handle Now
                                  </button>
                                )}
                                {alert.type === "warning" && (
                                  <button
                                    className="text-xs text-yellow-600 hover:text-yellow-800 font-medium hover:underline"
                                    onClick={() => navigate("/policies")}
                                  >
                                    View Details
                                  </button>
                                )}
                                <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer actions */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigate("/alerts")}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      View All Alerts
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                    <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                      Mark All Read
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  System Running Normally
                </h3>
                <p className="text-xs text-gray-500">
                  No system alerts or anomalies detected
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Console;
