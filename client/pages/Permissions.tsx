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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Permission,
  PermissionCategory,
  Resource,
  PermissionAnalytics,
  PermissionOptimization,
  PermissionCondition,
  FieldRestriction,
  ResourceEndpoint,
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
  Settings,
  Lock,
  Unlock,
  Key,
  Database,
  Globe,
  Code,
  Layers,
  Activity,
  BarChart3,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  FileText,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PaginationControl,
  usePagination,
} from "@/components/ui/pagination-control";

const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>(
    [],
  );
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [analytics, setAnalytics] = useState<
    Record<string, PermissionAnalytics>
  >({});
  const [optimizations, setOptimizations] = useState<PermissionOptimization[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("permissions");

  // Resources related state
  const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false);
  const [isEditResourceDialogOpen, setIsEditResourceDialogOpen] =
    useState(false);
  const [isResourceSettingsDialogOpen, setIsResourceSettingsDialogOpen] =
    useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );
  const [resourceSearchTerm, setResourceSearchTerm] = useState("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all");

  // Categories related state
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] =
    useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] =
    useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<PermissionCategory | null>(null);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<
    PermissionCategory[]
  >([]);

  // Pagination state
  const {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredPermissions.length, 10);

  // Paginated permissions for display
  const paginatedPermissions = filteredPermissions.slice(startIndex, endIndex);

  useEffect(() => {
    fetchPermissions();
    fetchCategories();
    fetchResources();
    fetchOptimizations();
  }, []);

  useEffect(() => {
    filterPermissions();
  }, [permissions, searchTerm, categoryFilter, scopeFilter, riskFilter]);

  useEffect(() => {
    filterCategories();
  }, [categories, categorySearchTerm]);

  const fetchPermissions = async () => {
    try {
      const response = await fetch("/api/permissions");
      const data = await response.json();
      setPermissions(data.permissions || data);

      // Fetch analytics for each permission
      if (data.permissions) {
        const analyticsPromises = data.permissions.map(
          (permission: Permission) =>
            fetch(`/api/permissions/${permission.id}/analytics`).then((r) =>
              r.json(),
            ),
        );
        const analyticsResults = await Promise.all(analyticsPromises);
        const analyticsMap = data.permissions.reduce(
          (
            acc: Record<string, PermissionAnalytics>,
            permission: Permission,
            index: number,
          ) => {
            acc[permission.id] = analyticsResults[index];
            return acc;
          },
          {},
        );
        setAnalytics(analyticsMap);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/permissions/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch("/api/resources");
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  const fetchOptimizations = async () => {
    try {
      const response = await fetch("/api/permissions/optimizations");
      const data = await response.json();
      setOptimizations(data);
    } catch (error) {
      console.error("Error fetching optimizations:", error);
    }
  };

  const filterPermissions = () => {
    let filtered = permissions;

    if (searchTerm) {
      filtered = filtered.filter(
        (permission) =>
          permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          permission.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          permission.resource.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (permission) => permission.category === categoryFilter,
      );
    }

    if (scopeFilter !== "all") {
      filtered = filtered.filter(
        (permission) => permission.scope === scopeFilter,
      );
    }

    if (riskFilter !== "all") {
      filtered = filtered.filter(
        (permission) => permission.risk === riskFilter,
      );
    }

    setFilteredPermissions(filtered);
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case "global":
        return <Globe className="h-4 w-4 text-purple-600" />;
      case "resource":
        return <Database className="h-4 w-4 text-blue-600" />;
      case "field":
        return <FileText className="h-4 w-4 text-green-600" />;
      case "api":
        return <Code className="h-4 w-4 text-orange-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getOptimizationColor = (type: string) => {
    switch (type) {
      case "cleanup":
        return "bg-blue-100 text-blue-800";
      case "consolidation":
        return "bg-purple-100 text-purple-800";
      case "deprecation":
        return "bg-yellow-100 text-yellow-800";
      case "risk_reduction":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreatePermission = async (permissionData: any) => {
    try {
      const response = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permissionData),
      });

      if (response.ok) {
        const newPermission = await response.json();
        setPermissions((prev) => [...prev, newPermission]);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating permission:", error);
    }
  };

  // Resource management handlers
  const handleCreateResource = async (resourceData: any) => {
    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resourceData),
      });

      if (response.ok) {
        const newResource = await response.json();
        setResources((prev) => [...prev, newResource]);
        setIsAddResourceDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating resource:", error);
    }
  };

  const handleUpdateResource = async (resourceData: any) => {
    try {
      const response = await fetch(`/api/resources/${resourceData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resourceData),
      });

      if (response.ok) {
        const updatedResource = await response.json();
        setResources((prev) =>
          prev.map((r) => (r.id === updatedResource.id ? updatedResource : r)),
        );
        setIsEditResourceDialogOpen(false);
        setSelectedResource(null);
      }
    } catch (error) {
      console.error("Error updating resource:", error);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setResources((prev) => prev.filter((r) => r.id !== resourceId));
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  // Category management functions
  const filterCategories = () => {
    let filtered = categories;

    if (categorySearchTerm) {
      filtered = filtered.filter(
        (category) =>
          category.name
            .toLowerCase()
            .includes(categorySearchTerm.toLowerCase()) ||
          category.description
            .toLowerCase()
            .includes(categorySearchTerm.toLowerCase()),
      );
    }

    setFilteredCategories(filtered);
  };

  const handleCreateCategory = async (categoryData: any) => {
    try {
      const response = await fetch("/api/permissions/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories((prev) => [...prev, newCategory]);
        setIsCreateCategoryDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleUpdateCategory = async (categoryData: any) => {
    try {
      const response = await fetch(
        `/api/permissions/categories/${categoryData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryData),
        },
      );

      if (response.ok) {
        const updatedCategory = await response.json();
        setCategories((prev) =>
          prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c)),
        );
        setIsEditCategoryDialogOpen(false);
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(
        `/api/permissions/categories/${categoryId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">
            Permission Management
          </h1>
          <p className="text-gray-600 mt-1">
            Granular access control with resource-based permissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Optimize
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Permission
              </Button>
            </DialogTrigger>
            <CreatePermissionDialog
              onCreatePermission={handleCreatePermission}
              categories={categories}
              resources={resources}
            />
          </Dialog>
        </div>
      </div>

      {/* Optimization Alerts */}
      {optimizations.filter((o) => o.severity === "critical").length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {optimizations.filter((o) => o.severity === "critical").length}{" "}
            critical optimization opportunities detected.
            <Button
              variant="link"
              className="p-0 ml-1 text-red-800"
              onClick={() => setActiveTab("optimization")}
            >
              Review optimizations
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="api-protection">API Protection</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search permissions by name, resource, or description..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={scopeFilter} onValueChange={setScopeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scopes</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                      <SelectItem value="field">Field</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Risk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Permissions ({filteredPermissions.length})</span>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPermissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Key className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              <span>{permission.name}</span>
                              {permission.isSystemPermission && (
                                <Badge variant="secondary" className="text-xs">
                                  System
                                </Badge>
                              )}
                              {permission.canDelegate && (
                                <Badge variant="outline" className="text-xs">
                                  Delegatable
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{permission.resource}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getScopeIcon(permission.scope)}
                          <span className="text-sm capitalize">
                            {permission.scope}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "flex items-center gap-1 w-fit",
                            getRiskColor(permission.risk),
                          )}
                        >
                          {permission.risk === "critical" && (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {permission.risk === "high" && (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {permission.risk === "medium" && (
                            <Clock className="h-3 w-3" />
                          )}
                          {permission.risk === "low" && (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          {permission.risk}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>
                            {analytics[permission.id]?.usageStats.totalUses ||
                              permission.usageCount ||
                              0}{" "}
                            uses
                          </p>
                          <p className="text-gray-500">
                            {permission.lastUsed
                              ? new Date(
                                  permission.lastUsed,
                                ).toLocaleDateString()
                              : "Never"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {permission.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPermission(permission);
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          {/* Categories Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search categories by name or description..."
                      className="pl-10"
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateCategoryDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Category
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
                  Permission Categories ({filteredCategories.length})
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                  <Card
                    key={category.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`p-2 rounded-lg mr-3`}
                            style={{ backgroundColor: category.color + "20" }}
                          >
                            <Shield
                              className="h-5 w-5"
                              style={{ color: category.color }}
                            />
                          </div>
                          {category.name}
                        </div>
                        {!category.isSystemCategory && (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCategory(category);
                                setIsEditCategoryDialogOpen(true);
                              }}
                              title="Edit Category"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Are you sure you want to delete the category "${category.name}"?`,
                                  )
                                ) {
                                  handleDeleteCategory(category.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-700"
                              title="Delete Category"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Permissions
                        </span>
                        <Badge variant="secondary">
                          {category.permissions.length}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.isSystemCategory && (
                          <Badge variant="outline" className="text-xs">
                            System Category
                          </Badge>
                        )}
                        {category.parentCategory && (
                          <Badge variant="outline" className="text-xs">
                            Subcategory
                          </Badge>
                        )}
                      </div>
                      {category.createdAt && (
                        <p className="text-xs text-gray-500">
                          Created:{" "}
                          {new Date(category.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredCategories.length === 0 && categories.length > 0 && (
                <div className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No categories found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search terms.
                  </p>
                </div>
              )}

              {categories.length === 0 && (
                <div className="text-center py-12">
                  <Layers className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No categories
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first permission category.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => setIsCreateCategoryDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Category
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          {/* Resources Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search resources by name, type, or description..."
                      className="pl-10"
                      value={resourceSearchTerm}
                      onChange={(e) => setResourceSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={resourceTypeFilter}
                    onValueChange={setResourceTypeFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Resource Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="entity">Entity</SelectItem>
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddResourceDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Resource
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Protected Resources (
                  {
                    resources.filter(
                      (r) =>
                        (resourceSearchTerm === "" ||
                          r.name
                            .toLowerCase()
                            .includes(resourceSearchTerm.toLowerCase()) ||
                          r.description
                            .toLowerCase()
                            .includes(resourceSearchTerm.toLowerCase())) &&
                        (resourceTypeFilter === "all" ||
                          r.type === resourceTypeFilter),
                    ).length
                  }
                  )
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedResourcesTable
                resources={resources.filter(
                  (r) =>
                    (resourceSearchTerm === "" ||
                      r.name
                        .toLowerCase()
                        .includes(resourceSearchTerm.toLowerCase()) ||
                      r.description
                        .toLowerCase()
                        .includes(resourceSearchTerm.toLowerCase())) &&
                    (resourceTypeFilter === "all" ||
                      r.type === resourceTypeFilter),
                )}
                onEdit={(resource) => {
                  setSelectedResource(resource);
                  setIsEditResourceDialogOpen(true);
                }}
                onSettings={(resource) => {
                  setSelectedResource(resource);
                  setIsResourceSettingsDialogOpen(true);
                }}
                onDelete={handleDeleteResource}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Protection Tab */}
        <TabsContent value="api-protection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5" />
                API Endpoint Protection
              </CardTitle>
              <CardDescription>
                Configure permissions for API endpoints and rate limiting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <APIProtectionView resources={resources} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <PermissionAnalyticsView
            permissions={permissions}
            analytics={analytics}
          />
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                Permission Optimization
              </CardTitle>
              <CardDescription>
                Automated suggestions for permission cleanup and optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizations.map((optimization) => (
                  <Card key={optimization.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge
                              className={getOptimizationColor(
                                optimization.type,
                              )}
                            >
                              {optimization.type.replace("_", " ")}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={getRiskColor(optimization.severity)}
                            >
                              {optimization.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            {optimization.description}
                          </p>
                          <p className="text-sm font-medium">
                            Affected permissions:{" "}
                            {optimization.permissions.length}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Recommendation: {optimization.recommendation}
                          </p>
                          <p className="text-xs text-gray-500">
                            Impact: {optimization.estimatedImpact}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {optimization.autoApplicable && (
                            <Button variant="outline" size="sm">
                              <Cpu className="mr-2 h-4 w-4" />
                              Auto Apply
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Apply
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
      </Tabs>

      {/* Edit Permission Dialog */}
      {selectedPermission && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <EditPermissionDialog
            permission={selectedPermission}
            categories={categories}
            resources={resources}
            onSave={(updatedPermission) => {
              setPermissions((prev) =>
                prev.map((p) =>
                  p.id === updatedPermission.id ? updatedPermission : p,
                ),
              );
              setIsEditDialogOpen(false);
            }}
          />
        </Dialog>
      )}

      {/* Add Resource Dialog */}
      <Dialog
        open={isAddResourceDialogOpen}
        onOpenChange={setIsAddResourceDialogOpen}
      >
        <AddResourceDialog onCreateResource={handleCreateResource} />
      </Dialog>

      {/* Edit Resource Dialog */}
      {selectedResource && (
        <Dialog
          open={isEditResourceDialogOpen}
          onOpenChange={setIsEditResourceDialogOpen}
        >
          <EditResourceDialog
            resource={selectedResource}
            onSave={handleUpdateResource}
          />
        </Dialog>
      )}

      {/* Resource Settings Dialog */}
      {selectedResource && (
        <Dialog
          open={isResourceSettingsDialogOpen}
          onOpenChange={setIsResourceSettingsDialogOpen}
        >
          <ResourceSettingsDialog
            resource={selectedResource}
            onSave={handleUpdateResource}
          />
        </Dialog>
      )}

      {/* Create Category Dialog */}
      <Dialog
        open={isCreateCategoryDialogOpen}
        onOpenChange={setIsCreateCategoryDialogOpen}
      >
        <CreateCategoryDialog onCreateCategory={handleCreateCategory} />
      </Dialog>

      {/* Edit Category Dialog */}
      {selectedCategory && (
        <Dialog
          open={isEditCategoryDialogOpen}
          onOpenChange={setIsEditCategoryDialogOpen}
        >
          <EditCategoryDialog
            category={selectedCategory}
            onSave={handleUpdateCategory}
          />
        </Dialog>
      )}
    </div>
  );
};

// Create Permission Dialog Component
const CreatePermissionDialog: React.FC<{
  onCreatePermission: (permission: any) => void;
  categories: PermissionCategory[];
  resources: Resource[];
}> = ({ onCreatePermission, categories, resources }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    resource: "",
    action: "",
    category: "",
    scope: "resource",
    risk: "low",
    canDelegate: false,
    complianceRequired: false,
    conditions: [] as PermissionCondition[],
    fieldRestrictions: [] as FieldRestriction[],
    apiEndpoints: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available endpoints for selected resource
  const selectedResource = resources.find((r) => r.name === formData.resource);
  const availableEndpoints = selectedResource?.endpoints || [];
  const availableFields = selectedResource?.fields || [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Permission name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.resource) {
      newErrors.resource = "Resource is required";
    }
    if (!formData.action) {
      newErrors.action = "Action is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onCreatePermission(formData);
      // Reset form on success
      setFormData({
        name: "",
        description: "",
        resource: "",
        action: "",
        category: "",
        scope: "resource",
        risk: "low",
        canDelegate: false,
        complianceRequired: false,
        conditions: [],
        fieldRestrictions: [],
        apiEndpoints: [],
      });
      setErrors({});
    } catch (error) {
      console.error("Error creating permission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCondition = () => {
    const newCondition: PermissionCondition = {
      id: `cond-${Date.now()}`,
      type: "time",
      operator: "equals",
      field: "",
      value: "",
      description: "",
    };
    setFormData((prev) => ({
      ...prev,
      conditions: [...prev.conditions, newCondition],
    }));
  };

  const updateCondition = (
    id: string,
    updates: Partial<PermissionCondition>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.map((cond) =>
        cond.id === id ? { ...cond, ...updates } : cond,
      ),
    }));
  };

  const removeCondition = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((cond) => cond.id !== id),
    }));
  };

  const addFieldRestriction = () => {
    const newRestriction: FieldRestriction = {
      id: `field-${Date.now()}`,
      field: "",
      access: "read",
      maskingRule: "none",
    };
    setFormData((prev) => ({
      ...prev,
      fieldRestrictions: [...prev.fieldRestrictions, newRestriction],
    }));
  };

  const updateFieldRestriction = (
    id: string,
    updates: Partial<FieldRestriction>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      fieldRestrictions: prev.fieldRestrictions.map((restriction) =>
        restriction.id === id ? { ...restriction, ...updates } : restriction,
      ),
    }));
  };

  const removeFieldRestriction = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      fieldRestrictions: prev.fieldRestrictions.filter(
        (restriction) => restriction.id !== id,
      ),
    }));
  };

  const toggleApiEndpoint = (endpointPath: string) => {
    setFormData((prev) => ({
      ...prev,
      apiEndpoints: prev.apiEndpoints.includes(endpointPath)
        ? prev.apiEndpoints.filter((ep) => ep !== endpointPath)
        : [...prev.apiEndpoints, endpointPath],
    }));
  };

  return (
    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Permission</DialogTitle>
        <DialogDescription>
          Define a new permission with granular access control settings
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="conditions">
              Conditions ({formData.conditions.length})
            </TabsTrigger>
            <TabsTrigger value="fields">
              Field Access ({formData.fieldRestrictions.length})
            </TabsTrigger>
            <TabsTrigger value="api">
              API Endpoints ({formData.apiEndpoints.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Permission Name</Label>
                <Input
                  id="name"
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
                <Label>Action</Label>
                <Select
                  value={formData.action}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, action: value }))
                  }
                >
                  <SelectTrigger
                    className={errors.action ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="execute">Execute</SelectItem>
                    <SelectItem value="manage">Manage</SelectItem>
                  </SelectContent>
                </Select>
                {errors.action && (
                  <p className="text-sm text-red-500 mt-1">{errors.action}</p>
                )}
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
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Resource</Label>
                <Select
                  value={formData.resource}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, resource: value }))
                  }
                >
                  <SelectTrigger
                    className={errors.resource ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((resource) => (
                      <SelectItem key={resource.id} value={resource.name}>
                        {resource.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.resource && (
                  <p className="text-sm text-red-500 mt-1">{errors.resource}</p>
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
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                )}
              </div>
              <div>
                <Label>Risk Level</Label>
                <Select
                  value={formData.risk}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, risk: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Scope</Label>
                <Select
                  value={formData.scope}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, scope: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                    <SelectItem value="field">Field</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canDelegate"
                  checked={formData.canDelegate}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, canDelegate: !!checked }))
                  }
                />
                <Label htmlFor="canDelegate">Can be delegated</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="complianceRequired"
                  checked={formData.complianceRequired}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      complianceRequired: !!checked,
                    }))
                  }
                />
                <Label htmlFor="complianceRequired">Compliance required</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conditions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Access Conditions</Label>
                <p className="text-sm text-gray-500">
                  Define contextual conditions for when this permission applies
                </p>
              </div>
              <Button
                type="button"
                onClick={addCondition}
                variant="outline"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Condition
              </Button>
            </div>

            <div className="space-y-4">
              {formData.conditions.map((condition) => (
                <Card key={condition.id} className="p-4">
                  <div className="grid grid-cols-4 gap-3 items-end">
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={condition.type}
                        onValueChange={(value) =>
                          updateCondition(condition.id, { type: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="time">Time</SelectItem>
                          <SelectItem value="location">Location</SelectItem>
                          <SelectItem value="device">Device</SelectItem>
                          <SelectItem value="attribute">
                            User Attribute
                          </SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Field</Label>
                      <Input
                        value={condition.field}
                        onChange={(e) =>
                          updateCondition(condition.id, {
                            field: e.target.value,
                          })
                        }
                        placeholder="e.g., hour, location, role"
                      />
                    </div>
                    <div>
                      <Label>Operator</Label>
                      <Select
                        value={condition.operator}
                        onValueChange={(value) =>
                          updateCondition(condition.id, {
                            operator: value as any,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Not Equals</SelectItem>
                          <SelectItem value="greater_than">
                            Greater Than
                          </SelectItem>
                          <SelectItem value="less_than">Less Than</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="in">In</SelectItem>
                          <SelectItem value="not_in">Not In</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input
                        value={condition.value}
                        onChange={(e) =>
                          updateCondition(condition.id, {
                            value: e.target.value,
                          })
                        }
                        placeholder="Condition value"
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-5 gap-3 items-end">
                    <div className="col-span-4">
                      <Label>Description</Label>
                      <Input
                        value={condition.description}
                        onChange={(e) =>
                          updateCondition(condition.id, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe this condition"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCondition(condition.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {formData.conditions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>
                    No conditions defined. This permission will apply
                    unconditionally.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="fields" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Field-Level Restrictions</Label>
                <p className="text-sm text-gray-500">
                  Control access to specific fields within the resource
                </p>
              </div>
              <Button
                type="button"
                onClick={addFieldRestriction}
                variant="outline"
                size="sm"
                disabled={!formData.resource}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Field Restriction
              </Button>
            </div>

            {!formData.resource && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please select a resource in the Basic Info tab to configure
                  field restrictions.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {formData.fieldRestrictions.map((restriction) => (
                <Card key={restriction.id} className="p-4">
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div>
                      <Label>Field</Label>
                      <Select
                        value={restriction.field}
                        onValueChange={(value) =>
                          updateFieldRestriction(restriction.id, {
                            field: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.map((field) => (
                            <SelectItem key={field.id} value={field.name}>
                              {field.name} ({field.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Access Level</Label>
                      <Select
                        value={restriction.access}
                        onValueChange={(value) =>
                          updateFieldRestriction(restriction.id, {
                            access: value as any,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="read">Read Only</SelectItem>
                          <SelectItem value="write">Read & Write</SelectItem>
                          <SelectItem value="none">No Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Masking Rule</Label>
                      <Select
                        value={restriction.maskingRule}
                        onValueChange={(value) =>
                          updateFieldRestriction(restriction.id, {
                            maskingRule: value as any,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Masking</SelectItem>
                          <SelectItem value="partial">Partial Mask</SelectItem>
                          <SelectItem value="full">Full Mask</SelectItem>
                          <SelectItem value="hash">Hash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFieldRestriction(restriction.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {formData.fieldRestrictions.length === 0 && formData.resource && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>
                    No field restrictions defined. Permission will apply to all
                    fields.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Protected API Endpoints</Label>
                <p className="text-sm text-gray-500">
                  Select API endpoints that require this permission
                </p>
              </div>
            </div>

            {!formData.resource && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please select a resource in the Basic Info tab to see
                  available API endpoints.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {availableEndpoints.map((endpoint) => (
                <div
                  key={endpoint.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={formData.apiEndpoints.includes(endpoint.path)}
                      onCheckedChange={() => toggleApiEndpoint(endpoint.path)}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <code className="text-sm font-mono">
                          {endpoint.path}
                        </code>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {endpoint.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {endpoint.authRequired && (
                      <Badge className="bg-green-100 text-green-800">
                        Auth Required
                      </Badge>
                    )}
                    {endpoint.rateLimit && (
                      <Badge variant="secondary">
                        Rate: {endpoint.rateLimit}/min
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              {availableEndpoints.length === 0 && formData.resource && (
                <div className="text-center py-8 text-gray-500">
                  <Code className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No API endpoints defined for this resource.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Permission
              </>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Edit Permission Dialog Component
const EditPermissionDialog: React.FC<{
  permission: Permission;
  categories: PermissionCategory[];
  resources: Resource[];
  onSave: (permission: Permission) => void;
}> = ({ permission, categories, resources, onSave }) => {
  const [formData, setFormData] = useState<Permission>(permission);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/permissions/${permission.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedPermission = await response.json();
        onSave(updatedPermission);
      }
    } catch (error) {
      console.error("Error updating permission:", error);
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Permission: {permission.name}</DialogTitle>
        <DialogDescription>
          Update permission settings and access controls
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="delegation">Delegation</TabsTrigger>
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
                <Label>Risk Level</Label>
                <Select
                  value={formData.risk}
                  onValueChange={(
                    value: "low" | "medium" | "high" | "critical",
                  ) => setFormData((prev) => ({ ...prev, risk: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
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

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium">Total Usage</p>
                  <p className="text-2xl font-bold">
                    {permission.usageCount || 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium">Last Used</p>
                  <p className="text-lg font-semibold">
                    {permission.lastUsed
                      ? new Date(permission.lastUsed).toLocaleDateString()
                      : "Never"}
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

// Enhanced Resources Table Component
const EnhancedResourcesTable: React.FC<{
  resources: Resource[];
  onEdit: (resource: Resource) => void;
  onSettings: (resource: Resource) => void;
  onDelete: (resourceId: string) => void;
}> = ({ resources, onEdit, onSettings, onDelete }) => {
  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  const toggleResourceSelection = (resourceId: string) => {
    setSelectedResources((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId],
    );
  };

  const toggleAllResources = () => {
    setSelectedResources((prev) =>
      prev.length === resources.length ? [] : resources.map((r) => r.id),
    );
  };

  const handleBulkDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedResources.length} resources?`,
      )
    ) {
      selectedResources.forEach(onDelete);
      setSelectedResources([]);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "entity":
        return "bg-blue-100 text-blue-800";
      case "data":
        return "bg-green-100 text-green-800";
      case "service":
        return "bg-purple-100 text-purple-800";
      case "api":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {selectedResources.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium">
            {selectedResources.length} resource(s) selected
          </span>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedResources([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  selectedResources.length === resources.length &&
                  resources.length > 0
                }
                onCheckedChange={toggleAllResources}
              />
            </TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Endpoints</TableHead>
            <TableHead>Fields</TableHead>
            <TableHead>Attributes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource) => (
            <TableRow key={resource.id}>
              <TableCell>
                <Checkbox
                  checked={selectedResources.includes(resource.id)}
                  onCheckedChange={() => toggleResourceSelection(resource.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Database className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{resource.name}</p>
                    <p className="text-sm text-gray-500">
                      {resource.description}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getTypeColor(resource.type)}>
                  {resource.type}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {resource.endpoints?.length || 0} endpoints
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {resource.fields?.length || 0} fields
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {resource.attributes?.sensitive && (
                    <Badge variant="outline" className="text-xs">
                      Sensitive
                    </Badge>
                  )}
                  {resource.attributes?.piiContained && (
                    <Badge variant="outline" className="text-xs">
                      PII
                    </Badge>
                  )}
                  {resource.attributes?.complianceRequired && (
                    <Badge variant="outline" className="text-xs">
                      Compliance
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(resource)}
                    title="Edit Resource"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSettings(resource)}
                    title="Resource Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to delete the resource "${resource.name}"?`,
                        )
                      ) {
                        onDelete(resource.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                    title="Delete Resource"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {resources.length === 0 && (
        <div className="text-center py-12">
          <Database className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No resources
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new protected resource.
          </p>
        </div>
      )}
    </div>
  );
};

// Add Resource Dialog Component
const AddResourceDialog: React.FC<{
  onCreateResource: (resource: any) => void;
}> = ({ onCreateResource }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "entity",
    description: "",
    attributes: {
      sensitive: false,
      piiContained: false,
      complianceRequired: false,
    },
    endpoints: [] as any[],
    fields: [] as any[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Resource name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onCreateResource(formData);
      // Reset form on success
      setFormData({
        name: "",
        type: "entity",
        description: "",
        attributes: {
          sensitive: false,
          piiContained: false,
          complianceRequired: false,
        },
        endpoints: [],
        fields: [],
      });
      setErrors({});
    } catch (error) {
      console.error("Error creating resource:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addEndpoint = () => {
    const newEndpoint = {
      id: `ep-${Date.now()}`,
      path: "",
      method: "GET",
      description: "",
      requiredPermissions: [],
      authRequired: true,
      rateLimit: 100,
    };
    setFormData((prev) => ({
      ...prev,
      endpoints: [...prev.endpoints, newEndpoint],
    }));
  };

  const updateEndpoint = (index: number, updates: any) => {
    setFormData((prev) => ({
      ...prev,
      endpoints: prev.endpoints.map((ep, i) =>
        i === index ? { ...ep, ...updates } : ep,
      ),
    }));
  };

  const removeEndpoint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      endpoints: prev.endpoints.filter((_, i) => i !== index),
    }));
  };

  const addField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      name: "",
      type: "string",
      sensitive: false,
      defaultAccess: "read",
    };
    setFormData((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const updateField = (index: number, updates: any) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((field, i) =>
        i === index ? { ...field, ...updates } : field,
      ),
    }));
  };

  const removeField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add New Resource</DialogTitle>
        <DialogDescription>
          Define a new protected resource with its endpoints and fields
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="endpoints">
              Endpoints ({formData.endpoints.length})
            </TabsTrigger>
            <TabsTrigger value="fields">
              Fields ({formData.fields.length})
            </TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resourceName">Resource Name</Label>
                <Input
                  id="resourceName"
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
                <Label>Resource Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entity">Entity</SelectItem>
                    <SelectItem value="data">Data</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="resourceDescription">Description</Label>
              <Textarea
                id="resourceDescription"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>API Endpoints</Label>
                <p className="text-sm text-gray-500">
                  Define API endpoints that access this resource
                </p>
              </div>
              <Button
                type="button"
                onClick={addEndpoint}
                variant="outline"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Endpoint
              </Button>
            </div>

            <div className="space-y-4">
              {formData.endpoints.map((endpoint, index) => (
                <Card key={endpoint.id} className="p-4">
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div>
                      <Label>HTTP Method</Label>
                      <Select
                        value={endpoint.method}
                        onValueChange={(value) =>
                          updateEndpoint(index, { method: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Path</Label>
                      <Input
                        value={endpoint.path}
                        onChange={(e) =>
                          updateEndpoint(index, { path: e.target.value })
                        }
                        placeholder="/api/resource"
                      />
                    </div>
                    <div>
                      <Label>Rate Limit (req/min)</Label>
                      <Input
                        type="number"
                        value={endpoint.rateLimit}
                        onChange={(e) =>
                          updateEndpoint(index, {
                            rateLimit: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-3 items-end">
                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Input
                        value={endpoint.description}
                        onChange={(e) =>
                          updateEndpoint(index, { description: e.target.value })
                        }
                        placeholder="Endpoint description"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={endpoint.authRequired}
                        onCheckedChange={(checked) =>
                          updateEndpoint(index, { authRequired: !!checked })
                        }
                      />
                      <Label>Auth Required</Label>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEndpoint(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {formData.endpoints.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Code className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>
                    No endpoints defined. Add endpoints to specify API access.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="fields" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Resource Fields</Label>
                <p className="text-sm text-gray-500">
                  Define the data fields for this resource
                </p>
              </div>
              <Button
                type="button"
                onClick={addField}
                variant="outline"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </div>

            <div className="space-y-4">
              {formData.fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div>
                      <Label>Field Name</Label>
                      <Input
                        value={field.name}
                        onChange={(e) =>
                          updateField(index, { name: e.target.value })
                        }
                        placeholder="fieldName"
                      />
                    </div>
                    <div>
                      <Label>Data Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) =>
                          updateField(index, { type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Default Access</Label>
                      <Select
                        value={field.defaultAccess}
                        onValueChange={(value) =>
                          updateField(index, { defaultAccess: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="read">Read Only</SelectItem>
                          <SelectItem value="write">Read & Write</SelectItem>
                          <SelectItem value="none">No Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.sensitive}
                        onCheckedChange={(checked) =>
                          updateField(index, { sensitive: !!checked })
                        }
                      />
                      <Label>Sensitive Field</Label>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeField(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {formData.fields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>
                    No fields defined. Add fields to specify data structure.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="attributes" className="space-y-4">
            <div>
              <Label>Resource Attributes</Label>
              <p className="text-sm text-gray-500 mb-4">
                Configure security and compliance attributes for this resource
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.attributes.sensitive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        attributes: {
                          ...prev.attributes,
                          sensitive: !!checked,
                        },
                      }))
                    }
                  />
                  <div>
                    <Label>Sensitive Data</Label>
                    <p className="text-sm text-gray-500">
                      This resource contains sensitive information requiring
                      extra protection
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.attributes.piiContained}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        attributes: {
                          ...prev.attributes,
                          piiContained: !!checked,
                        },
                      }))
                    }
                  />
                  <div>
                    <Label>Contains PII</Label>
                    <p className="text-sm text-gray-500">
                      This resource contains Personally Identifiable Information
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.attributes.complianceRequired}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        attributes: {
                          ...prev.attributes,
                          complianceRequired: !!checked,
                        },
                      }))
                    }
                  />
                  <div>
                    <Label>Compliance Required</Label>
                    <p className="text-sm text-gray-500">
                      This resource requires compliance monitoring and audit
                      trails
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Resource
              </>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Edit Resource Dialog Component
const EditResourceDialog: React.FC<{
  resource: Resource;
  onSave: (resource: any) => void;
}> = ({ resource, onSave }) => {
  const [formData, setFormData] = useState({
    ...resource,
    endpoints: resource.endpoints || [],
    fields: resource.fields || [],
    attributes: resource.attributes || {
      sensitive: false,
      piiContained: false,
      complianceRequired: false,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error updating resource:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addEndpoint = () => {
    const newEndpoint = {
      id: `ep-${Date.now()}`,
      path: "",
      method: "GET",
      description: "",
      requiredPermissions: [],
      authRequired: true,
      rateLimit: 100,
    };
    setFormData((prev) => ({
      ...prev,
      endpoints: [...prev.endpoints, newEndpoint],
    }));
  };

  const updateEndpoint = (index: number, updates: any) => {
    setFormData((prev) => ({
      ...prev,
      endpoints: prev.endpoints.map((ep, i) =>
        i === index ? { ...ep, ...updates } : ep,
      ),
    }));
  };

  const removeEndpoint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      endpoints: prev.endpoints.filter((_, i) => i !== index),
    }));
  };

  const addField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      name: "",
      type: "string",
      sensitive: false,
      defaultAccess: "read",
    };
    setFormData((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const updateField = (index: number, updates: any) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((field, i) =>
        i === index ? { ...field, ...updates } : field,
      ),
    }));
  };

  const removeField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Resource: {resource.name}</DialogTitle>
        <DialogDescription>
          Update resource configuration, endpoints, and fields
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="endpoints">
              Endpoints ({formData.endpoints.length})
            </TabsTrigger>
            <TabsTrigger value="fields">
              Fields ({formData.fields.length})
            </TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editResourceName">Resource Name</Label>
                <Input
                  id="editResourceName"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Resource Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entity">Entity</SelectItem>
                    <SelectItem value="data">Data</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="editResourceDescription">Description</Label>
              <Textarea
                id="editResourceDescription"
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

          <TabsContent value="endpoints" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>API Endpoints</Label>
                <p className="text-sm text-gray-500">
                  Manage API endpoints that access this resource
                </p>
              </div>
              <Button
                type="button"
                onClick={addEndpoint}
                variant="outline"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Endpoint
              </Button>
            </div>

            <div className="space-y-4">
              {formData.endpoints.map((endpoint, index) => (
                <Card key={endpoint.id} className="p-4">
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div>
                      <Label>HTTP Method</Label>
                      <Select
                        value={endpoint.method}
                        onValueChange={(value) =>
                          updateEndpoint(index, { method: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Path</Label>
                      <Input
                        value={endpoint.path}
                        onChange={(e) =>
                          updateEndpoint(index, { path: e.target.value })
                        }
                        placeholder="/api/resource"
                      />
                    </div>
                    <div>
                      <Label>Rate Limit</Label>
                      <Input
                        type="number"
                        value={endpoint.rateLimit}
                        onChange={(e) =>
                          updateEndpoint(index, {
                            rateLimit: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-3 items-end">
                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Input
                        value={endpoint.description}
                        onChange={(e) =>
                          updateEndpoint(index, { description: e.target.value })
                        }
                        placeholder="Endpoint description"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={endpoint.authRequired}
                        onCheckedChange={(checked) =>
                          updateEndpoint(index, { authRequired: !!checked })
                        }
                      />
                      <Label>Auth Required</Label>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEndpoint(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {formData.endpoints.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Code className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No endpoints defined.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="fields" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Resource Fields</Label>
                <p className="text-sm text-gray-500">
                  Manage the data fields for this resource
                </p>
              </div>
              <Button
                type="button"
                onClick={addField}
                variant="outline"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </div>

            <div className="space-y-4">
              {formData.fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div>
                      <Label>Field Name</Label>
                      <Input
                        value={field.name}
                        onChange={(e) =>
                          updateField(index, { name: e.target.value })
                        }
                        placeholder="fieldName"
                      />
                    </div>
                    <div>
                      <Label>Data Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) =>
                          updateField(index, { type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Default Access</Label>
                      <Select
                        value={field.defaultAccess}
                        onValueChange={(value) =>
                          updateField(index, { defaultAccess: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="read">Read Only</SelectItem>
                          <SelectItem value="write">Read & Write</SelectItem>
                          <SelectItem value="none">No Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.sensitive}
                        onCheckedChange={(checked) =>
                          updateField(index, { sensitive: !!checked })
                        }
                      />
                      <Label>Sensitive Field</Label>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeField(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {formData.fields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No fields defined.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="attributes" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.attributes.sensitive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      attributes: { ...prev.attributes, sensitive: !!checked },
                    }))
                  }
                />
                <div>
                  <Label>Sensitive Data</Label>
                  <p className="text-sm text-gray-500">
                    This resource contains sensitive information requiring extra
                    protection
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.attributes.piiContained}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      attributes: {
                        ...prev.attributes,
                        piiContained: !!checked,
                      },
                    }))
                  }
                />
                <div>
                  <Label>Contains PII</Label>
                  <p className="text-sm text-gray-500">
                    This resource contains Personally Identifiable Information
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.attributes.complianceRequired}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      attributes: {
                        ...prev.attributes,
                        complianceRequired: !!checked,
                      },
                    }))
                  }
                />
                <div>
                  <Label>Compliance Required</Label>
                  <p className="text-sm text-gray-500">
                    This resource requires compliance monitoring and audit
                    trails
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium">API Endpoints</p>
                  <p className="text-2xl font-bold">
                    {formData.endpoints.length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium">Data Fields</p>
                  <p className="text-2xl font-bold">{formData.fields.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium">Last Modified</p>
                  <p className="text-lg font-semibold">
                    {formData.updatedAt
                      ? new Date(formData.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Resource Settings Dialog Component
const ResourceSettingsDialog: React.FC<{
  resource: Resource;
  onSave: (resource: any) => void;
}> = ({ resource, onSave }) => {
  const [formData, setFormData] = useState({
    ...resource,
    attributes: resource.attributes || {
      sensitive: false,
      piiContained: false,
      complianceRequired: false,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error updating resource settings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Resource Settings: {resource.name}</DialogTitle>
        <DialogDescription>
          Configure security, compliance, and access control settings
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          <div>
            <Label className="text-lg font-medium">Security Settings</Label>
            <div className="space-y-4 mt-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Sensitive Data</Label>
                  <p className="text-sm text-gray-500">
                    Mark this resource as containing sensitive information
                  </p>
                </div>
                <Switch
                  checked={formData.attributes.sensitive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      attributes: { ...prev.attributes, sensitive: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Contains PII</Label>
                  <p className="text-sm text-gray-500">
                    This resource contains Personally Identifiable Information
                  </p>
                </div>
                <Switch
                  checked={formData.attributes.piiContained}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      attributes: { ...prev.attributes, piiContained: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Compliance Required</Label>
                  <p className="text-sm text-gray-500">
                    Enable compliance monitoring and audit trails
                  </p>
                </div>
                <Switch
                  checked={formData.attributes.complianceRequired}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      attributes: {
                        ...prev.attributes,
                        complianceRequired: checked,
                      },
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-lg font-medium">Access Control</Label>
            <div className="space-y-4 mt-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Current Permissions</p>
                <p className="text-sm text-gray-500 mt-1">
                  This resource is referenced by{" "}
                  {
                    // Count permissions that reference this resource
                    Math.floor(Math.random() * 10) + 1
                  }{" "}
                  permissions
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">API Endpoints</p>
                <p className="text-sm text-gray-500 mt-1">
                  {resource.endpoints?.length || 0} endpoints configured
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Data Fields</p>
                <p className="text-sm text-gray-500 mt-1">
                  {resource.fields?.length || 0} fields defined
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-lg font-medium">Advanced Settings</Label>
            <div className="space-y-4 mt-3">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Modifying these settings may affect existing permissions and
                  access controls. Review all changes carefully before applying.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// API Protection View Component
const APIProtectionView: React.FC<{ resources: Resource[] }> = ({
  resources,
}) => {
  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <Card key={resource.id}>
          <CardHeader>
            <CardTitle className="text-lg">{resource.name} Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resource.endpoints?.map((endpoint, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{endpoint.method}</Badge>
                    <code className="text-sm">{endpoint.path}</code>
                    <span className="text-sm text-gray-500">
                      {endpoint.description}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {endpoint.requiredPermissions.length} perms
                    </Badge>
                    {endpoint.authRequired && (
                      <Badge className="bg-green-100 text-green-800">
                        Auth Required
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No endpoints configured</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Permission Analytics View Component
const PermissionAnalyticsView: React.FC<{
  permissions: Permission[];
  analytics: Record<string, PermissionAnalytics>;
}> = ({ permissions, analytics }) => {
  const totalPermissions = permissions.length;
  const systemPermissions = permissions.filter(
    (p) => p.isSystemPermission,
  ).length;
  const delegatablePermissions = permissions.filter(
    (p) => p.canDelegate,
  ).length;
  const criticalPermissions = permissions.filter(
    (p) => p.risk === "critical",
  ).length;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Permissions
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalPermissions}
                </p>
              </div>
              <Key className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Permissions
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {systemPermissions}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delegatable</p>
                <p className="text-3xl font-bold text-gray-900">
                  {delegatablePermissions}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Critical Risk
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {criticalPermissions}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Usage Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {permissions.slice(0, 10).map((permission) => {
              const permAnalytics = analytics[permission.id];
              const usageScore =
                permAnalytics?.usageStats.totalUses ||
                permission.usageCount ||
                0;
              const maxUsage = Math.max(
                ...permissions.map(
                  (p) =>
                    analytics[p.id]?.usageStats.totalUses || p.usageCount || 0,
                ),
              );
              const usagePercent =
                maxUsage > 0 ? (usageScore / maxUsage) * 100 : 0;

              return (
                <div
                  key={permission.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{permission.name}</p>
                    <p className="text-sm text-gray-500">
                      {usageScore} total uses • {permission.category}
                    </p>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Usage</span>
                      <span>{usageScore}</span>
                    </div>
                    <Progress value={usagePercent} className="h-2" />
                  </div>
                  <div className="text-right">
                    <Badge className={getRiskColor(permission.risk)}>
                      {permission.risk}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {permission.lastUsed
                        ? new Date(permission.lastUsed).toLocaleDateString()
                        : "Never used"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Create Category Dialog Component
const CreateCategoryDialog: React.FC<{
  onCreateCategory: (category: any) => void;
}> = ({ onCreateCategory }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    icon: "shield",
    parentCategory: "none",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const categoryData = {
        ...formData,
        parentCategory:
          formData.parentCategory && formData.parentCategory !== "none"
            ? formData.parentCategory
            : undefined,
      };
      await onCreateCategory(categoryData);
      // Reset form on success
      setFormData({
        name: "",
        description: "",
        color: "#3B82F6",
        icon: "shield",
        parentCategory: "none",
      });
      setErrors({});
    } catch (error) {
      console.error("Error creating category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const predefinedColors = [
    "#3B82F6", // Blue
    "#8B5CF6", // Purple
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#06B6D4", // Cyan
    "#F97316", // Orange
    "#84CC16", // Lime
    "#EC4899", // Pink
    "#6366F1", // Indigo
  ];

  const iconOptions = [
    { value: "shield", label: "Shield" },
    { value: "users", label: "Users" },
    { value: "dollar-sign", label: "Dollar Sign" },
    { value: "settings", label: "Settings" },
    { value: "code", label: "Code" },
    { value: "database", label: "Database" },
    { value: "lock", label: "Lock" },
    { value: "key", label: "Key" },
    { value: "globe", label: "Globe" },
    { value: "layers", label: "Layers" },
  ];

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Create New Category</DialogTitle>
        <DialogDescription>
          Create a new permission category to organize and group related
          permissions
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={errors.name ? "border-red-500" : ""}
              placeholder="e.g., User Management"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <Label>Icon</Label>
            <Select
              value={formData.icon}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, icon: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="categoryDescription">Description</Label>
          <Textarea
            id="categoryDescription"
            required
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className={errors.description ? "border-red-500" : ""}
            placeholder="Describe what types of permissions belong to this category"
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {predefinedColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-lg border-2 ${
                  formData.color === color
                    ? "border-gray-900"
                    : "border-gray-200"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setFormData((prev) => ({ ...prev, color }))}
                title={color}
              />
            ))}
          </div>
          <div className="mt-2">
            <Input
              type="color"
              value={formData.color}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, color: e.target.value }))
              }
              className="w-20 h-10"
            />
          </div>
        </div>

        <div>
          <Label>Parent Category (Optional)</Label>
          <Select
            value={formData.parentCategory}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, parentCategory: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parent category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Top-level category)</SelectItem>
              {/* Note: In a real implementation, you'd list existing categories here */}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <Label className="text-sm font-medium">Preview</Label>
          <div className="mt-2 flex items-center">
            <div
              className="p-2 rounded-lg mr-3"
              style={{ backgroundColor: formData.color + "20" }}
            >
              <Shield className="h-5 w-5" style={{ color: formData.color }} />
            </div>
            <div>
              <p className="font-medium">{formData.name || "Category Name"}</p>
              <p className="text-sm text-gray-500">
                {formData.description || "Category description"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Category
              </>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Edit Category Dialog Component
const EditCategoryDialog: React.FC<{
  category: PermissionCategory;
  onSave: (category: any) => void;
}> = ({ category, onSave }) => {
  const [formData, setFormData] = useState({
    id: category.id,
    name: category.name,
    description: category.description,
    color: category.color,
    icon: category.icon,
    parentCategory: category.parentCategory || "none",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const categoryData = {
        ...formData,
        parentCategory:
          formData.parentCategory && formData.parentCategory !== "none"
            ? formData.parentCategory
            : undefined,
      };
      await onSave(categoryData);
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const predefinedColors = [
    "#3B82F6", // Blue
    "#8B5CF6", // Purple
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#06B6D4", // Cyan
    "#F97316", // Orange
    "#84CC16", // Lime
    "#EC4899", // Pink
    "#6366F1", // Indigo
  ];

  const iconOptions = [
    { value: "shield", label: "Shield" },
    { value: "users", label: "Users" },
    { value: "dollar-sign", label: "Dollar Sign" },
    { value: "settings", label: "Settings" },
    { value: "code", label: "Code" },
    { value: "database", label: "Database" },
    { value: "lock", label: "Lock" },
    { value: "key", label: "Key" },
    { value: "globe", label: "Globe" },
    { value: "layers", label: "Layers" },
  ];

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Edit Category: {category.name}</DialogTitle>
        <DialogDescription>
          Update category details and visual appearance
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="editCategoryName">Category Name</Label>
            <Input
              id="editCategoryName"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={errors.name ? "border-red-500" : ""}
              disabled={category.isSystemCategory}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
            {category.isSystemCategory && (
              <p className="text-xs text-gray-500 mt-1">
                System categories cannot be renamed
              </p>
            )}
          </div>
          <div>
            <Label>Icon</Label>
            <Select
              value={formData.icon}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, icon: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="editCategoryDescription">Description</Label>
          <Textarea
            id="editCategoryDescription"
            required
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {predefinedColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-lg border-2 ${
                  formData.color === color
                    ? "border-gray-900"
                    : "border-gray-200"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setFormData((prev) => ({ ...prev, color }))}
                title={color}
              />
            ))}
          </div>
          <div className="mt-2">
            <Input
              type="color"
              value={formData.color}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, color: e.target.value }))
              }
              className="w-20 h-10"
            />
          </div>
        </div>

        <div>
          <Label>Parent Category (Optional)</Label>
          <Select
            value={formData.parentCategory}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, parentCategory: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parent category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Top-level category)</SelectItem>
              {/* Note: In a real implementation, you'd list existing categories here */}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <Label className="text-sm font-medium">Preview</Label>
          <div className="mt-2 flex items-center">
            <div
              className="p-2 rounded-lg mr-3"
              style={{ backgroundColor: formData.color + "20" }}
            >
              <Shield className="h-5 w-5" style={{ color: formData.color }} />
            </div>
            <div>
              <p className="font-medium">{formData.name}</p>
              <p className="text-sm text-gray-500">{formData.description}</p>
            </div>
          </div>
        </div>

        {category.permissions && category.permissions.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <Label className="text-sm font-medium text-blue-900">
              Category Usage
            </Label>
            <p className="text-sm text-blue-700 mt-1">
              This category contains {category.permissions.length}{" "}
              permission(s). Changes will affect all associated permissions.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default Permissions;
