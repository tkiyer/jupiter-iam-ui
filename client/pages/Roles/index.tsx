import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Download, Plus, AlertTriangle } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { useRoles } from "@/hooks/useRoles";
import { useRoleConflicts } from "@/hooks/useRoleConflicts";
import { RolesList } from "@/components/roles/RolesList";
import { RoleHierarchy } from "@/components/roles/RoleHierarchy";
import { RoleTemplates } from "@/components/roles/RoleTemplates";
import { RoleConflicts } from "@/components/roles/RoleConflicts";
import { RoleAnalytics } from "@/components/roles/RoleAnalytics";
import { CreateRoleDialog } from "@/components/roles/CreateRoleDialog";
import { EditRoleDialog } from "@/components/roles/EditRoleDialog";

const Roles: React.FC = () => {
  const [activeTab, setActiveTab] = useState("roles");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { roles, isLoading, createRole, updateRole } = useRoles();
  const { conflicts } = useRoleConflicts();

  const criticalConflicts = conflicts.filter(
    (c) => !c.resolved && c.severity === "critical"
  );

  const handleCreateRole = async (roleData) => {
    await createRole(roleData);
    setIsCreateDialogOpen(false);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsEditDialogOpen(true);
  };

  const handleSaveRole = async (updatedRole) => {
    await updateRole(updatedRole);
    setIsEditDialogOpen(false);
    setSelectedRole(null);
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
            <CreateRoleDialog onCreateRole={handleCreateRole} />
          </Dialog>
        </div>
      </div>

      {/* Conflicts Alert */}
      {criticalConflicts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {criticalConflicts.length} critical role conflicts detected.
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

        <TabsContent value="roles" className="space-y-6">
          <RolesList roles={roles} onEditRole={handleEditRole} />
        </TabsContent>

        <TabsContent value="hierarchy" className="space-y-6">
          <RoleHierarchy roles={roles} />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <RoleTemplates />
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-6">
          <RoleConflicts conflicts={conflicts} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <RoleAnalytics roles={roles} />
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      {selectedRole && (
        <EditRoleDialog
          role={selectedRole}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSaveRole}
        />
      )}
    </div>
  );
};

export default Roles;
