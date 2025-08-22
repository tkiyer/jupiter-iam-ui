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
import { Role, CreateRoleRequest, RoleTemplate, RoleConflict, RoleAnalytics, Permission } from '@shared/iam';
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
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([]);
  const [conflicts, setConflicts] = useState<RoleConflict[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, RoleAnalytics>>({});
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('roles');

  useEffect(() => {
    fetchRoles();
    fetchRoleTemplates();
    fetchConflicts();
    fetchPermissions();
  }, []);

  useEffect(() => {
    filterRoles();
  }, [roles, searchTerm, statusFilter, levelFilter]);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();
      setRoles(data.roles || data);
      
      // Fetch analytics for each role
      if (data.roles) {
        const analyticsPromises = data.roles.map((role: Role) => 
          fetch(`/api/roles/${role.id}/analytics`).then(r => r.json())
        );
        const analyticsResults = await Promise.all(analyticsPromises);
        const analyticsMap = data.roles.reduce((acc: Record<string, RoleAnalytics>, role: Role, index: number) => {
          acc[role.id] = analyticsResults[index];
          return acc;
        }, {});
        setAnalytics(analyticsMap);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoleTemplates = async () => {
    try {
      const response = await fetch('/api/roles/templates');
      const data = await response.json();
      setRoleTemplates(data);
    } catch (error) {
      console.error('Error fetching role templates:', error);
    }
  };

  const fetchConflicts = async () => {
    try {
      const response = await fetch('/api/roles/conflicts');
      const data = await response.json();
      setConflicts(data);
    } catch (error) {
      console.error('Error fetching conflicts:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions');
      const data = await response.json();
      setAvailablePermissions(data.permissions || data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setAvailablePermissions([]);
    }
  };

  const filterRoles = () => {
    let filtered = roles;

    if (searchTerm) {
      filtered = filtered.filter(role => 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(role => role.status === statusFilter);
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(role => role.level.toString() === levelFilter);
    }

    setFilteredRoles(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'inactive': return <XCircle className="h-3 w-3" />;
      case 'deprecated': return <AlertTriangle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
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
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCreateRole = async (roleData: CreateRoleRequest) => {
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleData),
      });
      
      if (response.ok) {
        const newRole = await response.json();
        setRoles(prev => [...prev, newRole]);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const handleCreateFromTemplate = async (template: RoleTemplate) => {
    const roleData: CreateRoleRequest = {
      name: `${template.name} Copy`,
      description: template.description,
      permissions: template.permissions,
      organizationUnit: template.organizationUnit,
      isTemplate: false
    };
    await handleCreateRole(roleData);
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
          <p className="text-gray-600 mt-1">Manage RBAC roles, permissions, and hierarchies</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </DialogTrigger>
            <CreateRoleDialog 
              onCreateRole={handleCreateRole}
              availablePermissions={availablePermissions}
              parentRoles={roles.filter(r => r.status === 'active')}
            />
          </Dialog>
        </div>
      </div>

      {/* Conflicts Alert */}
      {conflicts.filter(c => !c.resolved && c.severity === 'critical').length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {conflicts.filter(c => !c.resolved && c.severity === 'critical').length} critical role conflicts detected. 
            <Button variant="link" className="p-0 ml-1 text-red-800" onClick={() => setActiveTab('conflicts')}>
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
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getLevelIcon(role.level)}
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              <span>{role.name}</span>
                              {role.isSystemRole && (
                                <Badge variant="secondary" className="text-xs">System</Badge>
                              )}
                              {role.isTemplate && (
                                <Badge variant="outline" className="text-xs">Template</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{role.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("flex items-center gap-1 w-fit", getStatusColor(role.status))}>
                          {getStatusIcon(role.status)}
                          {role.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">Level {role.level}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{analytics[role.id]?.userCount || role.userCount || 0}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm">{role.permissions.length}</span>
                          {role.inheritedPermissions && role.inheritedPermissions.length > 0 && (
                            <span className="text-xs text-gray-500">
                              (+{role.inheritedPermissions.length} inherited)
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {role.lastUsed ? new Date(role.lastUsed).toLocaleDateString() : 'Never'}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Layers className="mr-2 h-5 w-5" />
                  Role Templates
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(roleTemplates || []).map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{template.category}</Badge>
                        <span className="text-sm text-gray-500">Level {template.level}</span>
                      </div>
                      <div className="text-sm">
                        <p><strong>Permissions:</strong> {template.permissions.length}</p>
                        <p><strong>Usage:</strong> {template.usageCount} times</p>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleCreateFromTemplate(template)}
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                  <Card key={conflict.id} className={cn("border", getConflictSeverityColor(conflict.severity))}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getConflictSeverityColor(conflict.severity)}>
                              {conflict.severity}
                            </Badge>
                            <span className="text-sm font-medium">{conflict.type.replace('_', ' ')}</span>
                            {conflict.resolved && (
                              <Badge variant="outline" className="text-green-600">Resolved</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{conflict.description}</p>
                          <p className="text-sm font-medium">Affected roles: {conflict.roles.join(', ')}</p>
                          <p className="text-xs text-gray-500 mt-1">Suggestion: {conflict.suggestion}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Resolve</Button>
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Roles</p>
                    <p className="text-3xl font-bold text-gray-900">{roles.length}</p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Roles</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {roles.filter(r => r.status === 'active').length}
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
                    <p className="text-sm font-medium text-gray-600">Conflicts</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {conflicts.filter(c => !c.resolved).length}
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
                    <p className="text-sm font-medium text-gray-600">Templates</p>
                    <p className="text-3xl font-bold text-gray-900">{roleTemplates.length}</p>
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
            parentRoles={roles.filter(r => r.status === 'active' && r.id !== selectedRole.id)}
            onSave={(updatedRole) => {
              setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
              setIsEditDialogOpen(false);
            }}
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
    name: '',
    description: '',
    permissions: [],
    isTemplate: false
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
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Organization Unit</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, organizationUnit: value }))}>
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
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isTemplate"
                checked={formData.isTemplate}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isTemplate: !!checked }))}
              />
              <Label htmlFor="isTemplate">Create as template</Label>
            </div>
          </TabsContent>
          
          <TabsContent value="permissions" className="space-y-4">
            <div>
              <Label>Select Permissions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-64 overflow-y-auto">
                {Array.isArray(availablePermissions) ? availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={formData.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({ ...prev, permissions: [...prev.permissions, permission.id] }));
                        } else {
                          setFormData(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== permission.id) }));
                        }
                      }}
                    />
                    <Label htmlFor={permission.id} className="text-sm">
                      {permission.name}
                      <span className="text-xs text-gray-500 block">{permission.description}</span>
                    </Label>
                  </div>
                )) : []}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="hierarchy" className="space-y-4">
            <div>
              <Label>Parent Role (Optional)</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, parentRole: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent role" />
                </SelectTrigger>
                <SelectContent>
                  {(parentRoles || []).map((role) => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="datetime-local"
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Create Role</Button>
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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const updatedRole = await response.json();
        onSave(updatedRole);
      }
    } catch (error) {
      console.error('Error updating role:', error);
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
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value: 'active' | 'pending' | 'inactive' | 'deprecated') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
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
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="permissions" className="space-y-4">
            <div>
              <Label>Assigned Permissions ({formData.permissions.length})</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-64 overflow-y-auto">
                {Array.isArray(availablePermissions) ? availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${permission.id}`}
                      checked={formData.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({ ...prev, permissions: [...prev.permissions, permission.id] }));
                        } else {
                          setFormData(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== permission.id) }));
                        }
                      }}
                    />
                    <Label htmlFor={`edit-${permission.id}`} className="text-sm">
                      {permission.name}
                    </Label>
                  </div>
                )) : []}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="hierarchy" className="space-y-4">
            <div>
              <Label>Parent Role</Label>
              <Select
                value={formData.parentRole || 'none'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, parentRole: value === 'none' ? undefined : value }))}
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
                <Label>Inherited Permissions ({formData.inheritedPermissions.length})</Label>
                <div className="text-sm text-gray-600 mt-1">
                  {(formData.inheritedPermissions || []).map((permId, index) => {
                    const perm = Array.isArray(availablePermissions) ? availablePermissions.find(p => p.id === permId) : null;
                    return perm ? (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">
                        {perm.name}
                      </Badge>
                    ) : null;
                  })}
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
                  value={formData.validFrom ? new Date(formData.validFrom).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editValidUntil">Valid Until</Label>
                <Input
                  id="editValidUntil"
                  type="datetime-local"
                  value={formData.validUntil ? new Date(formData.validUntil).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
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
                  <p className="text-2xl font-bold">{role.permissions.length}</p>
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

// Role Hierarchy Visualization Component
const RoleHierarchyView: React.FC<{ roles: Role[] }> = ({ roles }) => {
  const getLevelIcon = (level: number) => {
    if (level >= 4) return <Crown className="h-4 w-4 text-purple-600" />;
    if (level >= 3) return <Shield className="h-4 w-4 text-blue-600" />;
    if (level >= 2) return <Users className="h-4 w-4 text-green-600" />;
    return <User className="h-4 w-4 text-gray-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const buildHierarchy = (roles: Role[]) => {
    const roleMap = new Map(roles.map(role => [role.id, role]));
    const hierarchy: Role[] = [];

    roles.forEach(role => {
      if (!role.parentRole) {
        hierarchy.push(role);
      }
    });

    return hierarchy;
  };

  const renderRoleNode = (role: Role, level: number = 0) => {
    const children = roles.filter(r => r.parentRole === role.id);

    return (
      <div key={role.id} className={`ml-${level * 4}`}>
        <div className="flex items-center space-x-2 p-2 border rounded-lg mb-2">
          {getLevelIcon(role.level)}
          <span className="font-medium">{role.name}</span>
          <Badge className={cn(getStatusColor(role.status))}>{role.status}</Badge>
          <span className="text-sm text-gray-500">({role.permissions.length} permissions)</span>
        </div>
        {children.map(child => renderRoleNode(child, level + 1))}
      </div>
    );
  };

  const rootRoles = buildHierarchy(roles);

  return (
    <div className="space-y-2">
      {rootRoles.map(role => renderRoleNode(role))}
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
      {roles.slice(0, 10).map(role => {
        const roleAnalytics = analytics[role.id];
        const usageScore = roleAnalytics?.usageMetrics.frequency === 'high' ? 90 : 
                          roleAnalytics?.usageMetrics.frequency === 'medium' ? 60 : 
                          roleAnalytics?.usageMetrics.frequency === 'low' ? 30 : 10;
        
        return (
          <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <p className="font-medium">{role.name}</p>
              <p className="text-sm text-gray-500">
                {roleAnalytics?.userCount || 0} users • {role.permissions.length} permissions
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

export default Roles;
