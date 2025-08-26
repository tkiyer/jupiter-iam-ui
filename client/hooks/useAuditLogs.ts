import { useState, useEffect } from "react";

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  result: "success" | "failure" | "warning";
  details: Record<string, any>;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  risk: "low" | "medium" | "high" | "critical";
  category:
    | "authentication"
    | "authorization"
    | "data_access"
    | "configuration"
    | "system";
}

export interface MonitoringMetrics {
  totalUsers: number;
  activeUsers: number;
  failedLogins: number;
  successfulLogins: number;
  privilegeChanges: number;
  policyViolations: number;
  dataAccess: number;
  systemChanges: number;
  alertsOpen: number;
  alertsResolved: number;
}

export interface UseAuditLogsReturn {
  auditLogs: AuditLog[];
  metrics: MonitoringMetrics | null;
  isLoading: boolean;
  error: string | null;
  refreshAuditLogs: () => Promise<void>;
}

export const useAuditLogs = (
  autoRefresh: boolean = false,
): UseAuditLogsReturn => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API calls
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock audit logs
      const mockLogs: AuditLog[] = [
        {
          id: "1",
          userId: "user123",
          userName: "John Doe",
          action: "login",
          resource: "authentication",
          result: "success",
          details: { method: "password", mfa: true },
          timestamp: new Date(Date.now() - 300000).toISOString(),
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0...",
          risk: "low",
          category: "authentication",
        },
        {
          id: "2",
          userId: "user456",
          userName: "Jane Smith",
          action: "create_user",
          resource: "users",
          result: "success",
          details: { newUserId: "user789", roles: ["user"] },
          timestamp: new Date(Date.now() - 600000).toISOString(),
          ipAddress: "192.168.1.101",
          userAgent: "Mozilla/5.0...",
          risk: "medium",
          category: "configuration",
        },
        {
          id: "3",
          userId: "user789",
          userName: "Bob Wilson",
          action: "failed_login",
          resource: "authentication",
          result: "failure",
          details: { reason: "invalid_password", attempts: 3 },
          timestamp: new Date(Date.now() - 900000).toISOString(),
          ipAddress: "203.0.113.1",
          userAgent: "curl/7.68.0",
          risk: "high",
          category: "authentication",
        },
        {
          id: "4",
          userId: "admin001",
          userName: "Admin User",
          action: "update_permissions",
          resource: "permissions",
          result: "success",
          details: { permissionId: "perm123", changes: { action: "write" } },
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          ipAddress: "192.168.1.102",
          userAgent: "Mozilla/5.0...",
          risk: "critical",
          category: "authorization",
        },
        {
          id: "5",
          userId: "user456",
          userName: "Jane Smith",
          action: "access_sensitive_data",
          resource: "user_profiles",
          result: "success",
          details: {
            recordsAccessed: 50,
            query: "SELECT * FROM users WHERE department = 'HR'",
          },
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          ipAddress: "192.168.1.101",
          userAgent: "Mozilla/5.0...",
          risk: "medium",
          category: "data_access",
        },
      ];

      // Mock metrics
      const mockMetrics: MonitoringMetrics = {
        totalUsers: 1247,
        activeUsers: 892,
        failedLogins: 23,
        successfulLogins: 1456,
        privilegeChanges: 7,
        policyViolations: 3,
        dataAccess: 4567,
        systemChanges: 12,
        alertsOpen: 5,
        alertsResolved: 18,
      };

      setAuditLogs(mockLogs);
      setMetrics(mockMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching audit data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuditLogs = () => fetchAuditData();

  useEffect(() => {
    fetchAuditData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchAuditData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return {
    auditLogs,
    metrics,
    isLoading,
    error,
    refreshAuditLogs,
  };
};
