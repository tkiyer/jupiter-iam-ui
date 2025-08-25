import { RequestHandler } from "express";
import { DashboardStats } from "@shared/iam";

// Detailed analytics interface
interface DetailedAnalytics {
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    newUsersThisMonth: number;
    userGrowthRate: number;
    usersByRole: Array<{ role: string; count: number }>;
    userActivity: Array<{ date: string; logins: number; registrations: number }>;
    topActiveUsers: Array<{ name: string; email: string; lastLogin: string; loginCount: number }>;
  };
  securityMetrics: {
    totalLogins: number;
    failedLogins: number;
    successRate: number;
    mfaAdoption: number;
    passwordCompliance: number;
    securityAlerts: number;
    riskScore: number;
    vulnerabilities: Array<{ type: string; severity: 'low' | 'medium' | 'high' | 'critical'; count: number }>;
    loginTrends: Array<{ date: string; successful: number; failed: number }>;
  };
  roleMetrics: {
    totalRoles: number;
    systemRoles: number;
    customRoles: number;
    roleUtilization: Array<{ role: string; userCount: number; utilization: number }>;
    roleComplexity: Array<{ role: string; permissions: number; complexity: 'low' | 'medium' | 'high' }>;
    roleConflicts: number;
  };
  permissionMetrics: {
    totalPermissions: number;
    activePermissions: number;
    unusedPermissions: number;
    permissionsByCategory: Array<{ category: string; count: number; risk: 'low' | 'medium' | 'high' | 'critical' }>;
    permissionUsage: Array<{ permission: string; usage: number; risk: string }>;
  };
  complianceMetrics: {
    overallScore: number;
    gdprCompliance: number;
    accessReviews: number;
    auditTrail: number;
    dataRetention: number;
    complianceIssues: Array<{ issue: string; severity: string; status: string }>;
  };
  timeSeriesData: Array<{
    date: string;
    users: number;
    logins: number;
    roles: number;
    permissions: number;
    securityEvents: number;
  }>;
}

