import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ABACPolicy } from "@shared/iam";

interface EditPolicyDialogProps {
  policy: ABACPolicy;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (policy: ABACPolicy) => void;
}

export const EditPolicyDialog: React.FC<EditPolicyDialogProps> = ({
  policy,
  isOpen,
  onOpenChange,
  onSave,
}) => {
  const [formData, setFormData] = useState<ABACPolicy>(policy);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Policy: {policy.name}</DialogTitle>
          <DialogDescription>
            Update policy rules, conditions, and settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
            <div className="text-center text-gray-500">
              <p>Edit policy interface would be displayed here</p>
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
