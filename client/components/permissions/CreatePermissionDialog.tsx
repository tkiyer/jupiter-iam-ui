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
import { PermissionCategory, Resource } from "@shared/iam";

interface CreatePermissionDialogProps {
  onCreatePermission: (permission: any) => void;
  categories: PermissionCategory[];
  resources: Resource[];
}

export const CreatePermissionDialog: React.FC<CreatePermissionDialogProps> = ({
  onCreatePermission,
  categories,
  resources,
}) => {
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
    conditions: [],
    fieldRestrictions: [],
    apiEndpoints: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

    await onCreatePermission(formData);
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
                    setFormData((prev) => ({ ...prev, complianceRequired: !!checked }))
                  }
                />
                <Label htmlFor="complianceRequired">Compliance required</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conditions" className="space-y-4">
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded">
              <p className="text-gray-500">Permission conditions interface would be here</p>
              <p className="text-sm text-gray-400">Time-based, location-based, and custom conditions</p>
            </div>
          </TabsContent>

          <TabsContent value="fields" className="space-y-4">
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded">
              <p className="text-gray-500">Field-level access controls would be here</p>
              <p className="text-sm text-gray-400">Define which fields can be accessed, masked, or restricted</p>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded">
              <p className="text-gray-500">API endpoint protection configuration</p>
              <p className="text-sm text-gray-400">Select which API endpoints this permission controls</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Create Permission
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};
