/**
 * Audit Logs and Monitoring Interface
 * Comprehensive security monitoring, audit trails, and compliance reporting
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DatePickerWithRange } from '../components/ui/date-picker';
import { ScrollArea } from '../components/ui/scroll-area';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../components/ui/dropdown-menu';
import {
  Activity,
  AlertTriangle,
  Users,
  Lock,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  Shield,
  Clock,
  User,
  Database,
  Settings,
  FileText,
  MoreHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  result: 'success' | 'failure' | 'warning';
  details: Record<string, any>;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'configuration' | 'system';
}

interface SecurityAlert {
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

interface ComplianceReport {
  id: string;
  name: string;
  type: 'SOX' | 'PCI-DSS' | 'GDPR' | 'HIPAA' | 'SOC2';
  status: 'compliant' | 'non_compliant' | 'warning';
  score: number;
  lastRun: string;
  findings: number;
  criticalFindings: number;
}

interface MonitoringMetrics {
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

export default function Audit() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    resource: '',
    result: '',
    category: '',
    dateRange: { from: undefined, to: undefined } as any,
    risk: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Mock data - in production, this would come from APIs
  useEffect(() => {
    fetchAuditData();
    if (autoRefresh) {
      const interval = setInterval(fetchAuditData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, currentPage, filters]);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock audit logs
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          userId: 'user123',
          userName: 'John Doe',
          action: 'login',
          resource: 'authentication',
          result: 'success',
          details: { method: 'password', mfa: true },
          timestamp: new Date(Date.now() - 300000).toISOString(),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          risk: 'low',
          category: 'authentication'
        },
        {
          id: '2',
          userId: 'user456',
          userName: 'Jane Smith',
          action: 'create_user',
          resource: 'users',
          result: 'success',
          details: { newUserId: 'user789', roles: ['user'] },
          timestamp: new Date(Date.now() - 600000).toISOString(),
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0...',
          risk: 'medium',
          category: 'configuration'
        },
        {
          id: '3',
          userId: 'user789',
          userName: 'Bob Wilson',
          action: 'failed_login',
          resource: 'authentication',
          result: 'failure',
          details: { reason: 'invalid_password', attempts: 3 },
          timestamp: new Date(Date.now() - 900000).toISOString(),
          ipAddress: '203.0.113.1',
          userAgent: 'curl/7.68.0',
          risk: 'high',
          category: 'authentication'
        },
        {
          id: '4',
          userId: 'admin001',
          userName: 'Admin User',
          action: 'update_permissions',
          resource: 'permissions',
          result: 'success',
          details: { permissionId: 'perm123', changes: { action: 'write' } },
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0...',
          risk: 'critical',
          category: 'authorization'
        },
        {
          id: '5',
          userId: 'user456',
          userName: 'Jane Smith',
          action: 'access_sensitive_data',
          resource: 'user_profiles',
          result: 'success',
          details: { recordsAccessed: 50, query: 'SELECT * FROM users WHERE department = \'HR\'' },
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0...',
          risk: 'medium',
          category: 'data_access'
        }
      ];

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

      // Mock compliance reports
      const mockCompliance: ComplianceReport[] = [
        {
          id: 'comp1',
          name: 'SOX Compliance Check',
          type: 'SOX',
          status: 'compliant',
          score: 95,
          lastRun: new Date(Date.now() - 86400000).toISOString(),
          findings: 2,
          criticalFindings: 0
        },
        {
          id: 'comp2',
          name: 'GDPR Privacy Assessment',
          type: 'GDPR',
          status: 'warning',
          score: 78,
          lastRun: new Date(Date.now() - 172800000).toISOString(),
          findings: 8,
          criticalFindings: 2
        },
        {
          id: 'comp3',
          name: 'PCI-DSS Security Validation',
          type: 'PCI-DSS',
          status: 'non_compliant',
          score: 65,
          lastRun: new Date(Date.now() - 259200000).toISOString(),
          findings: 15,
          criticalFindings: 5
        }
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
        alertsResolved: 18
      };

      setAuditLogs(mockLogs);
      setSecurityAlerts(mockAlerts);
      setComplianceReports(mockCompliance);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to fetch audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = (format: 'csv' | 'json' | 'pdf') => {
    // Implementation for exporting logs
    console.log(`Exporting logs in ${format} format`);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failure': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'non_compliant': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    if (filters.userId && !log.userId.toLowerCase().includes(filters.userId.toLowerCase())) return false;
    if (filters.action && !log.action.toLowerCase().includes(filters.action.toLowerCase())) return false;
    if (filters.resource && !log.resource.toLowerCase().includes(filters.resource.toLowerCase())) return false;
    if (filters.result && log.result !== filters.result) return false;
    if (filters.category && log.category !== filters.category) return false;
    if (filters.risk && log.risk !== filters.risk) return false;
    if (searchTerm && !log.userName.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !log.action.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.resource.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  return (
    <div className="space-y-6">
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
      {metrics && (
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
      )}

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Audit Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by user, action, or resource..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <Label>User ID</Label>
                  <Input
                    placeholder="Filter by user"
                    value={filters.userId}
                    onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label>Result</Label>
                  <Select value={filters.result} onValueChange={(value) => setFilters(prev => ({ ...prev, result: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All results" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All results</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failure">Failure</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      <SelectItem value="authentication">Authentication</SelectItem>
                      <SelectItem value="authorization">Authorization</SelectItem>
                      <SelectItem value="data_access">Data Access</SelectItem>
                      <SelectItem value="configuration">Configuration</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Risk Level</Label>
                  <Select value={filters.risk} onValueChange={(value) => setFilters(prev => ({ ...prev, risk: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All levels</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Action</Label>
                  <Input
                    placeholder="Filter by action"
                    value={filters.action}
                    onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Resource</Label>
                  <Input
                    placeholder="Filter by resource"
                    value={filters.resource}
                    onChange={(e) => setFilters(prev => ({ ...prev, resource: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Audit Logs
                  <Badge variant="outline">{filteredLogs.length} entries</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Risk</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{log.userName}</div>
                              <div className="text-sm text-muted-foreground">{log.userId}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.resource}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getResultIcon(log.result)}
                              <span className="capitalize">{log.result}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRiskColor(log.risk)}>
                              {log.risk.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>View User Profile</DropdownMenuItem>
                                <DropdownMenuItem>Create Alert</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {securityAlerts.map((alert) => (
              <Card key={alert.id} className="border-l-4" style={{ borderLeftColor: getSeverityColor(alert.severity).replace('bg-', '#') }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{alert.type.replace('_', ' ').toUpperCase()}</Badge>
                        <Badge variant={alert.status === 'open' ? 'destructive' : alert.status === 'resolved' ? 'default' : 'secondary'}>
                          {alert.status.toUpperCase()}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg">{alert.title}</h3>
                      <p className="text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {alert.userName || 'System'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')}
                        </span>
                        {alert.assignedTo && (
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Assigned to {alert.assignedTo}
                          </span>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Investigate</DropdownMenuItem>
                        <DropdownMenuItem>Mark as False Positive</DropdownMenuItem>
                        <DropdownMenuItem>Assign to Team</DropdownMenuItem>
                        <DropdownMenuItem>Create Incident</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4">
            {complianceReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{report.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{report.type}</Badge>
                        <Badge className={getComplianceColor(report.status)}>
                          {report.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{report.score}%</div>
                      <div className="text-sm text-muted-foreground">
                        Last run: {format(new Date(report.lastRun), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Compliance Score</span>
                      <span>{report.score}%</span>
                    </div>
                    <Progress value={report.score} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">{report.findings}</div>
                      <div className="text-sm text-muted-foreground">Total Findings</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-red-600">{report.criticalFindings}</div>
                      <div className="text-sm text-muted-foreground">Critical Issues</div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      View Report
                    </Button>
                    <Button size="sm" variant="outline">
                      Run Check
                    </Button>
                    <Button size="sm" variant="outline">
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
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

          {/* Additional monitoring charts and metrics would go here */}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
