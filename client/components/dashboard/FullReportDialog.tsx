import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Users,
  Shield,
  Key,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Lock,
  UserCheck,
  UserX,
  Calendar,
  Target,
  BarChart3,
} from 'lucide-react';

// Types for detailed analytics
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

interface FullReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const FullReportDialog: React.FC<FullReportDialogProps> = ({ open, onOpenChange }) => {
  const [analytics, setAnalytics] = useState<DetailedAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (open && !analytics) {
      fetchDetailedAnalytics();
    }
  }, [open]);

  const fetchDetailedAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dashboard/detailed-analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
      // Mock data for demo
      setAnalytics(generateMockAnalytics());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAnalytics = (): DetailedAnalytics => ({
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
      userActivity: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        logins: Math.floor(Math.random() * 200) + 50,
        registrations: Math.floor(Math.random() * 10) + 1,
      })),
      topActiveUsers: [
        { name: 'John Doe', email: 'john.doe@company.com', lastLogin: '2 minutes ago', loginCount: 245 },
        { name: 'Jane Smith', email: 'jane.smith@company.com', lastLogin: '15 minutes ago', loginCount: 198 },
        { name: 'Mike Johnson', email: 'mike.johnson@company.com', lastLogin: '1 hour ago', loginCount: 167 },
        { name: 'Sarah Wilson', email: 'sarah.wilson@company.com', lastLogin: '3 hours ago', loginCount: 134 },
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
      ],
      loginTrends: Array.from({ length: 14 }, (_, i) => ({
        date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        successful: Math.floor(Math.random() * 1000) + 800,
        failed: Math.floor(Math.random() * 50) + 5,
      })),
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
      ],
      roleComplexity: [
        { role: 'Employee', permissions: 15, complexity: 'low' },
        { role: 'Manager', permissions: 28, complexity: 'medium' },
        { role: 'Admin', permissions: 45, complexity: 'high' },
        { role: 'Super Admin', permissions: 62, complexity: 'high' },
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
      ],
    },
    timeSeriesData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      users: 1200 + Math.floor(Math.random() * 100),
      logins: Math.floor(Math.random() * 1000) + 500,
      roles: 12 + Math.floor(Math.random() * 3),
      permissions: 48 + Math.floor(Math.random() * 5),
      securityEvents: Math.floor(Math.random() * 20),
    })),
  });

  const handleExportReport = async (format: 'pdf' | 'csv') => {
    if (!analytics) return;

    try {
      let success = false;

      if (format === 'csv') {
        const { exportToCSV } = await import('@/utils/exportUtils');
        success = exportToCSV(analytics, 'iam-comprehensive-report');
      } else if (format === 'pdf') {
        const { exportToPDF } = await import('@/utils/exportUtils');
        success = exportToPDF(analytics, 'iam-comprehensive-report');
      }

      if (success) {
        // Optional: Show success notification
        console.log(`Report exported successfully as ${format.toUpperCase()}`);
      } else {
        console.error(`Failed to export report as ${format.toUpperCase()}`);
        alert(`Failed to export report as ${format.toUpperCase()}. Please try again.`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Error exporting report: ${error}`);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Report</DialogTitle>
            <DialogDescription>
              Fetching comprehensive analytics data...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading detailed analytics...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!analytics) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Comprehensive IAM Report</DialogTitle>
              <DialogDescription>
                Detailed analytics and insights for your Identity and Access Management system
              </DialogDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportReport('csv')}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportReport('pdf')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[70vh] w-full rounded-md">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold">{analytics.userMetrics.totalUsers}</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-500">+{analytics.userMetrics.userGrowthRate}%</span>
                        </div>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Security Score</p>
                        <p className="text-2xl font-bold">{100 - analytics.securityMetrics.riskScore}</p>
                        <div className="flex items-center mt-1">
                          <Shield className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-gray-500">Risk: {analytics.securityMetrics.riskScore}</span>
                        </div>
                      </div>
                      <Shield className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Roles</p>
                        <p className="text-2xl font-bold">{analytics.roleMetrics.totalRoles}</p>
                        <div className="flex items-center mt-1">
                          <AlertTriangle className="h-3 w-3 text-orange-500 mr-1" />
                          <span className="text-xs text-orange-500">{analytics.roleMetrics.roleConflicts} conflicts</span>
                        </div>
                      </div>
                      <Key className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Compliance</p>
                        <p className="text-2xl font-bold">{analytics.complianceMetrics.overallScore}%</p>
                        <div className="flex items-center mt-1">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-500">Good</span>
                        </div>
                      </div>
                      <FileText className="h-8 w-8 text-indigo-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Time Series Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>System Trends (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                      <Area type="monotone" dataKey="logins" stackId="1" stroke="#10b981" fill="#10b981" />
                      <Area type="monotone" dataKey="securityEvents" stackId="1" stroke="#ef4444" fill="#ef4444" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Distribution by Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={analytics.userMetrics.usersByRole}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="count"
                          nameKey="role"
                        >
                          {analytics.userMetrics.usersByRole.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Activity Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={analytics.userMetrics.userActivity.slice(-14)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="logins" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="registrations" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.userMetrics.topActiveUsers.map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{user.loginCount} logins</p>
                          <p className="text-sm text-gray-500">{user.lastLogin}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Login Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analytics.securityMetrics.loginTrends.slice(-7)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="successful" fill="#10b981" />
                        <Bar dataKey="failed" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>MFA Adoption</span>
                        <span>{analytics.securityMetrics.mfaAdoption}%</span>
                      </div>
                      <Progress value={analytics.securityMetrics.mfaAdoption} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Password Compliance</span>
                        <span>{analytics.securityMetrics.passwordCompliance}%</span>
                      </div>
                      <Progress value={analytics.securityMetrics.passwordCompliance} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Login Success Rate</span>
                        <span>{analytics.securityMetrics.successRate}%</span>
                      </div>
                      <Progress value={analytics.securityMetrics.successRate} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Security Vulnerabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.securityMetrics.vulnerabilities.map((vuln, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className={`h-5 w-5 ${
                            vuln.severity === 'critical' ? 'text-red-600' :
                            vuln.severity === 'high' ? 'text-orange-600' :
                            vuln.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                          }`} />
                          <div>
                            <p className="font-medium">{vuln.type}</p>
                            <Badge variant={
                              vuln.severity === 'critical' ? 'destructive' :
                              vuln.severity === 'high' ? 'destructive' :
                              vuln.severity === 'medium' ? 'default' : 'secondary'
                            }>
                              {vuln.severity}
                            </Badge>
                          </div>
                        </div>
                        <span className="font-medium">{vuln.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Role Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analytics.roleMetrics.roleUtilization}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="role" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="userCount" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Role Complexity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.roleMetrics.roleComplexity.map((role, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{role.role}</p>
                            <p className="text-sm text-gray-500">{role.permissions} permissions</p>
                          </div>
                          <Badge variant={
                            role.complexity === 'high' ? 'destructive' :
                            role.complexity === 'medium' ? 'default' : 'secondary'
                          }>
                            {role.complexity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Permissions by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analytics.permissionMetrics.permissionsByCategory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Permission Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.permissionMetrics.permissionUsage.map((perm, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-mono">{perm.permission}</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={perm.usage} className="w-20" />
                            <span className="text-sm">{perm.usage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Scores</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Compliance</span>
                        <span>{analytics.complianceMetrics.overallScore}%</span>
                      </div>
                      <Progress value={analytics.complianceMetrics.overallScore} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>GDPR Compliance</span>
                        <span>{analytics.complianceMetrics.gdprCompliance}%</span>
                      </div>
                      <Progress value={analytics.complianceMetrics.gdprCompliance} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Access Reviews</span>
                        <span>{analytics.complianceMetrics.accessReviews}%</span>
                      </div>
                      <Progress value={analytics.complianceMetrics.accessReviews} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Audit Trail</span>
                        <span>{analytics.complianceMetrics.auditTrail}%</span>
                      </div>
                      <Progress value={analytics.complianceMetrics.auditTrail} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.complianceMetrics.complianceIssues.map((issue, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{issue.issue}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={
                                issue.severity === 'high' ? 'destructive' :
                                issue.severity === 'medium' ? 'default' : 'secondary'
                              }>
                                {issue.severity}
                              </Badge>
                              <Badge variant="outline">
                                {issue.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FullReportDialog;
