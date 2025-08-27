import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PermissionSelector from "@/components/role-management/PermissionSelector";
import {
  Role,
  CreateRoleRequest,
  RoleTemplate,
  RoleConflict,
  RoleAnalytics,
  Permission,
} from "@shared/iam";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  MoreHorizontal,
  Shield,
  Clock,
  Users,
  AlertTriangle,
  TrendingUp,
  Eye,
  Copy,
  GitBranch,
  Calendar,
  CheckCircle,
  XCircle,
  Zap,
  BarChart3,
  Settings,
  Crown,
  Layers,
  User,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PaginationControl,
  usePagination,
} from "@/components/ui/pagination-control";

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([]);
  const [conflicts, setConflicts] = useState<RoleConflict[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, RoleAnalytics>>({});
  const [availablePermissions, setAvailablePermissions] = useState<
    Permission[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Helper function for status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 text-white";
      case "inactive":
        return "bg-gray-500 text-white";
      case "deprecated":
        return "bg-yellow-500 text-white";
      case "draft":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };
  const [activeTab, setActiveTab] = useState("roles");

  // Template management state
  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] =
    useState(false);
  const [isEditTemplateDialogOpen, setIsEditTemplateDialogOpen] =
    useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RoleTemplate | null>(
    null,
  );
  const [templateSearchTerm, setTemplateSearchTerm] = useState("");
  const [templateCategoryFilter, setTemplateCategoryFilter] =
    useState<string>("all");
  const [filteredTemplates, setFilteredTemplates] = useState<RoleTemplate[]>(
    [],
  );

  // Pagination state
  const {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredRoles.length, 10);

  // Paginated roles for display
  const paginatedRoles = filteredRoles.slice(startIndex, endIndex);

  useEffect(() => {
    fetchRoles();
    fetchRoleTemplates();
    fetchConflicts();
    fetchPermissions();
  }, []);

  // Initialize filtered templates when roleTemplates is loaded
  useEffect(() => {
    setFilteredTemplates(roleTemplates);
  }, [roleTemplates]);

  useEffect(() => {
    filterRoles();
  }, [roles, searchTerm, statusFilter, levelFilter]);

  useEffect(() => {
    filterTemplates();
  }, [roleTemplates, templateSearchTerm, templateCategoryFilter]);

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      const data = await response.json();
      setRoles(data.roles || data);

      // Fetch analytics for each role
      if (data.roles) {
        const analyticsPromises = data.roles.map((role: Role) =>
          fetch(`/api/roles/${role.id}/analytics`).then((r) => r.json()),
        );
        const analyticsResults = await Promise.all(analyticsPromises);
        const analyticsMap = data.roles.reduce(
          (acc: Record<string, RoleAnalytics>, role: Role, index: number) => {
            acc[role.id] = analyticsResults[index];
            return acc;
          },
          {},
        );
        setAnalytics(analyticsMap);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoleTemplates = async () => {
    try {
      const response = await fetch("/api/roles/templates");
      const data = await response.json();
      setRoleTemplates(data);
    } catch (error) {
      console.error("Error fetching role templates:", error);
    }
  };

  const fetchConflicts = async () => {
    try {
      const response = await fetch("/api/roles/conflicts");
      const data = await response.json();
      setConflicts(data);
    } catch (error) {
      console.error("Error fetching conflicts:", error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch("/api/permissions");
      const data = await response.json();
      setAvailablePermissions(data.permissions || data || []);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setAvailablePermissions([]);
    }
  };

  const filterRoles = () => {
    let filtered = roles;

    if (searchTerm) {
      filtered = filtered.filter(
        (role) =>
          role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          role.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((role) => role.status === statusFilter);
    }

    if (levelFilter !== "all") {
      filtered = filtered.filter(
        (role) => role.level.toString() === levelFilter,
      );
    }

    setFilteredRoles(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "inactive":
        return <XCircle className="h-3 w-3" />;
      case "deprecated":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getLevelIcon = (level: number) => {
    if (level >= 4) return <Crown className="h-4 w-4 text-purple-600" />;
    if (level >= 3) return <Shield className="h-4 w-4 text-blue-600" />;
    if (level >= 2) return <Users className="h-4 w-4 text-green-600" />;
    return <User className="h-4 w-4 text-gray-600" />;
  };

  const getConflictSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleCreateRole = async (roleData: CreateRoleRequest) => {
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleData),
      });

      if (response.ok) {
        const newRole = await response.json();
        setRoles((prev) => [...prev, newRole]);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating role:", error);
    }
  };

  const filterTemplates = () => {
    let filtered = roleTemplates;

    if (templateSearchTerm) {
      filtered = filtered.filter(
        (template) =>
          template.name
            .toLowerCase()
            .includes(templateSearchTerm.toLowerCase()) ||
          template.description
            .toLowerCase()
            .includes(templateSearchTerm.toLowerCase()) ||
          template.category
            .toLowerCase()
            .includes(templateSearchTerm.toLowerCase()),
      );
    }

    if (templateCategoryFilter !== "all") {
      filtered = filtered.filter(
        (template) => template.category === templateCategoryFilter,
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateFromTemplate = async (template: RoleTemplate) => {
    const roleData: CreateRoleRequest = {
      name: `${template.name} Copy`,
      description: template.description,
      permissions: template.permissions,
      organizationUnit: template.organizationUnit,
      isTemplate: false,
    };
    await handleCreateRole(roleData);
  };

  // Template management handlers
  const handleCreateTemplate = async (templateData: any) => {
    try {
      const response = await fetch("/api/role-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        const newTemplate = await response.json();
        setRoleTemplates((prev) => [...prev, newTemplate]);
        setIsCreateTemplateDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  const handleUpdateTemplate = async (templateData: any) => {
    try {
      const response = await fetch(`/api/role-templates/${templateData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        const updatedTemplate = await response.json();
        setRoleTemplates((prev) =>
          prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t)),
        );
        setIsEditTemplateDialogOpen(false);
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`/api/role-templates/${templateId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRoleTemplates((prev) => prev.filter((t) => t.id !== templateId));
      }
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleDuplicateTemplate = async (template: RoleTemplate) => {
    const duplicateData = {
      ...template,
      name: `${template.name} Copy`,
      id: undefined, // Let server generate new ID
    };
    await handleCreateTemplate(duplicateData);
  };

  const handleCreateRoleFromTemplate = async (template: RoleTemplate) => {
    // Open the create role dialog with template data pre-filled
    setIsCreateDialogOpen(true);
    // You can extend this to pre-fill the dialog with template data
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-1">
            Manage RBAC roles, permissions, and hierarchies
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </DialogTrigger>
            <CreateRoleDialog
              onCreateRole={handleCreateRole}
              availablePermissions={availablePermissions}
              parentRoles={roles.filter((r) => r.status === "active")}
            />
          </Dialog>
        </div>
      </div>

      {/* Conflicts Alert */}
      {conflicts.filter((c) => !c.resolved && c.severity === "critical")
        .length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {
              conflicts.filter((c) => !c.resolved && c.severity === "critical")
                .length
            }{" "}
            critical role conflicts detected.
            <Button
              variant="link"
              className="p-0 ml-1 text-red-800"
              onClick={() => setActiveTab("conflicts")}
            >
              Review conflicts
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search roles by name or description..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="1">Level 1</SelectItem>
                      <SelectItem value="2">Level 2</SelectItem>
                      <SelectItem value="3">Level 3</SelectItem>
                      <SelectItem value="4">Level 4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roles Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Roles ({filteredRoles.length})</span>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getLevelIcon(role.level)}
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              <span>{role.name}</span>
                              {role.isSystemRole && (
                                <Badge variant="secondary" className="text-xs">
                                  System
                                </Badge>
                              )}
                              {role.isTemplate && (
                                <Badge variant="outline" className="text-xs">
                                  Template
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {role.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "flex items-center gap-1 w-fit",
                            getStatusColor(role.status),
                          )}
                        >
                          {getStatusIcon(role.status)}
                          {role.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          Level {role.level}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {analytics[role.id]?.userCount || role.userCount || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm">
                            {role.permissions.length}
                          </span>
                          {role.inheritedPermissions &&
                            role.inheritedPermissions.length > 0 && (
                              <span className="text-xs text-gray-500">
                                (+{role.inheritedPermissions.length} inherited)
                              </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {role.lastUsed
                            ? new Date(role.lastUsed).toLocaleDateString()
                            : "Never"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRole(role);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Control */}
              <div className="mt-4">
                <PaginationControl
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredRoles.length}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hierarchy Tab */}
        <TabsContent value="hierarchy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitBranch className="mr-2 h-5 w-5" />
                Role Hierarchy
              </CardTitle>
              <CardDescription>
                Visual representation of role inheritance and hierarchy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleHierarchyView roles={roles} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          {/* Template Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search templates by name, description, or category..."
                      className="pl-10"
                      value={templateSearchTerm}
                      onChange={(e) => setTemplateSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={templateCategoryFilter}
                    onValueChange={setTemplateCategoryFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Array.from(
                        new Set(roleTemplates.map((t) => t.category)),
                      ).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateTemplateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Layers className="mr-2 h-5 w-5" />
                  Role Templates ({filteredTemplates.length})
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export Templates
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Templates
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No templates found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {templateSearchTerm || templateCategoryFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Create your first role template to get started"}
                  </p>
                  <Button onClick={() => setIsCreateTemplateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className="hover:shadow-md transition-shadow group"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {template.name}
                              {template.isBuiltIn && (
                                <Badge variant="outline" className="text-xs">
                                  Built-in
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {template.description}
                            </CardDescription>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Select>
                              <SelectTrigger className="w-8 h-8 border-none">
                                <MoreHorizontal className="h-4 w-4" />
                              </SelectTrigger>
                              <SelectContent align="end">
                                <SelectItem
                                  onSelect={() =>
                                    handleCreateFromTemplate(template)
                                  }
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Role
                                  </div>
                                </SelectItem>
                                <SelectItem
                                  onSelect={() => {
                                    setSelectedTemplate(template);
                                    setIsEditTemplateDialogOpen(true);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Template
                                  </div>
                                </SelectItem>
                                <SelectItem
                                  onSelect={() =>
                                    handleDuplicateTemplate(template)
                                  }
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center">
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate
                                  </div>
                                </SelectItem>
                                <SelectItem
                                  onSelect={() =>
                                    handleDeleteTemplate(template.id)
                                  }
                                  className="cursor-pointer text-red-600"
                                  disabled={template.isBuiltIn}
                                >
                                  <div className="flex items-center">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{template.category}</Badge>
                          <div className="flex items-center gap-2">
                            <Crown className="h-3 w-3 text-gray-500" />
                            <span className="text-sm text-gray-500">
                              Level {template.level}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3 text-blue-500" />
                            <span>
                              {template.permissions.length} permissions
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span>{template.usageCount} uses</span>
                          </div>
                        </div>
                        {template.organizationUnit && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {template.organizationUnit}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleCreateFromTemplate(template)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Use Template
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsEditTemplateDialogOpen(true);
                            }}
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conflicts Tab */}
        <TabsContent value="conflicts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Role Conflicts
              </CardTitle>
              <CardDescription>
                Detected conflicts and security issues in role assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(conflicts || []).map((conflict) => (
                  <Card
                    key={conflict.id}
                    className={cn(
                      "border",
                      getConflictSeverityColor(conflict.severity),
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge
                              className={getConflictSeverityColor(
                                conflict.severity,
                              )}
                            >
                              {conflict.severity}
                            </Badge>
                            <span className="text-sm font-medium">
                              {conflict.type.replace("_", " ")}
                            </span>
                            {conflict.resolved && (
                              <Badge
                                variant="outline"
                                className="text-green-600"
                              >
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            {conflict.description}
                          </p>
                          <p className="text-sm font-medium">
                            Affected roles: {conflict.roles.join(", ")}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Suggestion: {conflict.suggestion}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Resolve
                          </Button>
                          <Button variant="ghost" size="sm">
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Roles
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {roles.length}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Roles
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {roles.filter((r) => r.status === "active").length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Conflicts
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {conflicts.filter((c) => !c.resolved).length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Templates
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {roleTemplates.length}
                    </p>
                  </div>
                  <Layers className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Role Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleAnalyticsChart roles={roles} analytics={analytics} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      {selectedRole && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <EditRoleDialog
            role={selectedRole}
            availablePermissions={availablePermissions}
            parentRoles={roles.filter(
              (r) => r.status === "active" && r.id !== selectedRole.id,
            )}
            onSave={(updatedRole) => {
              setRoles((prev) =>
                prev.map((r) => (r.id === updatedRole.id ? updatedRole : r)),
              );
              setIsEditDialogOpen(false);
            }}
          />
        </Dialog>
      )}

      {/* Create Template Dialog */}
      <Dialog
        open={isCreateTemplateDialogOpen}
        onOpenChange={setIsCreateTemplateDialogOpen}
      >
        <CreateTemplateDialog
          onCreateTemplate={handleCreateTemplate}
          availablePermissions={availablePermissions}
          existingRoles={roles.filter((r) => r.status === "active")}
        />
      </Dialog>

      {/* Edit Template Dialog */}
      {selectedTemplate && (
        <Dialog
          open={isEditTemplateDialogOpen}
          onOpenChange={setIsEditTemplateDialogOpen}
        >
          <EditTemplateDialog
            template={selectedTemplate}
            onUpdateTemplate={handleUpdateTemplate}
            availablePermissions={availablePermissions}
          />
        </Dialog>
      )}
    </div>
  );
};

// Create Role Dialog Component
const CreateRoleDialog: React.FC<{
  onCreateRole: (role: CreateRoleRequest) => void;
  availablePermissions: Permission[];
  parentRoles: Role[];
}> = ({ onCreateRole, availablePermissions, parentRoles }) => {
  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: "",
    description: "",
    permissions: [],
    isTemplate: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRole(formData);
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Role</DialogTitle>
        <DialogDescription>
          Define a new role with specific permissions and hierarchy
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Organization Unit</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      organizationUnit: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isTemplate"
                checked={formData.isTemplate}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isTemplate: !!checked }))
                }
              />
              <Label htmlFor="isTemplate">Create as template</Label>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div>
              <Label className="text-lg font-semibold mb-4 block">
                Select Permissions
              </Label>
              <PermissionSelector
                permissions={
                  Array.isArray(availablePermissions)
                    ? availablePermissions
                    : []
                }
                selectedPermissions={formData.permissions}
                onSelectionChange={(selectedIds) => {
                  setFormData((prev) => ({
                    ...prev,
                    permissions: selectedIds,
                  }));
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="hierarchy" className="space-y-4">
            <div>
              <Label>Parent Role (Optional)</Label>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, parentRole: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent role" />
                </SelectTrigger>
                <SelectContent>
                  {(parentRoles || []).map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Child roles inherit permissions from parent roles
              </p>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="datetime-local"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validFrom: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="datetime-local"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validUntil: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Create Role
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Edit Role Dialog Component
const EditRoleDialog: React.FC<{
  role: Role;
  availablePermissions: Permission[];
  parentRoles: Role[];
  onSave: (role: Role) => void;
}> = ({ role, availablePermissions, parentRoles, onSave }) => {
  const [formData, setFormData] = useState<Role>(role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/roles/${role.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedRole = await response.json();
        onSave(updatedRole);
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Role: {role.name}</DialogTitle>
        <DialogDescription>
          Update role information, permissions, and settings
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
            <TabsTrigger value="temporal">Temporal</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editName">Name</Label>
                <Input
                  id="editName"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(
                    value: "active" | "pending" | "inactive" | "deprecated",
                  ) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div>
              <Label className="text-lg font-semibold mb-4 block">
                Assigned Permissions ({formData.permissions.length})
              </Label>
              <PermissionSelector
                permissions={
                  Array.isArray(availablePermissions)
                    ? availablePermissions
                    : []
                }
                selectedPermissions={formData.permissions}
                onSelectionChange={(selectedIds) => {
                  setFormData((prev) => ({
                    ...prev,
                    permissions: selectedIds,
                  }));
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="hierarchy" className="space-y-4">
            <div>
              <Label>Parent Role</Label>
              <Select
                value={formData.parentRole || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    parentRole: value === "none" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No parent role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent role</SelectItem>
                  {(parentRoles || []).map((parentRole) => (
                    <SelectItem key={parentRole.id} value={parentRole.id}>
                      {parentRole.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.inheritedPermissions && (
              <div>
                <Label>
                  Inherited Permissions ({formData.inheritedPermissions.length})
                </Label>
                <div className="text-sm text-gray-600 mt-1">
                  {(formData.inheritedPermissions || []).map(
                    (permId, index) => {
                      const perm = Array.isArray(availablePermissions)
                        ? availablePermissions.find((p) => p.id === permId)
                        : null;
                      return perm ? (
                        <Badge
                          key={index}
                          variant="outline"
                          className="mr-1 mb-1"
                        >
                          {perm.name}
                        </Badge>
                      ) : null;
                    },
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="temporal" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editValidFrom">Valid From</Label>
                <Input
                  id="editValidFrom"
                  type="datetime-local"
                  value={
                    formData.validFrom
                      ? new Date(formData.validFrom).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validFrom: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="editValidUntil">Valid Until</Label>
                <Input
                  id="editValidUntil"
                  type="datetime-local"
                  value={
                    formData.validUntil
                      ? new Date(formData.validUntil).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validUntil: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium">Users Assigned</p>
                  <p className="text-2xl font-bold">{role.userCount || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium">Permissions</p>
                  <p className="text-2xl font-bold">
                    {role.permissions.length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Role Hierarchy Visualization Component
const RoleHierarchyView: React.FC<{ roles: Role[] }> = ({ roles }) => {
  const getLevelIcon = (level: number) => {
    if (level >= 4) return <Crown className="h-4 w-4 text-purple-600" />;
    if (level >= 3) return <Shield className="h-4 w-4 text-blue-600" />;
    if (level >= 2) return <Users className="h-4 w-4 text-green-600" />;
    return <User className="h-4 w-4 text-gray-600" />;
  };

  const buildHierarchy = (roles: Role[]) => {
    const roleMap = new Map(roles.map((role) => [role.id, role]));
    const hierarchy: Role[] = [];

    roles.forEach((role) => {
      if (!role.parentRole) {
        hierarchy.push(role);
      }
    });

    return hierarchy;
  };

  const renderRoleNode = (role: Role, level: number = 0) => {
    const children = roles.filter((r) => r.parentRole === role.id);

    return (
      <div key={role.id} className={`ml-${level * 4}`}>
        <div className="flex items-center space-x-2 p-2 border rounded-lg mb-2">
          {getLevelIcon(role.level)}
          <span className="font-medium">{role.name}</span>
          <Badge className={cn(getStatusColor(role.status))}>
            {role.status}
          </Badge>
          <span className="text-sm text-gray-500">
            ({role.permissions.length} permissions)
          </span>
        </div>
        {children.map((child) => renderRoleNode(child, level + 1))}
      </div>
    );
  };

  const rootRoles = buildHierarchy(roles);

  return (
    <div className="space-y-2">
      {rootRoles.map((role) => renderRoleNode(role))}
    </div>
  );
};

// Role Analytics Chart Component
const RoleAnalyticsChart: React.FC<{
  roles: Role[];
  analytics: Record<string, RoleAnalytics>;
}> = ({ roles, analytics }) => {
  return (
    <div className="space-y-4">
      {roles.slice(0, 10).map((role) => {
        const roleAnalytics = analytics[role.id];
        const usageScore =
          roleAnalytics?.usageMetrics.frequency === "high"
            ? 90
            : roleAnalytics?.usageMetrics.frequency === "medium"
              ? 60
              : roleAnalytics?.usageMetrics.frequency === "low"
                ? 30
                : 10;

        return (
          <div
            key={role.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex-1">
              <p className="font-medium">{role.name}</p>
              <p className="text-sm text-gray-500">
                {roleAnalytics?.userCount || 0} users •{" "}
                {role.permissions.length} permissions
              </p>
            </div>
            <div className="flex-1 mx-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Usage</span>
                <span>{usageScore}%</span>
              </div>
              <Progress value={usageScore} className="h-2" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {roleAnalytics?.complianceScore || 95}% compliant
              </p>
              <p className="text-xs text-gray-500">
                {roleAnalytics?.conflicts || 0} conflicts
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Edit Template Dialog Component
const EditTemplateDialog: React.FC<{
  template: RoleTemplate;
  onUpdateTemplate: (template: any) => void;
  availablePermissions: Permission[];
}> = ({ template, onUpdateTemplate, availablePermissions }) => {
  const [formData, setFormData] = useState<RoleTemplate>(template);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    "Management",
    "Administrative",
    "Technical",
    "Sales",
    "Marketing",
    "HR",
    "Finance",
    "Operations",
    "Security",
    "Customer Service",
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (formData.permissions.length === 0) {
      newErrors.permissions = "At least one permission is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onUpdateTemplate(formData);
      setErrors({});
    } catch (error) {
      console.error("Error updating template:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Template: {template.name}</DialogTitle>
        <DialogDescription>
          Update template information and permissions
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editTemplateName">Template Name</Label>
                <Input
                  id="editTemplateName"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger
                    className={errors.category ? "border-red-500" : ""}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="editTemplateDescription">Description</Label>
              <Textarea
                id="editTemplateDescription"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={errors.description ? "border-red-500" : ""}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Organization Unit</Label>
                <Select
                  value={formData.organizationUnit || "any"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      organizationUnit: value === "any" ? undefined : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Unit</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Suggested Level</Label>
                <Select
                  value={formData.level.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, level: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1 - Basic User</SelectItem>
                    <SelectItem value="2">Level 2 - Advanced User</SelectItem>
                    <SelectItem value="3">Level 3 - Supervisor</SelectItem>
                    <SelectItem value="4">Level 4 - Manager</SelectItem>
                    <SelectItem value="5">Level 5 - Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="editIsBuiltIn"
                checked={formData.isBuiltIn}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isBuiltIn: !!checked }))
                }
              />
              <Label htmlFor="editIsBuiltIn">Built-in template</Label>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div>
              <Label className="text-lg font-semibold mb-4 block">
                Template Permissions ({formData.permissions.length})
              </Label>
              <PermissionSelector
                permissions={
                  Array.isArray(availablePermissions)
                    ? availablePermissions
                    : []
                }
                selectedPermissions={formData.permissions}
                onSelectionChange={(selectedIds) => {
                  setFormData((prev) => ({
                    ...prev,
                    permissions: selectedIds,
                  }));
                }}
              />
              {errors.permissions && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.permissions}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Usage Count
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formData.usageCount}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Permissions
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formData.permissions.length}
                      </p>
                    </div>
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Level</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formData.level}
                      </p>
                    </div>
                    <Crown className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4">
              <Label className="text-sm font-medium">Template Properties</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Built-in Template</span>
                  <Badge variant={formData.isBuiltIn ? "default" : "secondary"}>
                    {formData.isBuiltIn ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Category</span>
                  <Badge variant="outline">{formData.category}</Badge>
                </div>
                {formData.organizationUnit && (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Organization Unit</span>
                    <Badge variant="outline">{formData.organizationUnit}</Badge>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Template"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Create Template Dialog Component
const CreateTemplateDialog: React.FC<{
  onCreateTemplate: (template: any) => void;
  availablePermissions: Permission[];
  existingRoles: Role[];
}> = ({ onCreateTemplate, availablePermissions, existingRoles }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    permissions: [] as string[],
    organizationUnit: "any",
    level: 1,
    isBuiltIn: false,
    sourceRoleId: "", // To create template from existing role
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Management",
    "Administrative",
    "Technical",
    "Sales",
    "Marketing",
    "HR",
    "Finance",
    "Operations",
    "Security",
    "Customer Service",
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (formData.permissions.length === 0 && !formData.sourceRoleId) {
      newErrors.permissions = "At least one permission is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // If creating from existing role, get permissions from that role
      let permissions = formData.permissions;
      if (formData.sourceRoleId) {
        const sourceRole = existingRoles.find(
          (r) => r.id === formData.sourceRoleId,
        );
        if (sourceRole) {
          permissions = sourceRole.permissions;
        }
      }

      await onCreateTemplate({
        ...formData,
        organizationUnit:
          formData.organizationUnit === "any"
            ? undefined
            : formData.organizationUnit,
        permissions,
        usageCount: 0,
      });

      // Reset form on success
      setFormData({
        name: "",
        description: "",
        category: "",
        permissions: [],
        organizationUnit: "any",
        level: 1,
        isBuiltIn: false,
        sourceRoleId: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error creating template:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateFromRole = (roleId: string) => {
    const role = existingRoles.find((r) => r.id === roleId);
    if (role) {
      setFormData((prev) => ({
        ...prev,
        name: `${role.name} Template`,
        description: `Template based on ${role.name} role`,
        organizationUnit: role.organizationUnit || "any",
        level: role.level,
        sourceRoleId: roleId,
        permissions: role.permissions,
      }));
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create Role Template</DialogTitle>
        <DialogDescription>
          Create a reusable role template that can be used to quickly create new
          roles
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="source">From Existing Role</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger
                    className={errors.category ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="templateDescription">Description</Label>
              <Textarea
                id="templateDescription"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={errors.description ? "border-red-500" : ""}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Organization Unit (Optional)</Label>
                <Select
                  value={formData.organizationUnit || "any"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      organizationUnit: value === "any" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Unit</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Suggested Level</Label>
                <Select
                  value={formData.level.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, level: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1 - Basic User</SelectItem>
                    <SelectItem value="2">Level 2 - Advanced User</SelectItem>
                    <SelectItem value="3">Level 3 - Supervisor</SelectItem>
                    <SelectItem value="4">Level 4 - Manager</SelectItem>
                    <SelectItem value="5">Level 5 - Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isBuiltIn"
                checked={formData.isBuiltIn}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isBuiltIn: !!checked }))
                }
              />
              <Label htmlFor="isBuiltIn">Mark as built-in template</Label>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div>
              <Label className="text-lg font-semibold mb-4 block">
                Select Permissions ({formData.permissions.length})
              </Label>
              {!formData.sourceRoleId && (
                <PermissionSelector
                  permissions={
                    Array.isArray(availablePermissions)
                      ? availablePermissions
                      : []
                  }
                  selectedPermissions={formData.permissions}
                  onSelectionChange={(selectedIds) => {
                    setFormData((prev) => ({
                      ...prev,
                      permissions: selectedIds,
                    }));
                  }}
                />
              )}
              {formData.sourceRoleId && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Permissions will be inherited from the selected source role.
                    Switch to the "From Existing Role" tab to modify the source.
                  </AlertDescription>
                </Alert>
              )}
              {errors.permissions && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.permissions}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="source" className="space-y-4">
            <div>
              <Label>Create Template from Existing Role</Label>
              <p className="text-sm text-gray-500 mb-4">
                Select an existing role to use as the basis for this template.
                The template will inherit all permissions from the selected
                role.
              </p>
              <Select
                value={formData.sourceRoleId}
                onValueChange={handleCreateFromRole}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {existingRoles
                    .filter((role) => role.status === "active")
                    .map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{role.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {role.permissions.length} permissions
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {formData.sourceRoleId && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Source Role Details:</h4>
                  {(() => {
                    const sourceRole = existingRoles.find(
                      (r) => r.id === formData.sourceRoleId,
                    );
                    return sourceRole ? (
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Name:</strong> {sourceRole.name}
                        </p>
                        <p>
                          <strong>Description:</strong> {sourceRole.description}
                        </p>
                        <p>
                          <strong>Level:</strong> {sourceRole.level}
                        </p>
                        <p>
                          <strong>Permissions:</strong>{" "}
                          {sourceRole.permissions.length}
                        </p>
                        {sourceRole.organizationUnit && (
                          <p>
                            <strong>Organization Unit:</strong>{" "}
                            {sourceRole.organizationUnit}
                          </p>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Template"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default Roles;
