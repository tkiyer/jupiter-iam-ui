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
import { Zap, Cpu } from "lucide-react";
import { PermissionOptimization as PermissionOptimizationType } from "@shared/iam";

interface PermissionOptimizationProps {
  optimizations: PermissionOptimizationType[];
}

export const PermissionOptimization: React.FC<PermissionOptimizationProps> = ({ 
  optimizations 
}) => {
  const getOptimizationColor = (type: string) => {
    switch (type) {
      case "cleanup":
        return "bg-blue-100 text-blue-800";
      case "consolidation":
        return "bg-purple-100 text-purple-800";
      case "deprecation":
        return "bg-yellow-100 text-yellow-800";
      case "risk_reduction":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5" />
          Permission Optimization
        </CardTitle>
        <CardDescription>
          Automated suggestions for permission cleanup and optimization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {optimizations.map((optimization) => (
            <Card key={optimization.id} className="border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getOptimizationColor(optimization.type)}>
                        {optimization.type.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline">
                        {optimization.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {optimization.description}
                    </p>
                    <p className="text-sm font-medium">
                      Affected permissions: {optimization.permissions.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommendation: {optimization.recommendation}
                    </p>
                    <p className="text-xs text-gray-500">
                      Impact: {optimization.estimatedImpact}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {optimization.autoApplicable && (
                      <Button variant="outline" size="sm">
                        <Cpu className="mr-2 h-4 w-4" />
                        Auto Apply
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Apply
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
