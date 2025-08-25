/**
 * Business Scenarios Page
 * Demonstrates how RBAC and ABAC work together in real business contexts
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Building2,
  CreditCard,
  Users,
  FileText,
  Clock,
  MapPin,
  Shield,
  Briefcase,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Settings,
  GitBranch
} from 'lucide-react';
import BusinessAccessDashboard from '../components/business/BusinessAccessDashboard';
import BusinessPolicyFlow from '../components/business/BusinessPolicyFlow';
import BusinessScenarioSimulator from '../components/business/BusinessScenarioSimulator';
import BusinessWorkflowSystem from '../components/business/BusinessWorkflowSystem';

interface BusinessScenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  rbacRequirements: string[];
  abacConditions: string[];
  businessRules: string[];
  exampleCase: {
    user: string;
    action: string;
    context: Record<string, any>;
    expectedResult: 'allow' | 'deny';
    reasoning: string;
  };
}

const businessScenarios: BusinessScenario[] = [
  {
    id: 'expense-approval',
    title: '费用审批工作流',
    description: '员工提交费用报销，需要基于角色和金额进行分级审批',
    icon: <CreditCard className="h-5 w-5" />,
    rbacRequirements: [
      '员工角色：可提交费用报销申请',
      '部门经理：可审批本部门5万以下费用',
      '财务经理：可审批10万以下费用',
      '总经理：可审批所有费用'
    ],
    abacConditions: [
      '费用金额：不同金额需要不同审批级别',
      '部门匹配：只能审批本部门的费用',
      '工作时间：非工作时间限制审批',
      '紧急情况：紧急费用可跨级��批'
    ],
    businessRules: [
      '5万以下：部门经理审批',
      '5-10万：财务经理审批',
      '10万以上：总经理审批',
      '紧急费用：可临时授权审批'
    ],
    exampleCase: {
      user: '张经理 (部门经理)',
      action: '审批费用',
      context: { amount: 30000, department: 'IT', emergency: false, time: '14:30' },
      expectedResult: 'allow',
      reasoning: 'RBAC: 有部门经理角色 + ABAC: 金额在权限范围内(5万以下) + 本部门费用'
    }
  },
  {
    id: 'customer-data-access',
    title: '客户数据访问控制',
    description: '销售人员访问客户数据需要考虑地域、客户关系和数据敏感性',
    icon: <Users className="h-5 w-5" />,
    rbacRequirements: [
      '销售代表：访问分配客户基本信息',
      '区域经理：访问区域内所有客户信息',
      '销售总监：访问全部客户信息',
      '客服专员：只读客户联系信息'
    ],
    abacConditions: [
      '地理区域：只能访问负责区域的客户',
      '客户关系：只能访问分配给自己的客户',
      '数据分类：敏感数据需要额外权限',
      '访问时间：非工作时间受限'
    ],
    businessRules: [
      '销售只能访问自己负责的客户',
      '敏感信息需要高级权限',
      '跨区域访问需要特殊授权',
      '客户投诉时可临时开放访问'
    ],
    exampleCase: {
      user: '李销售 (销售代表)',
      action: '查看客户财务信息',
      context: { region: '华东', customerOwner: '李销售', dataType: 'financial', workHours: true },
      expectedResult: 'allow',
      reasoning: 'RBAC: 有销售角色 + ABAC: 是客户负责人 + 工作时间 + 有财务数据权限'
    }
  },
  {
    id: 'hr-system-access',
    title: 'HR系统分级访问',
    description: '人力资源系统根据角色和部门限制敏感员工信息访问',
    icon: <Briefcase className="h-5 w-5" />,
    rbacRequirements: [
      'HR专员：查看基本员工信息',
      'HR经理：查看薪资福利信息',
      '部门经理：查看本部门员工信息',
      'CEO：查看所有员工信息'
    ],
    abacConditions: [
      '部门限制：只能查看本部门员工',
      '薪资信息：需要特定级别权限',
      '个人隐私：需要合规授权',
      '批量操作：需要额外验证'
    ],
    businessRules: [
      '薪资信息只对HR经理以上开放',
      '跨部门查询需要特殊申请',
      '批量导出需要安全审计',
      '敏感操作需要双重验证'
    ],
    exampleCase: {
      user: '王经理 (部门经理)',
      action: '查看员工薪资',
      context: { targetDepartment: 'IT', targetEmployee: '张三', dataType: 'salary', requestReason: 'performance_review' },
      expectedResult: 'deny',
      reasoning: 'RBAC: 有部门经理角色但无薪资查看权限 + ABAC: 薪资信息需要HR经理级别'
    }
  },
  {
    id: 'production-deployment',
    title: '生产环境部署控制',
    description: '开发人员部署生产环境需要多重验证和时间窗口限制',
    icon: <Building2 className="h-5 w-5" />,
    rbacRequirements: [
      '开发工程师：部署测试环境',
      '高级工程师：部署预发布环境',
      'DevOps工程师：部署生产环境',
      '技术总监：紧急生产部署'
    ],
    abacConditions: [
      '部署窗口：只在指定时间窗口部署',
      '变更级别：重大变更需要审批',
      '紧急情况：紧急修复可特殊授权',
      '安全检查：必须通过安全扫描'
    ],
    businessRules: [
      '生产部署只在维护窗口进行',
      '紧急修复需要双人确认',
      '重大变更需要审批流程',
      '所有部署必须可回滚'
    ],
    exampleCase: {
      user: '陈工程师 (DevOps工程师)',
      action: '生产环境部署',
      context: { deploymentWindow: true, changeLevel: 'minor', emergency: false, securityCheck: 'passed' },
      expectedResult: 'allow',
      reasoning: 'RBAC: 有DevOps权限 + ABAC: 在部署窗口内 + 通过安全检查 + 小版本变更'
    }
  },
  {
    id: 'financial-report-access',
    title: '财务报表访问权限',
    description: '财务数据根据用户级别和报表类型实施精细化访问控制',
    icon: <FileText className="h-5 w-5" />,
    rbacRequirements: [
      '财务专员：查看基础财务报表',
      '财务经理：查看详细财务分析',
      '部门经理：查看本部门预算',
      'CFO：查看所有财务数据'
    ],
    abacConditions: [
      '报表分类：不同类型需要不同权限',
      '时间范围：历史数据需要特殊权限',
      '数据粒度：明细数据需要高级权限',
      '导出限制：敏感数据限制导出'
    ],
    businessRules: [
      '季度报表需要经理级别权限',
      '年度预算只对高管开放',
      '实时数据需要特殊授权',
      '数据导出需要审批记录'
    ],
    exampleCase: {
      user: '刘专员 (财务专员)',
      action: '查看季度利润报表',
      context: { reportType: 'quarterly_profit', dataGranularity: 'summary', exportRequest: false },
      expectedResult: 'deny',
      reasoning: 'RBAC: 只有财务专员权限 + ABAC: 季度报表需要经理级别权限'
    }
  }
];

export default function BusinessScenarios() {
  const [selectedScenario, setSelectedScenario] = useState<BusinessScenario>(businessScenarios[0]);
  const [testUser, setTestUser] = useState('');
  const [testAction, setTestAction] = useState('');
  const [testContext, setTestContext] = useState('{}');
  const [testResults, setTestResults] = useState<any[]>([]);

  const runBusinessScenarioTest = async () => {
    try {
      const contextObj = JSON.parse(testContext || '{}');
      
      // Simulate business logic evaluation
      const mockEvaluation = {
        allowed: Math.random() > 0.3,
        reason: '基于RBAC角色权限和ABAC业务规则的综合判断',
        rbacResult: {
          allowed: Math.random() > 0.5,
          appliedRoles: ['部门经理', '财务审批员'],
          reason: 'RBAC: 用户具有必要的角色权限'
        },
        abacResult: {
          allowed: Math.random() > 0.4,
          appliedPolicies: ['业务时间限制', '金额阈值检查', '部门匹配验证'],
          reason: 'ABAC: 业务上下文满足策略要求'
        },
        businessRules: [
          '费用金��在审批权限范围内',
          '访问时间符合业务时间窗口',
          '部门匹配验证通过'
        ],
        evaluationTime: `${(Math.random() * 50 + 10).toFixed(1)}ms`
      };

      setTestResults(prev => [{
        id: Date.now(),
        scenario: selectedScenario.title,
        user: testUser,
        action: testAction,
        context: contextObj,
        result: mockEvaluation,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('业务场景测试失败:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RBAC+ABAC 业务场景</h1>
          <p className="text-muted-foreground">
            实际业务场景中RBAC和ABAC的协同应用，形成完整的业务逻辑控制
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">实时仪表板</TabsTrigger>
          <TabsTrigger value="scenarios">业务场景</TabsTrigger>
          <TabsTrigger value="flow">策略流程</TabsTrigger>
          <TabsTrigger value="simulator">场景模拟器</TabsTrigger>
          <TabsTrigger value="integration">RBAC+ABAC集成</TabsTrigger>
          <TabsTrigger value="testing">场景测试</TabsTrigger>
          <TabsTrigger value="workflows">业务工作流</TabsTrigger>
        </TabsList>

        {/* 实时仪表板 Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <BusinessAccessDashboard />
        </TabsContent>

        {/* 业务场景 Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 场景列表 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">典型业务场景</h3>
              {businessScenarios.map((scenario) => (
                <Card 
                  key={scenario.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedScenario.id === scenario.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      {scenario.icon}
                      {scenario.title}
                    </CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* 场景详情 */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {selectedScenario.icon}
                    {selectedScenario.title}
                  </CardTitle>
                  <CardDescription>{selectedScenario.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-blue-600">RBAC 角色要求</h4>
                    <ul className="space-y-1">
                      {selectedScenario.rbacRequirements.map((req, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5">RBAC</Badge>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2 text-green-600">ABAC 上下文条件</h4>
                    <ul className="space-y-1">
                      {selectedScenario.abacConditions.map((condition, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5">ABAC</Badge>
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2 text-purple-600">业务规则</h4>
                    <ul className="space-y-1">
                      {selectedScenario.businessRules.map((rule, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <Badge variant="secondary" className="mt-0.5">规则</Badge>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">示例案例</h4>
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="font-medium">用户:</span>
                        <span>{selectedScenario.exampleCase.user}</span>
                        <span className="font-medium">操作:</span>
                        <span>{selectedScenario.exampleCase.action}</span>
                        <span className="font-medium">结果:</span>
                        <Badge variant={selectedScenario.exampleCase.expectedResult === 'allow' ? 'default' : 'destructive'}>
                          {selectedScenario.exampleCase.expectedResult === 'allow' ? '允许' : '拒绝'}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">上下文:</span>
                        <pre className="mt-1 text-xs bg-white p-2 rounded">
                          {JSON.stringify(selectedScenario.exampleCase.context, null, 2)}
                        </pre>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">判断逻辑:</span>
                        <p className="mt-1 text-green-700">{selectedScenario.exampleCase.reasoning}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 策略流程 Tab */}
        <TabsContent value="flow" className="space-y-6">
          <BusinessPolicyFlow />
        </TabsContent>

        {/* 场景模拟器 Tab */}
        <TabsContent value="simulator" className="space-y-6">
          <BusinessScenarioSimulator />
        </TabsContent>

        {/* RBAC+ABAC集成 Tab */}
        <TabsContent value="integration" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  RBAC 基础层
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded">
                    <h5 className="font-medium text-blue-800">角色定义</h5>
                    <p className="text-sm text-blue-600">定义组织中的基础角色和权限</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded">
                    <h5 className="font-medium text-blue-800">权限分配</h5>
                    <p className="text-sm text-blue-600">为角色分配基础的资源访问权限</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded">
                    <h5 className="font-medium text-blue-800">层级结构</h5>
                    <p className="text-sm text-blue-600">建立角色继承和权限传递关系</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  ABAC 增强层
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded">
                    <h5 className="font-medium text-green-800">动态策略</h5>
                    <p className="text-sm text-green-600">根据上下文动态调整访问权限</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <h5 className="font-medium text-green-800">细粒度控制</h5>
                    <p className="text-sm text-green-600">基于属性的精细化权限控制</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <h5 className="font-medium text-green-800">业务规则</h5>
                    <p className="text-sm text-green-600">实现复杂的业务逻辑和约束</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  业务逻辑层
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded">
                    <h5 className="font-medium text-purple-800">工作流集成</h5>
                    <p className="text-sm text-purple-600">与业务流程和工作流系统集成</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <h5 className="font-medium text-purple-800">审批流程</h5>
                    <p className="text-sm text-purple-600">实现多级审批和授权流���</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <h5 className="font-medium text-purple-800">合规检查</h5>
                    <p className="text-sm text-purple-600">满足行业规范和合规要求</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>集成决策流程</CardTitle>
              <CardDescription>RBAC和ABAC如何协同工作形成最终的访问决策</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">RBAC 基础验证</h4>
                    <p className="text-sm text-muted-foreground">验证用户是否具有执行操作的基础角色权限</p>
                  </div>
                  <Badge variant="outline">基础层</Badge>
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">ABAC 上下文检查</h4>
                    <p className="text-sm text-muted-foreground">基于当前上下文和属性应用动态策略</p>
                  </div>
                  <Badge variant="outline">增强层</Badge>
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">业务规则应用</h4>
                    <p className="text-sm text-muted-foreground">应用特定的业务逻辑和工作流规则</p>
                  </div>
                  <Badge variant="outline">业务层</Badge>
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h4 className="font-semibold">最终决策</h4>
                    <p className="text-sm text-muted-foreground">综合所有层面的结果，做出最终的访问控制决策</p>
                  </div>
                  <Badge variant="default">决策</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 场景测试 Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>业务场景测试器</CardTitle>
              <CardDescription>测试特定业务场景下的RBAC+ABAC访问控制逻辑</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="scenario-select">业务场景</Label>
                  <Select value={selectedScenario.id} onValueChange={(value) => {
                    const scenario = businessScenarios.find(s => s.id === value);
                    if (scenario) setSelectedScenario(scenario);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {businessScenarios.map((scenario) => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                          {scenario.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="test-user">测试用户</Label>
                  <Input
                    id="test-user"
                    value={testUser}
                    onChange={(e) => setTestUser(e.target.value)}
                    placeholder="e.g., 张经理 (部门经理)"
                  />
                </div>
                <div>
                  <Label htmlFor="test-action">执行操作</Label>
                  <Input
                    id="test-action"
                    value={testAction}
                    onChange={(e) => setTestAction(e.target.value)}
                    placeholder="e.g., 审批费用"
                  />
                </div>
                <div>
                  <Label htmlFor="test-context">业务上下文</Label>
                  <Input
                    id="test-context"
                    value={testContext}
                    onChange={(e) => setTestContext(e.target.value)}
                    placeholder='{"amount": 30000}'
                  />
                </div>
              </div>
              
              <Button onClick={runBusinessScenarioTest} className="w-full">
                运行业务场景测试
              </Button>

              {testResults.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">测试结果</h4>
                  {testResults.map((test) => (
                    <Card key={test.id}>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">{test.scenario}</h5>
                              <p className="text-sm text-muted-foreground">
                                {test.user} → {test.action}
                              </p>
                            </div>
                            <Badge variant={test.result.allowed ? 'default' : 'destructive'}>
                              {test.result.allowed ? '允许访问' : '拒绝访问'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 border rounded">
                              <h6 className="font-medium text-blue-600 mb-1">RBAC 结果</h6>
                              <div className="flex items-center gap-2 mb-1">
                                {test.result.rbacResult.allowed ? 
                                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                  <XCircle className="h-4 w-4 text-red-500" />
                                }
                                <span>{test.result.rbacResult.allowed ? '通过' : '未通过'}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{test.result.rbacResult.reason}</p>
                            </div>

                            <div className="p-3 border rounded">
                              <h6 className="font-medium text-green-600 mb-1">ABAC 结果</h6>
                              <div className="flex items-center gap-2 mb-1">
                                {test.result.abacResult.allowed ? 
                                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                  <XCircle className="h-4 w-4 text-red-500" />
                                }
                                <span>{test.result.abacResult.allowed ? '通过' : '未通过'}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{test.result.abacResult.reason}</p>
                            </div>
                          </div>

                          <div className="p-3 bg-gray-50 rounded">
                            <h6 className="font-medium mb-2">应用的业务规则</h6>
                            <ul className="text-sm space-y-1">
                              {test.result.businessRules.map((rule: string, index: number) => (
                                <li key={index} className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  {rule}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            评估时间: {test.result.evaluationTime} | 
                            测试时间: {new Date(test.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 业务工作流 Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  费用审批工作流
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                    <h5 className="font-medium">第一步：提交申请</h5>
                    <p className="text-sm text-muted-foreground">员工提交费用报销申请</p>
                    <div className="mt-2 text-xs">
                      <Badge variant="outline">RBAC: 员工角色</Badge>
                    </div>
                  </div>
                  
                  <div className="p-3 border-l-4 border-green-500 bg-green-50">
                    <h5 className="font-medium">第二步：自动路由</h5>
                    <p className="text-sm text-muted-foreground">系统根据金额自动分配审批人</p>
                    <div className="mt-2 text-xs space-x-1">
                      <Badge variant="outline">ABAC: 金额条件</Badge>
                      <Badge variant="outline">ABAC: 部门匹配</Badge>
                    </div>
                  </div>

                  <div className="p-3 border-l-4 border-purple-500 bg-purple-50">
                    <h5 className="font-medium">第三步：分级审批</h5>
                    <p className="text-sm text-muted-foreground">按层级进行审批决策</p>
                    <div className="mt-2 text-xs space-x-1">
                      <Badge variant="outline">RBAC: 审批权限</Badge>
                      <Badge variant="outline">业务: 审批流程</Badge>
                    </div>
                  </div>

                  <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                    <h5 className="font-medium">第四步：执行支付</h5>
                    <p className="text-sm text-muted-foreground">财务系统执行付款操作</p>
                    <div className="mt-2 text-xs">
                      <Badge variant="outline">RBAC: 财务权限</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  生产部署工作流
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                    <h5 className="font-medium">第一步：变更申请</h5>
                    <p className="text-sm text-muted-foreground">开发者提交部署申请</p>
                    <div className="mt-2 text-xs">
                      <Badge variant="outline">RBAC: 开发者角色</Badge>
                    </div>
                  </div>
                  
                  <div className="p-3 border-l-4 border-green-500 bg-green-50">
                    <h5 className="font-medium">第二步：安全检查</h5>
                    <p className="text-sm text-muted-foreground">自动安全扫描和人工审核</p>
                    <div className="mt-2 text-xs space-x-1">
                      <Badge variant="outline">ABAC: 安全策略</Badge>
                      <Badge variant="outline">ABAC: 变更级别</Badge>
                    </div>
                  </div>

                  <div className="p-3 border-l-4 border-purple-500 bg-purple-50">
                    <h5 className="font-medium">第三步：窗口验证</h5>
                    <p className="text-sm text-muted-foreground">检查部署时间窗口</p>
                    <div className="mt-2 text-xs space-x-1">
                      <Badge variant="outline">ABAC: 时间窗口</Badge>
                      <Badge variant="outline">业务: 维护计划</Badge>
                    </div>
                  </div>

                  <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                    <h5 className="font-medium">第四步：执行部署</h5>
                    <p className="text-sm text-muted-foreground">DevOps执行生产部署</p>
                    <div className="mt-2 text-xs">
                      <Badge variant="outline">RBAC: DevOps权限</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>工作流集成架构</CardTitle>
              <CardDescription>展示RBAC+ABAC如何与业务工作流系统集成</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>集成要点：</strong>
                    RBAC提供基础权限验证，ABAC实现动态策略控制，业务工作流引擎协调整个流程执行。
                    三者协同工作，确保访问控制既满足安全要求，又符合业务逻辑。
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium text-blue-600 mb-2">权限验证</h5>
                    <ul className="space-y-1 text-xs">
                      <li>• 用户身份认证</li>
                      <li>• 角色权限检查</li>
                      <li>• 基础操作授权</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium text-green-600 mb-2">策略控制</h5>
                    <ul className="space-y-1 text-xs">
                      <li>• 上下文条件检查</li>
                      <li>• 动态策略应用</li>
                      <li>• 细粒度访问控制</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium text-purple-600 mb-2">流程协调</h5>
                    <ul className="space-y-1 text-xs">
                      <li>• 工作流路由</li>
                      <li>• 审批流程管理</li>
                      <li>• 业务规则执行</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
