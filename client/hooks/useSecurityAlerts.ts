import { useState, useEffect } from "react";

export interface SecurityAlert {
  id: string;
  type: 'failed_login' | 'privilege_escalation' | 'unusual_access' | 'data_breach' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
}

export interface UseSecurityAlertsReturn {
  securityAlerts: SecurityAlert[];
  isLoading: boolean;
  error: string | null;
  updateAlertStatus: (alertId: string, status: SecurityAlert['status']) => Promise<void>;
  assignAlert: (alertId: string, assignee: string) => Promise<void>;
  refreshAlerts: () => Promise<void>;
}

export const useSecurityAlerts = (): UseSecurityAlertsReturn => {
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurityAlerts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock security alerts
      const mockAlerts: SecurityAlert[] = [
        {
          id: 'alert1',
          type: 'failed_login',
          severity: 'high',
          title: 'Multiple Failed Login Attempts',
          description: 'User Bob Wilson has 5 failed login attempts in the last 10 minutes from IP 203.0.113.1',
          userId: 'user789',
          userName: 'Bob Wilson',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          status: 'open'
        },
        {
          id: 'alert2',
          type: 'unusual_access',
          severity: 'medium',
          title: 'Unusual Access Pattern',
          description: 'User accessing system from new geographic location (VPN detected)',
          userId: 'user456',
          userName: 'Jane Smith',
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          status: 'investigating',
          assignedTo: 'security-team'
        },
        {
          id: 'alert3',
          type: 'privilege_escalation',
          severity: 'critical',
          title: 'Privilege Escalation Detected',
          description: 'Admin permissions granted to user account outside normal workflow',
          userId: 'user123',
          userName: 'John Doe',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          status: 'resolved'
        }
      ];

      setSecurityAlerts(mockAlerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching security alerts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAlertStatus = async (alertId: string, status: SecurityAlert['status']) => {
    try {
      // Mock API call
      setSecurityAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, status } : alert
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update alert status");
      throw err;
    }
  };

  const assignAlert = async (alertId: string, assignee: string) => {
    try {
      // Mock API call
      setSecurityAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, assignedTo: assignee } : alert
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign alert");
      throw err;
    }
  };

  const refreshAlerts = () => fetchSecurityAlerts();

  useEffect(() => {
    fetchSecurityAlerts();
  }, []);

  return {
    securityAlerts,
    isLoading,
    error,
    updateAlertStatus,
    assignAlert,
    refreshAlerts,
  };
};
