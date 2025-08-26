import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Plus, Download, Upload } from "lucide-react";

export const RoleTemplates: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Layers className="mr-2 h-5 w-5" />
            Role Templates (0)
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Templates
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Import Templates
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Pre-defined role templates for common organizational patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Layers className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No templates found
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first role template to get started
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
