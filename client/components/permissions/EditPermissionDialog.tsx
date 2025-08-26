import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Permission, PermissionCategory, Resource } from "@shared/iam";

interface EditPermissionDialogProps {
  permission: Permission;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (permission: Permission) => void;
  categories: PermissionCategory[];
  resources: Resource[];
}

export const EditPermissionDialog: React.FC<EditPermissionDialogProps> = ({
  permission,
  isOpen,
  onOpenChange,
  onSave,
  categories,
  resources,
}) => {
  const [formData, setFormData] = useState<Permission>(permission);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Permission: {permission.name}</DialogTitle>
          <DialogDescription>
            Update permission settings, conditions, and access controls
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
            <div className="text-center text-gray-500">
              <p>Edit permission interface would be displayed here</p>
              <p className="text-sm">Similar to create dialog but pre-populated with existing data</p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
