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
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Plus, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CreatePolicyDialogProps {
  onCreatePolicy: (policy: any) => void;
}

export const CreatePolicyDialog: React.FC<CreatePolicyDialogProps> = ({
  onCreatePolicy,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    effect: "allow" as "allow" | "deny",
    priority: 100,
    status: "draft" as "active" | "inactive" | "draft",
    rules: [] as any[],
    tags: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("basic");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Policy name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.priority < 1 || formData.priority > 1000) {
      newErrors.priority = "Priority must be between 1 and 1000";
    }
    if (formData.rules.length === 0) {
      newErrors.rules = "At least one rule is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onCreatePolicy({
      ...formData,
      id: `pol-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const addRule = () => {
    const newRule = {
      subject: [],
      resource: [],
      action: [],
      environment: [],
    };
    setFormData((prev) => ({ ...prev, rules: [...prev.rules, newRule] }));
  };

  return (
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New ABAC Policy</DialogTitle>
        <DialogDescription>
          Define comprehensive attribute-based access control rules
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="rules">
              Rules ({formData.rules.length})
            </TabsTrigger>
            <TabsTrigger value="conditions">Advanced</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Policy Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="e.g., Executive Financial Access"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Label>Policy Effect *</Label>
                <Select
                  value={formData.effect}
                  onValueChange={(value: "allow" | "deny") =>
                    setFormData((prev) => ({ ...prev, effect: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allow">
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Allow Access
                      </div>
                    </SelectItem>
                    <SelectItem value="deny">
                      <div className="flex items-center">
                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                        Deny Access
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
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
                placeholder="Describe what this policy controls and when it applies"
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: parseInt(e.target.value) || 100,
                    }))
                  }
                  className={errors.priority ? "border-red-500" : ""}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher numbers = higher priority (1-1000)
                </p>
                {errors.priority && (
                  <p className="text-sm text-red-500 mt-1">{errors.priority}</p>
                )}
              </div>
              <div>
                <Label>Initial Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive" | "draft") =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                        Draft
                      </div>
                    </SelectItem>
                    <SelectItem value="active">
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center">
                        <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Tags (Optional)</Label>
              <Input
                placeholder="Enter tags separated by commas (e.g., finance, executive, sensitive)"
                onChange={(e) => {
                  const tags = e.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean);
                  setFormData((prev) => ({ ...prev, tags }));
                }}
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-lg font-medium mb-4 block">
                  Policy Rules
                </Label>
                <p className="text-sm text-gray-500">
                  Define who can access what under which conditions
                </p>
              </div>
              <Button type="button" onClick={addRule} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Rule
              </Button>
            </div>

            {errors.rules && (
              <p className="text-sm text-red-500">{errors.rules}</p>
            )}

            {formData.rules.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No rules defined
                  </h3>
                  <p className="text-gray-500 mb-4 text-center">
                    Add at least one rule to define access conditions
                  </p>
                  <Button type="button" onClick={addRule}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Rule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {formData.rules.map((rule, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Rule {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              rules: prev.rules.filter((_, i) => i !== index),
                            }))
                          }
                          className="text-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="text-sm text-gray-500">
                        Rule builder interface would be implemented here
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="conditions" className="space-y-4">
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded">
              <p className="text-gray-500">
                Advanced conditions interface would be here
              </p>
              <p className="text-sm text-gray-400">
                Time restrictions, location, dynamic attributes, etc.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded">
              <p className="text-gray-500">
                Policy validation and testing interface
              </p>
              <p className="text-sm text-gray-400">
                Syntax validation, conflict detection, test scenarios
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Create Policy
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};
