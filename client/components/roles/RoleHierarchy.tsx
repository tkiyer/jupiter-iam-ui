import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitBranch } from "lucide-react";
import { Role } from "@shared/iam";

interface RoleHierarchyProps {
  roles: Role[];
}

export const RoleHierarchy: React.FC<RoleHierarchyProps> = ({ roles }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <GitBranch className="mr-2 h-5 w-5" />
          Role Hierarchy
        </CardTitle>
        <CardDescription>
          Visual representation of role inheritance and hierarchy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
          <div className="text-center text-gray-500">
            <GitBranch className="h-12 w-12 mx-auto mb-2" />
            <p>Role hierarchy visualization would be displayed here</p>
            <p className="text-sm">
              Shows parent-child relationships and inheritance
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