// Generate mock detailed analytics
const generateDetailedAnalytics = (): DetailedAnalytics => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    userMetrics: {
      totalUsers: 1247,
      activeUsers: 1134,
      inactiveUsers: 113,
      newUsersThisMonth: 89,
      userGrowthRate: 12.5,
      usersByRole: [
        { role: 'Employee', count: 856 },
        { role: 'Manager', count: 234 },
        { role: 'Admin', count: 89 },
        { role: 'Contractor', count: 68 },
      ],
      userActivity: Array.from({ length: 30 }, (_, i) => {
        const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split('T')[0],
          logins: Math.floor(Math.random() * 200) + 50 + (i % 7 === 0 ? -30 : 0), // Lower on weekends
          registrations: Math.floor(Math.random() * 10) + 1,
        };
      }),
      topActiveUsers: [
        { name: 'John Doe', email: 'john.doe@company.com', lastLogin: '2 minutes ago', loginCount: 245 },
        { name: 'Jane Smith', email: 'jane.smith@company.com', lastLogin: '15 minutes ago', loginCount: 198 },
        { name: 'Mike Johnson', email: 'mike.johnson@company.com', lastLogin: '1 hour ago', loginCount: 167 },
        { name: 'Sarah Wilson', email: 'sarah.wilson@company.com', lastLogin: '3 hours ago', loginCount: 134 },
        { name: 'Alex Chen', email: 'alex.chen@company.com', lastLogin: '5 hours ago', loginCount: 121 },
      ],
    },
    securityMetrics: {
      totalLogins: 45678,
      failedLogins: 234,
      successRate: 99.5,
      mfaAdoption: 78.5,
      passwordCompliance: 94.2,
      securityAlerts: 12,
      riskScore: 25,
      vulnerabilities: [
        { type: 'Weak Passwords', severity: 'medium', count: 23 },
        { type: 'Unused Permissions', severity: 'low', count: 45 },
        { type: 'Excessive Privileges', severity: 'high', count: 8 },
        { type: 'Failed MFA Setup', severity: 'medium', count: 15 },
        { type: 'Inactive Admin Accounts', severity: 'critical', count: 2 },
      ],
      loginTrends: Array.from({ length: 14 }, (_, i) => {
        const date = new Date(now.getTime() - (13 - i) * 24 * 60 * 60 * 1000);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        return {
          date: date.toISOString().split('T')[0],
          successful: Math.floor(Math.random() * 1000) + (isWeekend ? 300 : 800),
          failed: Math.floor(Math.random() * 50) + 5,
        };
      }),
    },
    roleMetrics: {
      totalRoles: 12,
      systemRoles: 5,
      customRoles: 7,
      roleUtilization: [
        { role: 'Employee', userCount: 856, utilization: 95 },
        { role: 'Manager', userCount: 234, utilization: 87 },
        { role: 'Admin', userCount: 89, utilization: 92 },
        { role: 'Contractor', userCount: 68, utilization: 76 },
        { role: 'Guest', userCount: 0, utilization: 0 },
      ],
      roleComplexity: [
        { role: 'Employee', permissions: 15, complexity: 'low' },
        { role: 'Manager', permissions: 28, complexity: 'medium' },
        { role: 'Admin', permissions: 45, complexity: 'high' },
        { role: 'Super Admin', permissions: 62, complexity: 'high' },
        { role: 'Auditor', permissions: 22, complexity: 'medium' },
      ],
      roleConflicts: 3,
    },
    permissionMetrics: {
      totalPermissions: 48,
      activePermissions: 42,
      unusedPermissions: 6,
      permissionsByCategory: [
        { category: 'User Management', count: 12, risk: 'medium' },
        { category: 'System Admin', count: 8, risk: 'high' },
        { category: 'Data Access', count: 15, risk: 'medium' },
        { category: 'Reporting', count: 7, risk: 'low' },
        { category: 'Security', count: 6, risk: 'critical' },
      ],
      permissionUsage: [
        { permission: 'user.read', usage: 95, risk: 'low' },
        { permission: 'user.create', usage: 78, risk: 'medium' },
        { permission: 'admin.delete', usage: 15, risk: 'critical' },
        { permission: 'data.export', usage: 45, risk: 'high' },
        { permission: 'system.config', usage: 8, risk: 'critical' },
      ],
    },
    complianceMetrics: {
      overallScore: 87,
      gdprCompliance: 92,
      accessReviews: 78,
      auditTrail: 95,
      dataRetention: 83,
      complianceIssues: [
        { issue: 'Missing access review for contractors', severity: 'medium', status: 'open' },
        { issue: 'Incomplete audit logs for admin actions', severity: 'high', status: 'in_progress' },
        { issue: 'Data retention policy not enforced', severity: 'low', status: 'resolved' },
        { issue: 'GDPR consent tracking incomplete', severity: 'medium', status: 'open' },
      ],
    },
    timeSeriesData: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        users: 1200 + Math.floor(Math.random() * 100) + i, // Growing trend
        logins: Math.floor(Math.random() * 1000) + 500,
        roles: 12 + Math.floor(Math.random() * 3),
        permissions: 48 + Math.floor(Math.random() * 5),
        securityEvents: Math.floor(Math.random() * 20),
      };
    }),
  };
};

export const handleDashboardStats: RequestHandler = (req, res) => {
  try {
    // Mock dashboard statistics (in production, this would query real database)
    const stats: DashboardStats = {
      totalUsers: 1247,
      activeUsers: 1134,
      totalRoles: 12,
      totalPermissions: 48,
      totalPolicies: 23,
      recentLogins: 89,
      failedLogins: 3
    };

    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleDetailedAnalytics: RequestHandler = (req, res) => {
  try {
    // Add a small delay to simulate real API call
    setTimeout(() => {
      const analytics = generateDetailedAnalytics();
      res.json(analytics);
    }, 500);
  } catch (error) {
    console.error("Error fetching detailed analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
