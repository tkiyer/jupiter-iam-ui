import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, AlertTriangle, Layers } from "lucide-react";
import { Role } from "@shared/iam";

interface RoleAnalyticsProps {
  roles: Role[];
}

export const RoleAnalytics: React.FC<RoleAnalyticsProps> = ({ roles }) => {
  const activeRoles = roles.filter((r) => r.status === "active").length;
  const totalRoles = roles.length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-3xl font-bold text-gray-900">{totalRoles}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Roles
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {activeRoles}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conflicts</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Templates</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <Layers className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Usage Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
            <div className="text-center text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-2" />
              <p>Role analytics charts would be displayed here</p>
              <p className="text-sm">Usage statistics, trends, and insights</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
