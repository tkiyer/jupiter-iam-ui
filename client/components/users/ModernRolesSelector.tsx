import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  X,
  Shield,
  Crown,
  Users as UsersIcon,
  Building,
  Code,
  TrendingUp,
  Target,
  Settings,
  UserCheck,
  Eye,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Star,
  Filter,
  RotateCcw,
  Copy,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Role {
  id: string;
  name: string;
  description: string;
  category: string;
  level: "basic" | "intermediate" | "advanced" | "expert";
  permissions: string[];
  isTemplate?: boolean;
  conflicts?: string[];
  requires?: string[];
  icon?: React.ComponentType<any>;
  color?: string;
}

interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  roles: string[];
  icon: React.ComponentType<any>;
  color: string;
  useCase: string;
}

interface ModernRolesSelectorProps {
  selectedRoles: string[];
  onRolesChange: (roles: string[]) => void;
  variant?: "create" | "edit";
}

export const ModernRolesSelector: React.FC<ModernRolesSelectorProps> = ({
  selectedRoles,
  onRolesChange,
  variant = "create",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [showPermissions, setShowPermissions] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [showConflicts, setShowConflicts] = useState(true);

  // Modern role templates for quick assignment
  const roleTemplates: RoleTemplate[] = [
    {
      id: "developer",
      name: "Software Developer",
      description: "Full development access with code management",
      roles: ["developer", "code_reviewer", "git_access", "testing"],
      icon: Code,
      color: "from-blue-400 to-blue-600",
      useCase: "For developers who write and review code",
    },
    {
      id: "manager",
      name: "Team Manager",
      description: "Team leadership with reporting access",
      roles: ["manager", "team_lead", "reports_viewer", "user_management"],
      icon: UsersIcon,
      color: "from-purple-400 to-purple-600",
      useCase: "For team leads and middle management",
    },
    {
      id: "admin",
      name: "System Administrator",
      description: "Full system access and configuration",
      roles: ["admin", "system_config", "user_management", "audit_access"],
      icon: Shield,
      color: "from-red-400 to-red-600",
      useCase: "For system administrators and IT staff",
    },
    {
      id: "sales",
      name: "Sales Professional",
      description: "Sales tools and customer management",
      roles: ["sales_user", "crm_access", "customer_data", "reports_viewer"],
      icon: TrendingUp,
      color: "from-green-400 to-green-600",
      useCase: "For sales team members and account managers",
    },
    {
      id: "marketing",
      name: "Marketing Specialist",
      description: "Marketing tools and campaign management",
      roles: [
        "marketing_user",
        "campaign_manager",
        "analytics_viewer",
        "content_creator",
      ],
      icon: Target,
      color: "from-orange-400 to-orange-600",
      useCase: "For marketing team and content creators",
    },
    {
      id: "executive",
      name: "Executive",
      description: "High-level access with strategic oversight",
      roles: ["executive", "all_reports", "strategic_data", "admin_viewer"],
      icon: Crown,
      color: "from-yellow-400 to-yellow-600",
      useCase: "For C-level executives and senior leadership",
    },
  ];

  // Modern roles with enhanced metadata
  const allRoles: Role[] = [
    // Developer roles
    {
      id: "developer",
      name: "Developer",
      description: "Write and maintain code",
      category: "engineering",
      level: "intermediate",
      permissions: ["code.read", "code.write", "deploy.staging"],
      icon: Code,
      color: "blue",
    },
    {
      id: "senior_developer",
      name: "Senior Developer",
      description: "Advanced development with mentoring",
      category: "engineering",
      level: "advanced",
      permissions: [
        "code.read",
        "code.write",
        "code.review",
        "deploy.staging",
        "mentor.others",
      ],
      requires: ["developer"],
      icon: Code,
      color: "blue",
    },
    {
      id: "code_reviewer",
      name: "Code Reviewer",
      description: "Review and approve code changes",
      category: "engineering",
      level: "intermediate",
      permissions: ["code.read", "code.review", "pr.approve"],
      icon: Eye,
      color: "indigo",
    },
    {
      id: "devops",
      name: "DevOps Engineer",
      description: "Infrastructure and deployment management",
      category: "engineering",
      level: "advanced",
      permissions: [
        "infra.manage",
        "deploy.production",
        "monitoring.access",
        "secrets.manage",
      ],
      icon: Settings,
      color: "gray",
    },

    // Management roles
    {
      id: "manager",
      name: "Manager",
      description: "Team and project management",
      category: "management",
      level: "advanced",
      permissions: [
        "team.manage",
        "reports.view",
        "budget.view",
        "performance.review",
      ],
      icon: UsersIcon,
      color: "purple",
    },
    {
      id: "team_lead",
      name: "Team Lead",
      description: "Direct team leadership",
      category: "management",
      level: "intermediate",
      permissions: ["team.lead", "assign.tasks", "review.performance"],
      conflicts: ["individual_contributor"],
      icon: UserCheck,
      color: "purple",
    },
    {
      id: "executive",
      name: "Executive",
      description: "High-level strategic decisions",
      category: "management",
      level: "expert",
      permissions: [
        "all.view",
        "strategic.decisions",
        "budget.approve",
        "hire.approve",
      ],
      requires: ["manager"],
      icon: Crown,
      color: "yellow",
    },

    // Administrative roles
    {
      id: "admin",
      name: "Administrator",
      description: "Full system administration",
      category: "admin",
      level: "expert",
      permissions: [
        "system.admin",
        "user.manage",
        "security.config",
        "audit.access",
      ],
      conflicts: ["limited_user"],
      icon: Shield,
      color: "red",
    },
    {
      id: "user_management",
      name: "User Manager",
      description: "Manage users and permissions",
      category: "admin",
      level: "advanced",
      permissions: [
        "user.create",
        "user.edit",
        "roles.assign",
        "groups.manage",
      ],
      icon: Users,
      color: "red",
    },
    {
      id: "audit_access",
      name: "Auditor",
      description: "Access audit logs and compliance data",
      category: "admin",
      level: "intermediate",
      permissions: ["audit.read", "compliance.view", "logs.access"],
      icon: Eye,
      color: "gray",
    },

    // Business roles
    {
      id: "sales_user",
      name: "Sales User",
      description: "Access sales tools and customer data",
      category: "sales",
      level: "basic",
      permissions: [
        "crm.access",
        "customers.view",
        "quotes.create",
        "sales.reports",
      ],
      icon: TrendingUp,
      color: "green",
    },
    {
      id: "sales_manager",
      name: "Sales Manager",
      description: "Manage sales team and territories",
      category: "sales",
      level: "advanced",
      permissions: [
        "sales.manage",
        "team.sales",
        "territories.assign",
        "forecasting.access",
      ],
      requires: ["sales_user"],
      icon: TrendingUp,
      color: "green",
    },
    {
      id: "marketing_user",
      name: "Marketing User",
      description: "Create and manage marketing campaigns",
      category: "marketing",
      level: "basic",
      permissions: [
        "campaigns.create",
        "content.manage",
        "analytics.view",
        "social.post",
      ],
      icon: Target,
      color: "orange",
    },
    {
      id: "content_creator",
      name: "Content Creator",
      description: "Create and publish content",
      category: "marketing",
      level: "basic",
      permissions: [
        "content.create",
        "content.publish",
        "media.upload",
        "seo.tools",
      ],
      icon: Target,
      color: "orange",
    },

    // Support roles
    {
      id: "support_agent",
      name: "Support Agent",
      description: "Customer support and ticket management",
      category: "support",
      level: "basic",
      permissions: [
        "tickets.manage",
        "customers.contact",
        "knowledge.access",
        "chat.respond",
      ],
      icon: UserCheck,
      color: "teal",
    },
    {
      id: "support_manager",
      name: "Support Manager",
      description: "Manage support team and escalations",
      category: "support",
      level: "advanced",
      permissions: [
        "support.manage",
        "escalations.handle",
        "team.support",
        "sla.monitor",
      ],
      requires: ["support_agent"],
      icon: UserCheck,
      color: "teal",
    },

    // Limited access roles
    {
      id: "readonly",
      name: "Read-Only User",
      description: "View-only access to assigned resources",
      category: "limited",
      level: "basic",
      permissions: ["read.assigned", "reports.view"],
      conflicts: ["admin", "user_management"],
      icon: Eye,
      color: "gray",
    },
    {
      id: "guest",
      name: "Guest User",
      description: "Temporary limited access",
      category: "limited",
      level: "basic",
      permissions: ["guest.access", "public.view"],
      conflicts: ["admin", "user_management", "sensitive.data"],
      icon: Eye,
      color: "gray",
    },
  ];

  const categories = [
    { id: "all", name: "All Categories", count: allRoles.length },
    {
      id: "engineering",
      name: "Engineering",
      count: allRoles.filter((r) => r.category === "engineering").length,
    },
    {
      id: "management",
      name: "Management",
      count: allRoles.filter((r) => r.category === "management").length,
    },
    {
      id: "admin",
      name: "Administration",
      count: allRoles.filter((r) => r.category === "admin").length,
    },
    {
      id: "sales",
      name: "Sales",
      count: allRoles.filter((r) => r.category === "sales").length,
    },
    {
      id: "marketing",
      name: "Marketing",
      count: allRoles.filter((r) => r.category === "marketing").length,
    },
    {
      id: "support",
      name: "Support",
      count: allRoles.filter((r) => r.category === "support").length,
    },
    {
      id: "limited",
      name: "Limited Access",
      count: allRoles.filter((r) => r.category === "limited").length,
    },
  ];

  const levels = [
    { id: "all", name: "All Levels" },
    { id: "basic", name: "Basic" },
    { id: "intermediate", name: "Intermediate" },
    { id: "advanced", name: "Advanced" },
    { id: "expert", name: "Expert" },
  ];

  // Filter roles
  const filteredRoles = useMemo(() => {
    return allRoles.filter((role) => {
      const matchesSearch =
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || role.category === selectedCategory;
      const matchesLevel =
        selectedLevel === "all" || role.level === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [searchTerm, selectedCategory, selectedLevel]);

  // Detect conflicts and missing requirements
  const roleAnalysis = useMemo(() => {
    const conflicts: string[] = [];
    const missingRequirements: string[] = [];
    const suggestions: string[] = [];

    selectedRoles.forEach((roleId) => {
      const role = allRoles.find((r) => r.id === roleId);
      if (!role) return;

      // Check conflicts
      if (role.conflicts) {
        role.conflicts.forEach((conflictId) => {
          if (selectedRoles.includes(conflictId)) {
            conflicts.push(
              `${role.name} conflicts with ${allRoles.find((r) => r.id === conflictId)?.name}`,
            );
          }
        });
      }

      // Check requirements
      if (role.requires) {
        role.requires.forEach((requireId) => {
          if (!selectedRoles.includes(requireId)) {
            const requiredRole = allRoles.find((r) => r.id === requireId);
            missingRequirements.push(
              `${role.name} requires ${requiredRole?.name}`,
            );
            if (requiredRole && !suggestions.includes(requireId)) {
              suggestions.push(requireId);
            }
          }
        });
      }
    });

    return { conflicts, missingRequirements, suggestions };
  }, [selectedRoles]);

  const handleRoleToggle = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      onRolesChange(selectedRoles.filter((id) => id !== roleId));
    } else {
      onRolesChange([...selectedRoles, roleId]);
    }
  };

  const handleTemplateApply = (template: RoleTemplate) => {
    const newRoles = [...new Set([...selectedRoles, ...template.roles])];
    onRolesChange(newRoles);
    setActiveTemplate(template.id);
    setTimeout(() => setActiveTemplate(null), 2000);
  };

  const handleAddSuggestions = () => {
    const newRoles = [
      ...new Set([...selectedRoles, ...roleAnalysis.suggestions]),
    ];
    onRolesChange(newRoles);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "basic":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-purple-100 text-purple-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Roles & Access Management
          </h3>
          <p className="text-sm text-gray-500">
            Assign roles and permissions for this user
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm font-medium">
            {selectedRoles.length} roles selected
          </Badge>
          {roleAnalysis.conflicts.length > 0 && (
            <Badge variant="destructive" className="text-sm">
              {roleAnalysis.conflicts.length} conflicts
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="flex items-center">
            <Sparkles className="mr-2 h-4 w-4" />
            Quick Templates
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Individual Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Permissions Preview
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                Role Templates
              </CardTitle>
              <p className="text-sm text-gray-600">
                Choose a pre-configured role template that matches the user's
                responsibilities
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleTemplates.map((template) => {
                  const IconComponent = template.icon;
                  const isActive = activeTemplate === template.id;

                  return (
                    <Card
                      key={template.id}
                      className={cn(
                        "relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md",
                        isActive && "ring-2 ring-blue-500 scale-105",
                      )}
                      onClick={() => handleTemplateApply(template)}
                    >
                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-br opacity-10",
                          template.color,
                        )}
                      />
                      <CardContent className="relative p-4">
                        <div className="flex items-start space-x-3">
                          <div
                            className={cn(
                              "p-2 rounded-lg bg-gradient-to-br",
                              template.color,
                            )}
                          >
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {template.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {template.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {template.useCase}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-3">
                              {template.roles.slice(0, 3).map((roleId) => {
                                const role = allRoles.find(
                                  (r) => r.id === roleId,
                                );
                                return role ? (
                                  <Badge
                                    key={roleId}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {role.name}
                                  </Badge>
                                ) : null;
                              })}
                              {template.roles.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{template.roles.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Roles Tab */}
        <TabsContent value="individual" className="space-y-4">
          {/* Enhanced Filters Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Filter className="mr-2 h-4 w-4" />
                Filter Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Search */}
              <div>
                <Label htmlFor="search-roles" className="text-sm font-medium">
                  Search Roles
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search-roles"
                    placeholder="Search roles by name or description..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Category and Level Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Dropdown */}
                <div>
                  <Label htmlFor="category-select" className="text-sm font-medium">
                    Category
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-full mt-1" id="category-select">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{category.name}</span>
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {category.count}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Level Dropdown */}
                <div>
                  <Label htmlFor="level-select" className="text-sm font-medium">
                    Access Level
                  </Label>
                  <Select
                    value={selectedLevel}
                    onValueChange={setSelectedLevel}
                  >
                    <SelectTrigger className="w-full mt-1" id="level-select">
                      <SelectValue placeholder="Select level..." />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters & Results */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  {selectedCategory !== "all" && (
                    <Badge variant="outline" className="text-xs">
                      Category: {categories.find(c => c.id === selectedCategory)?.name}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => setSelectedCategory("all")}
                      />
                    </Badge>
                  )}
                  {selectedLevel !== "all" && (
                    <Badge variant="outline" className="text-xs">
                      Level: {levels.find(l => l.id === selectedLevel)?.name}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => setSelectedLevel("all")}
                      />
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="outline" className="text-xs">
                      Search: "{searchTerm}"
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => setSearchTerm("")}
                      />
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {filteredRoles.length} role{filteredRoles.length !== 1 ? 's' : ''} found
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setSelectedLevel("all");
                    }}
                    disabled={searchTerm === "" && selectedCategory === "all" && selectedLevel === "all"}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredRoles.map((role) => {
              const isSelected = selectedRoles.includes(role.id);
              const IconComponent = role.icon || Shield;

              return (
                <Card
                  key={role.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    isSelected && "ring-2 ring-blue-500 bg-blue-50",
                  )}
                  onClick={() => handleRoleToggle(role.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          isSelected ? "bg-blue-100" : "bg-gray-100",
                        )}
                      >
                        <IconComponent
                          className={cn(
                            "h-4 w-4",
                            isSelected ? "text-blue-600" : "text-gray-600",
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">
                            {role.name}
                          </h4>
                          {isSelected && (
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {role.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge
                            className={cn("text-xs", getLevelColor(role.level))}
                          >
                            {role.level}
                          </Badge>
                          <span className="text-xs text-gray-500 capitalize">
                            {role.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredRoles.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No roles found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Permissions Preview Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Permissions Summary
              </CardTitle>
              <p className="text-sm text-gray-600">
                Review all permissions granted by the selected roles
              </p>
            </CardHeader>
            <CardContent>
              {selectedRoles.length === 0 ? (
                <div className="text-center py-8">
                  <Lock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No roles selected
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select roles to preview their permissions
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* All permissions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Granted Permissions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        ...new Set(
                          selectedRoles
                            .map((roleId) =>
                              allRoles.find((r) => r.id === roleId),
                            )
                            .filter(Boolean)
                            .flatMap((role) => role!.permissions),
                        ),
                      ].map((permission) => (
                        <Badge
                          key={permission}
                          variant="outline"
                          className="text-xs"
                        >
                          <Unlock className="mr-1 h-3 w-3" />
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Selected roles breakdown */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Selected Roles
                    </h4>
                    <div className="space-y-2">
                      {selectedRoles.map((roleId) => {
                        const role = allRoles.find((r) => r.id === roleId);
                        return role ? (
                          <div
                            key={roleId}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <Badge className={getLevelColor(role.level)}>
                                {role.level}
                              </Badge>
                              <span className="font-medium">{role.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRoleToggle(roleId)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Conflicts and Requirements Alert */}
      {showConflicts &&
        (roleAnalysis.conflicts.length > 0 ||
          roleAnalysis.missingRequirements.length > 0) && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800">
                    Role Configuration Issues
                  </h4>

                  {roleAnalysis.conflicts.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-yellow-700 font-medium">
                        Conflicts:
                      </p>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        {roleAnalysis.conflicts.map((conflict, index) => (
                          <li key={index}>• {conflict}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {roleAnalysis.missingRequirements.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-yellow-700 font-medium">
                        Missing Requirements:
                      </p>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        {roleAnalysis.missingRequirements.map(
                          (requirement, index) => (
                            <li key={index}>• {requirement}</li>
                          ),
                        )}
                      </ul>
                      {roleAnalysis.suggestions.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddSuggestions}
                          className="mt-2 bg-white"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Required Roles
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConflicts(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRolesChange([])}
            disabled={selectedRoles.length === 0}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          {selectedRoles.length} role{selectedRoles.length !== 1 ? "s" : ""}{" "}
          selected
        </div>
      </div>
    </div>
  );
};
