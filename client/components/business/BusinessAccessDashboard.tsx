/**
 * Business Access Control Dashboard
 * Shows real-time access control status with business context
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  TrendingUp, 
  Shield, 
  Users, 
  Clock, 
  MapPin, 
  Building2,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Zap,
  Layers
} from 'lucide-react';

interface BusinessMetrics {
  activeUsers: number;
  pendingApprovals: number;
  policyEvaluations: number;
  emergencyAccess: number;
  complianceScore: number;
  rbacEfficiency: number;
  abacComplexity: number;
}

interface AccessContext {
  currentTime: string;
  businessHours: boolean;
  location: string;
  networkType: string;
  securityLevel: string;
  emergencyMode: boolean;
}

interface PolicyStatus {
  id: string;
  name: string;
  type: 'rbac' | 'abac' | 'integrated';
  status: 'active' | 'inactive' | 'testing';
  evaluations: number;
  successRate: number;
  averageTime: number;
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
}

export default function BusinessAccessDashboard() {
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    activeUsers: 342,
    pendingApprovals: 23,
    policyEvaluations: 15420,
    emergencyAccess: 2,
    complianceScore: 94,
    rbacEfficiency: 87,
    abacComplexity: 156
  });

  const [accessContext, setAccessContext] = useState<AccessContext>({
    currentTime: new Date().toLocaleTimeString(),
    businessHours: true,
    location: 'Corporate Office',
    networkType: 'Internal',
    securityLevel: 'Standard',
    emergencyMode: false
  });

  const [policyStatuses, setPolicyStatuses] = useState<PolicyStatus[]>([
    {
      id: 'pol-1',
      name: '费用审批分级策略',
      type: 'integrated',
      status: 'active',
      evaluations: 1250,
      successRate: 96.8,
      averageTime: 2.3,
      businessImpact: 'high'
    },
    {
      id: 'pol-2',
      name: '客户数据区域访问',
      type: 'integrated',
      status: 'active',
      evaluations: 3420,
      successRate: 98.2,
      averageTime: 1.8,
      businessImpact: 'critical'
    },
    {
      id: 'pol-3',
      name: 'HR薪资信息保护',
      type: 'abac',
      status: 'active',
      evaluations: 567,
      successRate: 99.1,
      averageTime: 3.1,
      businessImpact: 'critical'
    },
    {
      id: 'pol-4',
      name: '生产环境部署控制',
      type: 'integrated',
      status: 'active',
      evaluations: 89,
      successRate: 94.4,
      averageTime: 5.2,
      businessImpact: 'critical'
    }
  ]);

  const [recentActivities, setRecentActivities] = useState([
    {
      id: '1',
      user: '张经理',
      action: '审批费用申请',
      resource: '¥35,000 设备采购',
      result: 'allowed',
      reason: 'RBAC: 部门经理权限 + ABAC: 金额在授权范围',
      timestamp: '14:23:15',
      businessContext: 'expense_approval'
    },
    {
      id: '2',
      user: '李销售',
      action: '查看客户信息',
      resource: '华东区客户档案',
      result: 'allowed',
      reason: 'RBAC: 销售代表权限 + ABAC: 区域匹配',
      timestamp: '14:21:43',
      businessContext: 'customer_access'
    },
    {
      id: '3',
      user: '王专员',
      action: '导出薪资报表',
      resource: 'IT部门薪资数据',
      result: 'denied',
      reason: 'RBAC: 权限不足 + ABAC: 敏感数据保护',
      timestamp: '14:18:32',
      businessContext: 'hr_data_protection'
    }
  ]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setAccessContext(prev => ({
        ...prev,
        currentTime: new Date().toLocaleTimeString()
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rbac': return <Users className="h-4 w-4" />;
      case 'abac': return <Layers className="h-4 w-4" />;
      case 'integrated': return <Zap className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rbac': return 'bg-blue-100 text-blue-800';
      case 'abac': return 'bg-green-100 text-green-800';
      case 'integrated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBusinessImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Business Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            当前业务上下文
          </CardTitle>
          <CardDescription>
            实时业务环境状态，影响访问控制决策
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">{accessContext.currentTime}</div>
                <div className="text-xs text-muted-foreground">
                  {accessContext.businessHours ? '工作时间' : '非工作时间'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-medium">{accessContext.location}</div>
                <div className="text-xs text-muted-foreground">位置</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-sm font-medium">{accessContext.networkType}</div>
                <div className="text-xs text-muted-foreground">网络类型</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-sm font-medium">{accessContext.securityLevel}</div>
                <div className="text-xs text-muted-foreground">安全级别</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {accessContext.emergencyMode ? (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <div>
                <div className="text-sm font-medium">
                  {accessContext.emergencyMode ? '紧急模式' : '正常模式'}
                </div>
                <div className="text-xs text-muted-foreground">运行状态</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">{metrics.complianceScore}%</div>
                <div className="text-xs text-muted-foreground">合规分数</div>
              </div>
            </div>
          </div>
          
          {accessContext.emergencyMode && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                系统当前处于紧急模式，某些访问控制策略可能被临时调整
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>活跃用户</span>
              <Users className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <div className="text-xs text-muted-foreground">当前在线</div>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>待审批</span>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingApprovals}</div>
            <div className="text-xs text-muted-foreground">业务流程</div>
            <div className="mt-2 text-xs">
              <span className="text-orange-600">费用: 12</span> • 
              <span className="text-blue-600"> 权限: 8</span> • 
              <span className="text-purple-600"> 其他: 3</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>策略评估</span>
              <Activity className="h-4 w-4 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.policyEvaluations.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">今日总数</div>
            <div className="mt-2 text-xs">
              <span className="text-green-600">成功率: 96.8%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>紧急访问</span>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.emergencyAccess}</div>
            <div className="text-xs text-muted-foreground">当前活跃</div>
            <div className="mt-2 text-xs text-red-600">
              需要安全审计
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="policies">策略状态</TabsTrigger>
          <TabsTrigger value="activities">实时活动</TabsTrigger>
          <TabsTrigger value="integration">集成分析</TabsTrigger>
        </TabsList>

        {/* Policies Status Tab */}
        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>业务策略运行状态</CardTitle>
              <CardDescription>
                RBAC、ABAC和集成策略的实时运行状况
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policyStatuses.map((policy) => (
                  <div key={policy.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(policy.type)}
                        <span className="font-medium">{policy.name}</span>
                        <Badge className={getTypeColor(policy.type)}>
                          {policy.type.toUpperCase()}
                        </Badge>
                        <Badge className={getBusinessImpactColor(policy.businessImpact)}>
                          {policy.businessImpact}
                        </Badge>
                      </div>
                      <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                        {policy.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">评估次数</div>
                        <div className="font-medium">{policy.evaluations.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">成功率</div>
                        <div className="font-medium">{policy.successRate}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">平均响应时间</div>
                        <div className="font-medium">{policy.averageTime}ms</div>
                      </div>
                    </div>
                    
                    <Progress value={policy.successRate} className="mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>实时访问活动</CardTitle>
              <CardDescription>
                最近的访问控制决策和业务上下文
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{activity.user}</Badge>
                        <span className="text-sm">{activity.action}</span>
                        <Badge variant={activity.result === 'allowed' ? 'default' : 'destructive'}>
                          {activity.result === 'allowed' ? '允许' : '拒绝'}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    </div>
                    
                    <div className="text-sm mb-2">
                      <span className="font-medium">资源: </span>
                      {activity.resource}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">决策依据: </span>
                      {activity.reason}
                    </div>
                    
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {activity.businessContext}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Analysis Tab */}
        <TabsContent value="integration" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">RBAC效率分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">角色覆盖率</span>
                    <span className="text-sm font-medium">{metrics.rbacEfficiency}%</span>
                  </div>
                  <Progress value={metrics.rbacEfficiency} />
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>• 基础权限验证快速准确</div>
                    <div>• 角色继承关系清晰</div>
                    <div>• 权限分配合理有效</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">ABAC复杂度分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">策略复杂度</span>
                    <span className="text-sm font-medium">{metrics.abacComplexity}</span>
                  </div>
                  <Progress value={Math.min(metrics.abacComplexity / 2, 100)} />
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>• 上下文条件丰富</div>
                    <div>• 动态策略灵活</div>
                    <div>• 业务规则完整</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>RBAC+ABAC集成效果</CardTitle>
              <CardDescription>
                两种访问控制模型的协同工作效果分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">87%</div>
                  <div className="text-sm text-muted-foreground">基础权限效率</div>
                  <div className="text-xs mt-1">RBAC提供稳定基础</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">94%</div>
                  <div className="text-sm text-muted-foreground">上下文准确率</div>
                  <div className="text-xs mt-1">ABAC增强灵活性</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">96%</div>
                  <div className="text-sm text-muted-foreground">业务逻辑匹配</div>
                  <div className="text-xs mt-1">集成策略效果优秀</div>
                </div>
              </div>
              
              <Alert className="mt-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>集成优势：</strong>
                  RBAC提供了稳定的权限管理基础，ABAC增加了业务上下文的灵活性，
                  两者结合实现了既安全又灵活的访问控制体系。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
