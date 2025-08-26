import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { RoleConflict } from "@shared/iam";
import { cn } from "@/lib/utils";

interface RoleConflictsProps {
  conflicts: RoleConflict[];
}

export const RoleConflicts: React.FC<RoleConflictsProps> = ({ conflicts }) => {
  const getConflictSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Role Conflicts
        </CardTitle>
        <CardDescription>
          Detected conflicts and security issues in role assignments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(conflicts || []).map((conflict) => (
            <Card
              key={conflict.id}
              className={cn(
                "border",
                getConflictSeverityColor(conflict.severity),
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge
                        className={getConflictSeverityColor(conflict.severity)}
                      >
                        {conflict.severity}
                      </Badge>
                      <span className="text-sm font-medium">
                        {conflict.type.replace("_", " ")}
                      </span>
                      {conflict.resolved && (
                        <Badge variant="outline" className="text-green-600">
                          Resolved
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {conflict.description}
                    </p>
                    <p className="text-sm font-medium">
                      Affected roles: {conflict.roles.join(", ")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Suggestion: {conflict.suggestion}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Resolve
                    </Button>
                    <Button variant="ghost" size="sm">
                      Dismiss
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
