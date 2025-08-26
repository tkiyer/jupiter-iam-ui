import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Download, Plus, RefreshCw, AlertTriangle } from "lucide-react";

import { usePermissions } from "@/hooks/usePermissions";
import { usePermissionCategories } from "@/hooks/usePermissionCategories";
import { useResources } from "@/hooks/useResources";
import { usePermissionOptimizations } from "@/hooks/usePermissionOptimizations";

import { PermissionsList } from "@/components/permissions/PermissionsList";
import { CategoriesView } from "@/components/permissions/CategoriesView";
import { ResourcesView } from "@/components/permissions/ResourcesView";
import { APIProtectionView } from "@/components/permissions/APIProtectionView";
import { PermissionAnalytics } from "@/components/permissions/PermissionAnalytics";
import { PermissionOptimization } from "@/components/permissions/PermissionOptimization";
import { CreatePermissionDialog } from "@/components/permissions/CreatePermissionDialog";
import { EditPermissionDialog } from "@/components/permissions/EditPermissionDialog";

const Permissions: React.FC = () => {
  const [activeTab, setActiveTab] = useState("permissions");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    permissions,
    analytics,
    isLoading,
    createPermission,
    updatePermission,
  } = usePermissions();
  const { categories } = usePermissionCategories();
  const { resources } = useResources();
  const { optimizations } = usePermissionOptimizations();

  const criticalOptimizations = optimizations.filter(
    (o) => o.severity === "critical",
  );

  const handleCreatePermission = async (permissionData) => {
    await createPermission(permissionData);
    setIsCreateDialogOpen(false);
  };

  const handleEditPermission = (permission) => {
    setSelectedPermission(permission);
    setIsEditDialogOpen(true);
  };

  const handleSavePermission = async (updatedPermission) => {
    await updatePermission(updatedPermission);
    setIsEditDialogOpen(false);
    setSelectedPermission(null);
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
      {criticalOptimizations.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {criticalOptimizations.length} critical optimization opportunities
            detected.
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

        <TabsContent value="permissions" className="space-y-6">
          <PermissionsList
            permissions={permissions}
            onEditPermission={handleEditPermission}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CategoriesView categories={categories} />
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <ResourcesView resources={resources} />
        </TabsContent>

        <TabsContent value="api-protection" className="space-y-6">
          <APIProtectionView resources={resources} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PermissionAnalytics
            permissions={permissions}
            analytics={analytics}
          />
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <PermissionOptimization optimizations={optimizations} />
        </TabsContent>
      </Tabs>

      {/* Edit Permission Dialog */}
      {selectedPermission && (
        <EditPermissionDialog
          permission={selectedPermission}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSavePermission}
          categories={categories}
          resources={resources}
        />
      )}
    </div>
  );
};

export default Permissions;
