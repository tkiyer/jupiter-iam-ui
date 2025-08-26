import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Activity, RefreshCw, Download } from "lucide-react";

import { useAuditLogs } from "@/hooks/useAuditLogs";
import { useSecurityAlerts } from "@/hooks/useSecurityAlerts";
import { useCompliance } from "@/hooks/useCompliance";
import { MetricsOverview } from "@/components/audit/MetricsOverview";
import { AuditLogsTable } from "@/components/audit/AuditLogsTable";
import { SecurityAlertsList } from "@/components/audit/SecurityAlertsList";
import { ComplianceReports } from "@/components/audit/ComplianceReports";
import { MonitoringDashboard } from "@/components/audit/MonitoringDashboard";

const Audit: React.FC = () => {
  const [activeTab, setActiveTab] = useState("logs");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { auditLogs, metrics, isLoading: logsLoading, refreshAuditLogs } = useAuditLogs(autoRefresh);
  const { securityAlerts, isLoading: alertsLoading } = useSecurityAlerts();
  const { complianceReports, isLoading: complianceLoading } = useCompliance();

  const isLoading = logsLoading || alertsLoading || complianceLoading;

  const exportLogs = (format: 'csv' | 'json' | 'pdf') => {
    // Implementation for exporting logs
    console.log(`Exporting logs in ${format} format`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audit & Monitoring</h1>
            <p className="text-muted-foreground">
              Comprehensive security monitoring and compliance tracking
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 text-green-700' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportLogs('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportLogs('json')}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportLogs('pdf')}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && <MetricsOverview metrics={metrics} />}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <AuditLogsTable auditLogs={auditLogs} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <SecurityAlertsList securityAlerts={securityAlerts} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <ComplianceReports complianceReports={complianceReports} />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <MonitoringDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Audit;
