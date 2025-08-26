import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Filter,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Shield,
  Database,
  Globe,
  FileText,
  Code,
  Users,
  Settings,
  Zap,
  Lock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  Circle,
  Square,
  CheckSquare
} from "lucide-react";
import { Permission } from "@shared/iam";
import { cn } from "@/lib/utils";

interface PermissionSelectorProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  className?: string;
}

interface GroupedPermissions {
  [category: string]: {
    [resource: string]: Permission[];
  };
}

const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  permissions,
  selectedPermissions,
  onSelectionChange,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'risk'>('name');

  // Memoized filtered and grouped permissions
  const { filteredPermissions, groupedPermissions, categories, resources } = useMemo(() => {
    let filtered = permissions.filter(permission => {
      const matchesSearch = searchTerm === "" || 
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.resource.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || permission.category === categoryFilter;
      const matchesResource = resourceFilter === "all" || permission.resource === resourceFilter;
      const matchesRisk = riskFilter === "all" || permission.risk === riskFilter;
      const matchesScope = scopeFilter === "all" || permission.scope === scopeFilter;

      return matchesSearch && matchesCategory && matchesResource && matchesRisk && matchesScope;
    });

    // Sort permissions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
        case 'risk':
          const riskOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          return (riskOrder[b.risk as keyof typeof riskOrder] || 0) - (riskOrder[a.risk as keyof typeof riskOrder] || 0);
        default:
          return 0;
      }
    });

    // Group permissions by category and resource
    const grouped: GroupedPermissions = {};
    filtered.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = {};
      }
      if (!grouped[permission.category][permission.resource]) {
        grouped[permission.category][permission.resource] = [];
      }
      grouped[permission.category][permission.resource].push(permission);
    });

    // Extract unique categories and resources
    const uniqueCategories = Array.from(new Set(permissions.map(p => p.category))).sort();
    const uniqueResources = Array.from(new Set(permissions.map(p => p.resource))).sort();

    return {
      filteredPermissions: filtered,
      groupedPermissions: grouped,
      categories: uniqueCategories,
      resources: uniqueResources
    };
  }, [permissions, searchTerm, categoryFilter, resourceFilter, riskFilter, scopeFilter, sortBy]);

  // Permission selection handlers
  const handlePermissionToggle = useCallback((permissionId: string) => {
    const newSelection = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter(id => id !== permissionId)
      : [...selectedPermissions, permissionId];
    onSelectionChange(newSelection);
  }, [selectedPermissions, onSelectionChange]);

  const handleBulkAction = useCallback((action: 'selectAll' | 'selectNone' | 'selectFiltered') => {
    switch (action) {
      case 'selectAll':
        onSelectionChange(permissions.map(p => p.id));
        break;
      case 'selectNone':
        onSelectionChange([]);
        break;
      case 'selectFiltered':
        const filteredIds = filteredPermissions.map(p => p.id);
        const newSelection = Array.from(new Set([...selectedPermissions, ...filteredIds]));
        onSelectionChange(newSelection);
        break;
    }
  }, [permissions, filteredPermissions, selectedPermissions, onSelectionChange]);

  const handleCategoryToggle = useCallback((category: string) => {
    const categoryPermissions = Object.values(groupedPermissions[category] || {}).flat();
    const categoryIds = categoryPermissions.map(p => p.id);
    const allSelected = categoryIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      onSelectionChange(selectedPermissions.filter(id => !categoryIds.includes(id)));
    } else {
      const newSelection = Array.from(new Set([...selectedPermissions, ...categoryIds]));
      onSelectionChange(newSelection);
    }
  }, [groupedPermissions, selectedPermissions, onSelectionChange]);

  const handleResourceToggle = useCallback((category: string, resource: string) => {
    const resourcePermissions = groupedPermissions[category]?.[resource] || [];
    const resourceIds = resourcePermissions.map(p => p.id);
    const allSelected = resourceIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      onSelectionChange(selectedPermissions.filter(id => !resourceIds.includes(id)));
    } else {
      const newSelection = Array.from(new Set([...selectedPermissions, ...resourceIds]));
      onSelectionChange(newSelection);
    }
  }, [groupedPermissions, selectedPermissions, onSelectionChange]);

  // UI helpers
  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case "global": return <Globe className="h-3 w-3 text-purple-600" />;
      case "resource": return <Database className="h-3 w-3 text-blue-600" />;
      case "field": return <FileText className="h-3 w-3 text-green-600" />;
      case "api": return <Code className="h-3 w-3 text-orange-600" />;
      default: return <Shield className="h-3 w-3 text-gray-600" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategorySelectionState = (category: string) => {
    const categoryPermissions = Object.values(groupedPermissions[category] || {}).flat();
    const selectedCount = categoryPermissions.filter(p => selectedPermissions.includes(p.id)).length;
    const totalCount = categoryPermissions.length;

    if (selectedCount === 0) return 'none';
    if (selectedCount === totalCount) return 'all';
    return 'partial';
  };

  const getResourceSelectionState = (category: string, resource: string) => {
    const resourcePermissions = groupedPermissions[category]?.[resource] || [];
    const selectedCount = resourcePermissions.filter(p => selectedPermissions.includes(p.id)).length;
    const totalCount = resourcePermissions.length;

    if (selectedCount === 0) return 'none';
    if (selectedCount === totalCount) return 'all';
    return 'partial';
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const toggleResourceExpansion = (resourceKey: string) => {
    setExpandedResources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceKey)) {
        newSet.delete(resourceKey);
      } else {
        newSet.add(resourceKey);
      }
      return newSet;
    });
  };

  // Statistics
  const selectedCount = selectedPermissions.length;
  const totalCount = permissions.length;
  const filteredCount = filteredPermissions.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Permission Filters</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grouped' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grouped')}
              >
                Grouped
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search permissions by name, description, or resource..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {resources.map(resource => (
                  <SelectItem key={resource} value={resource}>
                    {resource}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={scopeFilter} onValueChange={setScopeFilter}>
              <SelectTrigger className="h-8">
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
          </div>

          {/* Sort and Bulk Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Sort by:</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="risk">Risk Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleBulkAction('selectFiltered')}
                disabled={filteredCount === 0}
              >
                <Plus className="h-3 w-3 mr-1" />
                Select Filtered ({filteredCount})
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleBulkAction('selectAll')}
              >
                <CheckSquare className="h-3 w-3 mr-1" />
                All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleBulkAction('selectNone')}
              >
                <Square className="h-3 w-3 mr-1" />
                None
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection Summary */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <span className="font-medium">{selectedCount}</span> of <span className="font-medium">{totalCount}</span> permissions selected
          {filteredCount !== totalCount && (
            <span className="text-gray-600"> • Showing {filteredCount} filtered</span>
          )}
        </AlertDescription>
      </Alert>

      {/* Permissions Display */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {viewMode === 'grouped' ? (
              <div className="p-4 space-y-4">
                {Object.entries(groupedPermissions).map(([category, resources]) => {
                  const categoryState = getCategorySelectionState(category);
                  const isExpanded = expandedCategories.has(category);
                  
                  return (
                    <div key={category} className="space-y-2">
                      {/* Category Header */}
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto"
                          onClick={() => toggleCategoryExpansion(category)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Checkbox
                          checked={categoryState === 'all'}
                          className={categoryState === 'partial' ? 'data-[state=checked]:bg-orange-500' : ''}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{category}</span>
                            <Badge variant="secondary" className="text-xs">
                              {Object.values(resources).flat().length} permissions
                            </Badge>
                          </div>
                          
                          {categoryState !== 'none' && (
                            <Badge variant="outline" className="text-xs">
                              {Object.values(resources).flat().filter(p => selectedPermissions.includes(p.id)).length} selected
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Category Resources */}
                      {isExpanded && (
                        <div className="ml-6 space-y-2">
                          {Object.entries(resources).map(([resource, permissions]) => {
                            const resourceKey = `${category}-${resource}`;
                            const resourceState = getResourceSelectionState(category, resource);
                            const isResourceExpanded = expandedResources.has(resourceKey);
                            
                            return (
                              <div key={resourceKey} className="space-y-1">
                                {/* Resource Header */}
                                <div className="flex items-center gap-2 p-2 bg-gray-25 rounded border">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 h-auto"
                                    onClick={() => toggleResourceExpansion(resourceKey)}
                                  >
                                    {isResourceExpanded ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                  </Button>
                                  
                                  <Checkbox
                                    checked={resourceState === 'all'}
                                    className={resourceState === 'partial' ? 'data-[state=checked]:bg-orange-500' : ''}
                                    onCheckedChange={() => handleResourceToggle(category, resource)}
                                  />
                                  
                                  <div className="flex-1 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Database className="h-3 w-3 text-gray-500" />
                                      <span className="text-sm font-medium">{resource}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {permissions.length}
                                      </Badge>
                                    </div>
                                    
                                    {resourceState !== 'none' && (
                                      <Badge variant="secondary" className="text-xs">
                                        {permissions.filter(p => selectedPermissions.includes(p.id)).length} selected
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Resource Permissions */}
                                {isResourceExpanded && (
                                  <div className="ml-6 space-y-1">
                                    {permissions.map(permission => (
                                      <div
                                        key={permission.id}
                                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded border"
                                      >
                                        <Checkbox
                                          checked={selectedPermissions.includes(permission.id)}
                                          onCheckedChange={() => handlePermissionToggle(permission.id)}
                                        />
                                        
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            {getScopeIcon(permission.scope)}
                                            <span className="text-sm font-medium">{permission.name}</span>
                                            <Badge className={cn("text-xs", getRiskColor(permission.risk))}>
                                              {permission.risk}
                                            </Badge>
                                          </div>
                                          <p className="text-xs text-gray-600">{permission.description}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="p-4 space-y-1">
                {filteredPermissions.map(permission => (
                  <div
                    key={permission.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded border"
                  >
                    <Checkbox
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={() => handlePermissionToggle(permission.id)}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getScopeIcon(permission.scope)}
                        <span className="font-medium">{permission.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {permission.category}
                        </Badge>
                        <Badge className={cn("text-xs", getRiskColor(permission.risk))}>
                          {permission.risk}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Database className="h-3 w-3" />
                        <span>{permission.resource}</span>
                        <span>•</span>
                        <span>{permission.description}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {filteredPermissions.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No permissions found matching your criteria.</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setResourceFilter("all");
                    setRiskFilter("all");
                    setScopeFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionSelector;
