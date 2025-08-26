import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Database } from "lucide-react";
import { Resource } from "@shared/iam";

interface ResourcesViewProps {
  resources: Resource[];
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({ resources }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Protected Resources ({resources.length})
        </CardTitle>
        <CardDescription>
          Manage resources that are protected by permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
          <div className="text-center text-gray-500">
            <Database className="h-12 w-12 mx-auto mb-2" />
            <p>Resource management interface would be displayed here</p>
            <p className="text-sm">Add resources, configure endpoints, manage access</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
