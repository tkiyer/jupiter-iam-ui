import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Activity, CheckCircle, Eye, AlertTriangle, Settings } from "lucide-react";

export const MonitoringDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Real-time Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Successful Login</span>
                </div>
                <span className="text-xs text-muted-foreground">2 sec ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Data Access</span>
                </div>
                <span className="text-xs text-muted-foreground">5 sec ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Configuration Change</span>
                </div>
                <span className="text-xs text-muted-foreground">12 sec ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Failed Authentication</span>
                </div>
                <span className="text-xs text-muted-foreground">18 sec ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Authentication Service</span>
                  <span className="text-green-600">99.9%</span>
                </div>
                <Progress value={99.9} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Authorization Engine</span>
                  <span className="text-green-600">98.7%</span>
                </div>
                <Progress value={98.7} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Audit Logger</span>
                  <span className="text-green-600">100%</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Policy Engine</span>
                  <span className="text-yellow-600">95.2%</span>
                </div>
                <Progress value={95.2} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            System performance and usage statistics over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2" />
              <p>Performance charts would be displayed here</p>
              <p className="text-sm">Integration with monitoring tools like Grafana</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
