import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Permission, 
  PermissionCategory, 
  Resource, 
  PermissionAnalytics, 
  PermissionOptimization,
  PermissionCondition,
  FieldRestriction,
  ResourceEndpoint
} from '@shared/iam';
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
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>([]);
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, PermissionAnalytics>>({});
  const [optimizations, setOptimizations] = useState<PermissionOptimization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('permissions');

  useEffect(() => {
    fetchPermissions();
    fetchCategories();
    fetchResources();
    fetchOptimizations();
  }, []);

  useEffect(() => {
    filterPermissions();
  }, [permissions, searchTerm, categoryFilter, scopeFilter, riskFilter]);

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions');
      const data = await response.json();
      setPermissions(data.permissions || data);
      
      // Fetch analytics for each permission
      if (data.permissions) {
        const analyticsPromises = data.permissions.map((permission: Permission) => 
          fetch(`/api/permissions/${permission.id}/analytics`).then(r => r.json())
        );
        const analyticsResults = await Promise.all(analyticsPromises);
        const analyticsMap = data.permissions.reduce((acc: Record<string, PermissionAnalytics>, permission: Permission, index: number) => {
          acc[permission.id] = analyticsResults[index];
          return acc;
        }, {});
        setAnalytics(analyticsMap);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/permissions/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources');
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const fetchOptimizations = async () => {
    try {
      const response = await fetch('/api/permissions/optimizations');
      const data = await response.json();
      setOptimizations(data);
    } catch (error) {
      console.error('Error fetching optimizations:', error);
    }
  };

  const filterPermissions = () => {
    let filtered = permissions;

    if (searchTerm) {
      filtered = filtered.filter(permission => 
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.resource.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(permission => permission.category === categoryFilter);
    }

    if (scopeFilter !== 'all') {
      filtered = filtered.filter(permission => permission.scope === scopeFilter);
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter(permission => permission.risk === riskFilter);
    }

    setFilteredPermissions(filtered);
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'global': return <Globe className="h-4 w-4 text-purple-600" />;
      case 'resource': return <Database className="h-4 w-4 text-blue-600" />;
      case 'field': return <FileText className="h-4 w-4 text-green-600" />;
      case 'api': return <Code className="h-4 w-4 text-orange-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOptimizationColor = (type: string) => {
    switch (type) {
      case 'cleanup': return 'bg-blue-100 text-blue-800';
      case 'consolidation': return 'bg-purple-100 text-purple-800';
      case 'deprecation': return 'bg-yellow-100 text-yellow-800';
      case 'risk_reduction': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreatePermission = async (permissionData: any) => {
    try {
      const response = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissionData),
      });
      
      if (response.ok) {
        const newPermission = await response.json();
        setPermissions(prev => [...prev, newPermission]);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating permission:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Permission Management</h1>
          <p className="text-gray-600 mt-1">Granular access control with resource-based permissions</p>
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
      {optimizations.filter(o => o.severity === 'critical').length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {optimizations.filter(o => o.severity === 'critical').length} critical optimization opportunities detected. 
            <Button variant="link" className="p-0 ml-1 text-red-800" onClick={() => setActiveTab('optimization')}>
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
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
                  {filteredPermissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Key className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              <span>{permission.name}</span>
                              {permission.isSystemPermission && (
                                <Badge variant="secondary" className="text-xs">System</Badge>
                              )}
                              {permission.canDelegate && (
                                <Badge variant="outline" className="text-xs">Delegatable</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{permission.description}</p>
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
                          <span className="text-sm capitalize">{permission.scope}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("flex items-center gap-1 w-fit", getRiskColor(permission.risk))}>
                          {permission.risk === 'critical' && <AlertTriangle className="h-3 w-3" />}
                          {permission.risk === 'high' && <AlertTriangle className="h-3 w-3" />}
                          {permission.risk === 'medium' && <Clock className="h-3 w-3" />}
                          {permission.risk === 'low' && <CheckCircle className="h-3 w-3" />}
                          {permission.risk}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{analytics[permission.id]?.usageStats.totalUses || permission.usageCount || 0} uses</p>
                          <p className="text-gray-500">
                            {permission.lastUsed ? new Date(permission.lastUsed).toLocaleDateString() : 'Never'}
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
                          <Button variant="ghost" size="sm" className="text-red-600">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Layers className="mr-2 h-5 w-5" />
                  Permission Categories
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Category
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <div 
                          className={`p-2 rounded-lg mr-3`}
                          style={{ backgroundColor: category.color + '20' }}
                        >
                          <Shield className="h-5 w-5" style={{ color: category.color }} />
                        </div>
                        {category.name}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Permissions</span>
                        <Badge variant="secondary">{category.permissions.length}</Badge>
                      </div>
                      {category.isSystemCategory && (
                        <Badge variant="outline" className="text-xs">System Category</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Protected Resources
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Resource
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResourcesTable resources={resources} />
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
          <PermissionAnalyticsView permissions={permissions} analytics={analytics} />
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
                            <Badge className={getOptimizationColor(optimization.type)}>
                              {optimization.type.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className={getRiskColor(optimization.severity)}>
                              {optimization.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{optimization.description}</p>
                          <p className="text-sm font-medium">Affected permissions: {optimization.permissions.length}</p>
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
                          <Button variant="outline" size="sm">Apply</Button>
                          <Button variant="ghost" size="sm">Dismiss</Button>
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
              setPermissions(prev => prev.map(p => p.id === updatedPermission.id ? updatedPermission : p));
              setIsEditDialogOpen(false);
            }}
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
    name: '',
    description: '',
    resource: '',
    action: '',
    category: '',
    scope: 'resource',
    risk: 'low',
    canDelegate: false,
    complianceRequired: false,
    conditions: [] as PermissionCondition[],
    fieldRestrictions: [] as FieldRestriction[],
    apiEndpoints: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreatePermission(formData);
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="fields">Field Access</TabsTrigger>
            <TabsTrigger value="api">API Endpoints</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Permission Name</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Action</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, action: value }))}>
                  <SelectTrigger>
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
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Resource</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, resource: value }))}>
                  <SelectTrigger>
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
              </div>
              <div>
                <Label>Category</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
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
              </div>
              <div>
                <Label>Risk Level</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, risk: value }))}>
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canDelegate"
                  checked={formData.canDelegate}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, canDelegate: !!checked }))}
                />
                <Label htmlFor="canDelegate">Can be delegated</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="complianceRequired"
                  checked={formData.complianceRequired}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, complianceRequired: !!checked }))}
                />
                <Label htmlFor="complianceRequired">Compliance required</Label>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="conditions" className="space-y-4">
            <div>
              <Label>Access Conditions</Label>
              <p className="text-sm text-gray-500 mb-4">
                Define contextual conditions for when this permission applies
              </p>
              <Button type="button" variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Condition
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="fields" className="space-y-4">
            <div>
              <Label>Field-Level Restrictions</Label>
              <p className="text-sm text-gray-500 mb-4">
                Control access to specific fields within the resource
              </p>
              <Button type="button" variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Field Restriction
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="api" className="space-y-4">
            <div>
              <Label>Protected API Endpoints</Label>
              <p className="text-sm text-gray-500 mb-4">
                Select API endpoints that require this permission
              </p>
              <Button type="button" variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Endpoint
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Create Permission</Button>
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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const updatedPermission = await response.json();
        onSave(updatedPermission);
      }
    } catch (error) {
      console.error('Error updating permission:', error);
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
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Risk Level</Label>
                <Select 
                  value={formData.risk}
                  onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                    setFormData(prev => ({ ...prev, risk: value }))
                  }
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
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium">Total Usage</p>
                  <p className="text-2xl font-bold">{permission.usageCount || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium">Last Used</p>
                  <p className="text-lg font-semibold">
                    {permission.lastUsed ? new Date(permission.lastUsed).toLocaleDateString() : 'Never'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Resources Table Component
const ResourcesTable: React.FC<{ resources: Resource[] }> = ({ resources }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Resource</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Endpoints</TableHead>
          <TableHead>Fields</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resources.map((resource) => (
          <TableRow key={resource.id}>
            <TableCell>
              <div className="flex items-center space-x-3">
                <Database className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{resource.name}</p>
                  <p className="text-sm text-gray-500">{resource.description}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{resource.type}</Badge>
            </TableCell>
            <TableCell>
              <span className="text-sm">{resource.endpoints?.length || 0} endpoints</span>
            </TableCell>
            <TableCell>
              <span className="text-sm">{resource.fields?.length || 0} fields</span>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// API Protection View Component
const APIProtectionView: React.FC<{ resources: Resource[] }> = ({ resources }) => {
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
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{endpoint.method}</Badge>
                    <code className="text-sm">{endpoint.path}</code>
                    <span className="text-sm text-gray-500">{endpoint.description}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{endpoint.requiredPermissions.length} perms</Badge>
                    {endpoint.authRequired && (
                      <Badge className="bg-green-100 text-green-800">Auth Required</Badge>
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
  const systemPermissions = permissions.filter(p => p.isSystemPermission).length;
  const delegatablePermissions = permissions.filter(p => p.canDelegate).length;
  const criticalPermissions = permissions.filter(p => p.risk === 'critical').length;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
                <p className="text-sm font-medium text-gray-600">Total Permissions</p>
                <p className="text-3xl font-bold text-gray-900">{totalPermissions}</p>
              </div>
              <Key className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Permissions</p>
                <p className="text-3xl font-bold text-gray-900">{systemPermissions}</p>
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
                <p className="text-3xl font-bold text-gray-900">{delegatablePermissions}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Risk</p>
                <p className="text-3xl font-bold text-gray-900">{criticalPermissions}</p>
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
            {permissions.slice(0, 10).map(permission => {
              const permAnalytics = analytics[permission.id];
              const usageScore = permAnalytics?.usageStats.totalUses || permission.usageCount || 0;
              const maxUsage = Math.max(...permissions.map(p => analytics[p.id]?.usageStats.totalUses || p.usageCount || 0));
              const usagePercent = maxUsage > 0 ? (usageScore / maxUsage) * 100 : 0;
              
              return (
                <div key={permission.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                      {permission.lastUsed ? new Date(permission.lastUsed).toLocaleDateString() : 'Never used'}
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

export default Permissions;
