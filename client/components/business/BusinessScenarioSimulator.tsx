/**
 * Business Scenario Simulator
 * Interactive tool to test how RBAC+ABAC responds to different business scenarios
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { 
  Play, 
  RotateCcw, 
  Settings, 
  Users, 
  Clock, 
  MapPin, 
  DollarSign,
  Building2,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Lightbulb
} from 'lucide-react';

interface SimulationConfig {
  user: {
    role: string;
    department: string;
    clearanceLevel: number;
    region: string;
    employmentType: string;
  };
  action: string;
  resource: {
    type: string;
    amount?: number;
    department?: string;
    classification: string;
    owner?: string;
  };
  context: {
    time: string;
    location: string;
    networkType: string;
    deviceType: string;
    emergencyMode: boolean;
  };
}

interface SimulationResult {
  finalDecision: 'allow' | 'deny';
  executionTime: number;
  evaluationSteps: {
    type: 'rbac' | 'abac' | 'business';
    name: string;
    result: boolean;
    reason: string;
    weight: number;
  }[];
  appliedPolicies: string[];
  businessImpact: string;
  recommendations: string[];
}

const roleOptions = [
  { value: 'employee', label: '普通员工', description: '基础访问权限' },
  { value: 'team_lead', label: '团队主管', description: '团队级管理权限' },
  { value: 'department_manager', label: '部门经理', description: '部门级管理权限' },
  { value: 'sales_rep', label: '销售代表', description: '客户数据访问权限' },
  { value: 'sales_manager', label: '销售经理', description: '区域销售管理权限' },
  { value: 'hr_specialist', label: 'HR专员', description: '基础人事数据权限' },
  { value: 'hr_manager', label: 'HR经理', description: '完整人事数据权限' },
  { value: 'finance_specialist', label: '财务专员', description: '基础财务数据权限' },
  { value: 'finance_manager', label: '财务经理', description: '财务管理权限' },
  { value: 'devops_engineer', label: 'DevOps工程师', description: '系统部署权限' },
  { value: 'security_officer', label: '安全主管', description: '安全管理权限' },
  { value: 'ceo', label: '首席执行官', description: '最高管理权限' }
];

const actionOptions = [
  { value: 'view', label: '查看', description: '读取数据或资源' },
  { value: 'edit', label: '编辑', description: '修改数据或配置' },
  { value: 'approve', label: '审批', description: '批准申请或流程' },
  { value: 'delete', label: '删除', description: '删除数据或资源' },
  { value: 'export', label: '导出', description: '导出数据到外部' },
  { value: 'deploy', label: '部署', description: '部署��生产环境' },
  { value: 'configure', label: '配置', description: '修改系统配置' },
  { value: 'audit', label: '审计', description: '查看审计日志' }
];

const resourceTypes = [
  { value: 'customer_data', label: '客户数据', description: '客户信息和档案' },
  { value: 'employee_data', label: '员工数据', description: '人事和薪资信息' },
  { value: 'financial_data', label: '财务数据', description: '财务报表和预算' },
  { value: 'expense_request', label: '费用申请', description: '报销和采购申请' },
  { value: 'system_config', label: '系统配置', description: '系统设置和参数' },
  { value: 'production_env', label: '生产环境', description: '生产系统和服务' },
  { value: 'audit_logs', label: '审计日志', description: '系统操作记录' },
  { value: 'security_policy', label: '安全策略', description: '安全规则和配置' }
];

export default function BusinessScenarioSimulator() {
  const [config, setConfig] = useState<SimulationConfig>({
    user: {
      role: 'department_manager',
      department: 'IT',
      clearanceLevel: 3,
      region: 'east_china',
      employmentType: 'employee'
    },
    action: 'approve',
    resource: {
      type: 'expense_request',
      amount: 30000,
      department: 'IT',
      classification: 'internal',
      owner: 'zhang_san'
    },
    context: {
      time: '14:30',
      location: 'office',
      networkType: 'internal',
      deviceType: 'corporate_laptop',
      emergencyMode: false
    }
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [presetScenarios, setPresetScenarios] = useState([
    {
      name: '费用审批场景',
      description: '部门经理审批费用申请',
      config: {
        user: { role: 'department_manager', department: 'IT', clearanceLevel: 3, region: 'east_china', employmentType: 'employee' },
        action: 'approve',
        resource: { type: 'expense_request', amount: 30000, department: 'IT', classification: 'internal' },
        context: { time: '14:30', location: 'office', networkType: 'internal', deviceType: 'corporate_laptop', emergencyMode: false }
      }
    },
    {
      name: '跨区域客户访问',
      description: '销售代表尝试访问其他区域客户',
      config: {
        user: { role: 'sales_rep', department: 'sales', clearanceLevel: 2, region: 'east_china', employmentType: 'employee' },
        action: 'view',
        resource: { type: 'customer_data', department: 'sales', classification: 'confidential', owner: 'west_china' },
        context: { time: '10:15', location: 'office', networkType: 'internal', deviceType: 'corporate_laptop', emergencyMode: false }
      }
    },
    {
      name: '紧急生产部署',
      description: '非工作时间的紧急系统部署',
      config: {
        user: { role: 'devops_engineer', department: 'IT', clearanceLevel: 4, region: 'east_china', employmentType: 'employee' },
        action: 'deploy',
        resource: { type: 'production_env', classification: 'critical' },
        context: { time: '22:45', location: 'remote', networkType: 'vpn', deviceType: 'personal_laptop', emergencyMode: true }
      }
    }
  ]);

  const runSimulation = async () => {
    setIsSimulating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock simulation logic
    const simulationResult = generateMockResult(config);
    setResult(simulationResult);
    setIsSimulating(false);
  };

  const generateMockResult = (config: SimulationConfig): SimulationResult => {
    const steps = [];
    let finalDecision: 'allow' | 'deny' = 'allow';
    
    // RBAC evaluation
    const rbacResult = evaluateRBAC(config);
    steps.push({
      type: 'rbac' as const,
      name: 'RBAC角色权限检查',
      result: rbacResult.passed,
      reason: rbacResult.reason,
      weight: 0.4
    });
    
    // ABAC evaluation
    const abacResult = evaluateABAC(config);
    steps.push({
      type: 'abac' as const,
      name: 'ABAC上下文策略',
      result: abacResult.passed,
      reason: abacResult.reason,
      weight: 0.4
    });
    
    // Business rules evaluation
    const businessResult = evaluateBusinessRules(config);
    steps.push({
      type: 'business' as const,
      name: '业务规则验证',
      result: businessResult.passed,
      reason: businessResult.reason,
      weight: 0.2
    });
    
    // Final decision
    if (!rbacResult.passed || !abacResult.passed || !businessResult.passed) {
      finalDecision = 'deny';
    }
    
    return {
      finalDecision,
      executionTime: Math.random() * 50 + 10,
      evaluationSteps: steps,
      appliedPolicies: ['费用审批分级策略', '部门权限控制策略', '工作时间限制策略'],
      businessImpact: finalDecision === 'allow' ? '操作被允许，业务流程可以继续' : '操作被拒绝，需要额外授权或调整',
      recommendations: generateRecommendations(config, finalDecision)
    };
  };

  const evaluateRBAC = (config: SimulationConfig) => {
    const { user, action, resource } = config;
    
    // Simple role-based logic
    if (user.role === 'employee' && ['approve', 'delete', 'configure'].includes(action)) {
      return { passed: false, reason: '普通员工无权执行管理操作' };
    }
    
    if (action === 'approve' && resource.type === 'expense_request') {
      if (user.role === 'department_manager' && resource.amount && resource.amount <= 50000) {
        return { passed: true, reason: '部门经理有权审批5万以下费用' };
      }
      if (resource.amount && resource.amount > 50000 && user.role !== 'ceo') {
        return { passed: false, reason: '超出审批权限，需要更高级别审批' };
      }
    }
    
    return { passed: true, reason: '角色权限验证通过' };
  };

  const evaluateABAC = (config: SimulationConfig) => {
    const { user, resource, context } = config;
    
    // Department matching
    if (resource.department && user.department !== resource.department) {
      return { passed: false, reason: '跨部门访问需要特殊授权' };
    }
    
    // Time-based access
    const hour = parseInt(context.time.split(':')[0]);
    if ((hour < 9 || hour > 18) && !context.emergencyMode) {
      return { passed: false, reason: '非工作时间访问受限' };
    }
    
    // Location-based access
    if (resource.classification === 'critical' && context.location !== 'office' && !context.emergencyMode) {
      return { passed: false, reason: '关键资源需要在办公室访问' };
    }
    
    // Network security
    if (resource.classification === 'confidential' && context.networkType === 'public') {
      return { passed: false, reason: '机密资源不允许通过公网访问' };
    }
    
    return { passed: true, reason: '上下文条件验证通过' };
  };

  const evaluateBusinessRules = (config: SimulationConfig) => {
    const { user, action, resource } = config;
    
    // Emergency access rules
    if (config.context.emergencyMode && user.clearanceLevel < 3) {
      return { passed: false, reason: '紧急模式需要3级以上安全等级' };
    }
    
    // Data classification rules
    if (resource.classification === 'critical' && user.clearanceLevel < 4) {
      return { passed: false, reason: '关键数据需要4级以上安全等级' };
    }
    
    // Employment type restrictions
    if (user.employmentType === 'contractor' && resource.classification !== 'public') {
      return { passed: false, reason: '外包人员仅可访问公开资源' };
    }
    
    return { passed: true, reason: '业务规则验证通过' };
  };

  const generateRecommendations = (config: SimulationConfig, decision: 'allow' | 'deny'): string[] => {
    const recommendations = [];
    
    if (decision === 'deny') {
      recommendations.push('考虑申请更高级别的访问权限');
      recommendations.push('在工作时间内重新尝试操作');
      recommendations.push('使用公司网络和设备进行访问');
      
      if (config.context.emergencyMode) {
        recommendations.push('联系安全主管获取紧急授权');
      }
    } else {
      recommendations.push('访问已被允许，请按照公司政策操作');
      recommendations.push('确保操作符合数据保护要求');
      
      if (config.resource.classification === 'confidential') {
        recommendations.push('请注意保护机密信息的安全');
      }
    }
    
    return recommendations;
  };

  const loadPresetScenario = (scenarioConfig: any) => {
    setConfig(scenarioConfig);
    setResult(null);
  };

  const resetSimulation = () => {
    setResult(null);
    setConfig({
      user: {
        role: 'employee',
        department: 'IT',
        clearanceLevel: 2,
        region: 'east_china',
        employmentType: 'employee'
      },
      action: 'view',
      resource: {
        type: 'customer_data',
        classification: 'internal'
      },
      context: {
        time: '14:30',
        location: 'office',
        networkType: 'internal',
        deviceType: 'corporate_laptop',
        emergencyMode: false
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            业务场景模拟器
          </CardTitle>
          <CardDescription>
            配置不同的用户、操作和上下文，测试RBAC+ABAC访问控制的响应
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={runSimulation} disabled={isSimulating} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              {isSimulating ? '模拟中...' : '运行模拟'}
            </Button>
            <Button variant="outline" onClick={resetSimulation} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              重置
            </Button>
          </div>

          {/* Preset Scenarios */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">预设场景</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {presetScenarios.map((scenario, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => loadPresetScenario(scenario.config)}
                  className="text-left justify-start h-auto p-3"
                >
                  <div>
                    <div className="font-medium">{scenario.name}</div>
                    <div className="text-xs text-muted-foreground">{scenario.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>模拟配置</CardTitle>
            <CardDescription>设置用户、操作和上下文参数</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="user" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="user">用户</TabsTrigger>
                <TabsTrigger value="action">操作</TabsTrigger>
                <TabsTrigger value="resource">资源</TabsTrigger>
                <TabsTrigger value="context">上下文</TabsTrigger>
              </TabsList>

              {/* User Tab */}
              <TabsContent value="user" className="space-y-4">
                <div>
                  <Label htmlFor="user-role">用户角色</Label>
                  <Select value={config.user.role} onValueChange={(value) => 
                    setConfig(prev => ({ ...prev, user: { ...prev.user, role: value } }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div>
                            <div>{role.label}</div>
                            <div className="text-xs text-muted-foreground">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="user-department">部门</Label>
                  <Select value={config.user.department} onValueChange={(value) => 
                    setConfig(prev => ({ ...prev, user: { ...prev.user, department: value } }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT">信息技术部</SelectItem>
                      <SelectItem value="sales">销售部</SelectItem>
                      <SelectItem value="hr">人力资源部</SelectItem>
                      <SelectItem value="finance">财务部</SelectItem>
                      <SelectItem value="marketing">市场部</SelectItem>
                      <SelectItem value="operations">运营部</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="clearance-level">安全等级: {config.user.clearanceLevel}</Label>
                  <Slider
                    value={[config.user.clearanceLevel]}
                    onValueChange={(value) => 
                      setConfig(prev => ({ ...prev, user: { ...prev.user, clearanceLevel: value[0] } }))
                    }
                    max={5}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    1=基础, 2=标准, 3=提升, 4=高级, 5=最高
                  </div>
                </div>

                <div>
                  <Label htmlFor="region">负责区域</Label>
                  <Select value={config.user.region} onValueChange={(value) => 
                    setConfig(prev => ({ ...prev, user: { ...prev.user, region: value } }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="east_china">华东</SelectItem>
                      <SelectItem value="west_china">华西</SelectItem>
                      <SelectItem value="north_china">华北</SelectItem>
                      <SelectItem value="south_china">华南</SelectItem>
                      <SelectItem value="nationwide">全国</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Action Tab */}
              <TabsContent value="action" className="space-y-4">
                <div>
                  <Label htmlFor="action">执行操作</Label>
                  <Select value={config.action} onValueChange={(value) => 
                    setConfig(prev => ({ ...prev, action: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actionOptions.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          <div>
                            <div>{action.label}</div>
                            <div className="text-xs text-muted-foreground">{action.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Resource Tab */}
              <TabsContent value="resource" className="space-y-4">
                <div>
                  <Label htmlFor="resource-type">资源类型</Label>
                  <Select value={config.resource.type} onValueChange={(value) => 
                    setConfig(prev => ({ ...prev, resource: { ...prev.resource, type: value } }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div>{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {config.resource.type === 'expense_request' && (
                  <div>
                    <Label htmlFor="amount">费用金额 (元)</Label>
                    <Input
                      type="number"
                      value={config.resource.amount || 0}
                      onChange={(e) => 
                        setConfig(prev => ({ 
                          ...prev, 
                          resource: { ...prev.resource, amount: parseInt(e.target.value) || 0 } 
                        }))
                      }
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="classification">数据分类</Label>
                  <Select value={config.resource.classification} onValueChange={(value) => 
                    setConfig(prev => ({ ...prev, resource: { ...prev.resource, classification: value } }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">公开</SelectItem>
                      <SelectItem value="internal">内部</SelectItem>
                      <SelectItem value="confidential">机密</SelectItem>
                      <SelectItem value="critical">关键</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Context Tab */}
              <TabsContent value="context" className="space-y-4">
                <div>
                  <Label htmlFor="time">访问时间</Label>
                  <Input
                    type="time"
                    value={config.context.time}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, context: { ...prev.context, time: e.target.value } }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="location">访问位置</Label>
                  <Select value={config.context.location} onValueChange={(value) => 
                    setConfig(prev => ({ ...prev, context: { ...prev.context, location: value } }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">办公室</SelectItem>
                      <SelectItem value="home">家庭</SelectItem>
                      <SelectItem value="remote">远程</SelectItem>
                      <SelectItem value="mobile">移动</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="network">网络类型</Label>
                  <Select value={config.context.networkType} onValueChange={(value) => 
                    setConfig(prev => ({ ...prev, context: { ...prev.context, networkType: value } }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">内网</SelectItem>
                      <SelectItem value="vpn">VPN</SelectItem>
                      <SelectItem value="public">公网</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.context.emergencyMode}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, context: { ...prev.context, emergencyMode: checked } }))
                    }
                  />
                  <Label htmlFor="emergency">紧急模式</Label>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle>模拟结果</CardTitle>
            <CardDescription>访问控制决策和详细分析</CardDescription>
          </CardHeader>
          <CardContent>
            {isSimulating ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="text-muted-foreground">正在评估访问控制策略...</div>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* Final Decision */}
                <Alert className={result.finalDecision === 'allow' ? '' : 'border-red-200'}>
                  {result.finalDecision === 'allow' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {result.finalDecision === 'allow' ? '访问允许' : '访问拒绝'}
                      </span>
                      <Badge variant={result.finalDecision === 'allow' ? 'default' : 'destructive'}>
                        {result.executionTime.toFixed(1)}ms
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm">
                      {result.businessImpact}
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Evaluation Steps */}
                <div className="space-y-3">
                  <h4 className="font-semibold">评估步骤</h4>
                  {result.evaluationSteps.map((step, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {step.type === 'rbac' && <Users className="h-4 w-4 text-blue-600" />}
                          {step.type === 'abac' && <Shield className="h-4 w-4 text-green-600" />}
                          {step.type === 'business' && <Building2 className="h-4 w-4 text-purple-600" />}
                          <span className="font-medium">{step.name}</span>
                          <Badge variant="outline" className="text-xs">
                            权重: {(step.weight * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        {step.result ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {step.reason}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Applied Policies */}
                <div>
                  <h4 className="font-semibold mb-2">应用策略</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.appliedPolicies.map((policy, index) => (
                      <Badge key={index} variant="outline">
                        {policy}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-semibold mb-2">建议</h4>
                  <div className="space-y-2">
                    {result.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        {recommendation}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center space-y-2">
                  <Info className="h-8 w-8 mx-auto" />
                  <div>配置参数后点击"运行模拟"查看结果</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
