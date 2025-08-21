import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DashboardStats } from '@shared/iam';
import { 
  Users, 
  Key, 
  Shield, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  Clock,
  UserCheck,
  UserX
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Mock data for demo
      setStats({
        totalUsers: 1247,
        activeUsers: 1134,
        totalRoles: 12,
        totalPermissions: 48,
        totalPolicies: 23,
        recentLogins: 89,
        failedLogins: 3
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Roles',
      value: stats?.totalRoles || 0,
      icon: Key,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+2',
      changeType: 'positive' as const
    },
    {
      title: 'Active Policies',
      value: stats?.totalPolicies || 0,
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+1',
      changeType: 'positive' as const
    }
  ];

  const activityData = [
    { time: '2 minutes ago', action: 'User login', user: 'john.doe@company.com', status: 'success' },
    { time: '5 minutes ago', action: 'Role assignment', user: 'admin@company.com', status: 'success' },
    { time: '12 minutes ago', action: 'Failed login attempt', user: 'unknown@domain.com', status: 'failure' },
    { time: '18 minutes ago', action: 'Policy updated', user: 'manager@company.com', status: 'success' },
    { time: '25 minutes ago', action: 'User created', user: 'admin@company.com', status: 'success' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your IAM system</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Activity className="mr-2 h-4 w-4" />
          View Full Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-500 font-medium">{stat.change}</span>
                      <span className="text-xs text-gray-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security Overview & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Metrics */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Password Compliance</span>
                <span className="font-medium">94%</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>MFA Adoption</span>
                <span className="font-medium">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Role Optimization</span>
                <span className="font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center text-sm text-red-600">
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span>{stats?.failedLogins || 0} failed login attempts today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system events and user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityData.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {activity.status === 'success' ? (
                        <UserCheck className={`h-4 w-4 text-green-600`} />
                      ) : (
                        <UserX className={`h-4 w-4 text-red-600`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.user}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={activity.status === 'success' ? 'default' : 'destructive'}>
                      {activity.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Add New User</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Key className="h-6 w-6" />
              <span>Create Role</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span>New Policy</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
