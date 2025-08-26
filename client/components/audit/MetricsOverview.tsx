import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Users, Lock, AlertTriangle, Database } from "lucide-react";
import { MonitoringMetrics } from "@/hooks/useAuditLogs";

interface MetricsOverviewProps {
  metrics: MonitoringMetrics;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">{metrics.activeUsers}</p>
              <p className="text-xs text-muted-foreground">of {metrics.totalUsers} total</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Failed Logins</p>
              <p className="text-2xl font-bold text-red-600">{metrics.failedLogins}</p>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </div>
            <Lock className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Open Alerts</p>
              <p className="text-2xl font-bold text-yellow-600">{metrics.alertsOpen}</p>
              <p className="text-xs text-muted-foreground">{metrics.alertsResolved} resolved</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data Access</p>
              <p className="text-2xl font-bold">{metrics.dataAccess}</p>
              <p className="text-xs text-muted-foreground">Operations today</p>
            </div>
            <Database className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
