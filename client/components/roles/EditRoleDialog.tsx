import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PermissionSelector from "@/components/role-management/PermissionSelector";
import { Role } from "@shared/iam";
import { usePermissions } from "@/hooks/usePermissions";

interface EditRoleDialogProps {
  role: Role;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (role: Role) => void;
}

export const EditRoleDialog: React.FC<EditRoleDialogProps> = ({
  role,
  isOpen,
  onOpenChange,
  onSave,
}) => {
  const { permissions: availablePermissions } = usePermissions();
  const [formData, setFormData] = useState<Role>(role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                        ? new Date(formData.validFrom)
                            .toISOString()
                            .slice(0, 16)
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
                        ? new Date(formData.validUntil)
                            .toISOString()
                            .slice(0, 16)
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
