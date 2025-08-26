import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import PermissionSelector from "@/components/role-management/PermissionSelector";
import { CreateRoleRequest, Permission, Role } from "@shared/iam";
import { usePermissions } from "@/hooks/usePermissions";

interface CreateRoleDialogProps {
  onCreateRole: (role: CreateRoleRequest) => void;
}

export const CreateRoleDialog: React.FC<CreateRoleDialogProps> = ({
  onCreateRole,
}) => {
  const { permissions: availablePermissions } = usePermissions();
  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: "",
    description: "",
    permissions: [],
    isTemplate: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Role name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
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
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
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
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
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
                  {/* Parent roles would be passed as props in real implementation */}
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
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
