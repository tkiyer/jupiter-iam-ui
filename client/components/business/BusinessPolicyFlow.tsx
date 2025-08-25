/**
 * Business Policy Flow Visualization
 * Shows how RBAC and ABAC policies flow together in business scenarios
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  ArrowDown, 
  ArrowRight, 
  Shield, 
  Users, 
  Settings, 
  Clock, 
  MapPin, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Layers,
  Zap,
  GitBranch
} from 'lucide-react';

interface PolicyStep {
  id: string;
  type: 'rbac' | 'abac' | 'business_rule' | 'decision';
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'passed' | 'failed';
  details: string[];
  conditions?: {
    attribute: string;
    operator: string;
    value: any;
    result: boolean;
  }[];
}

interface FlowScenario {
  id: string;
  title: string;
  description: string;
  user: string;
  action: string;
  resource: string;
  context: Record<string, any>;
  steps: PolicyStep[];
  finalResult: 'allow' | 'deny';
}

const businessFlowScenarios: FlowScenario[] = [
  {
    id: 'expense-flow',
    title: '费用审批流程',
    description: '部门经理审批30,000元设备采购费用',
    user: '张经理 (部门经理)',
    action: '审批费用',
    resource: '30,000元设备采购申请',
    context: {
      userRole: 'department_manager',
      userDepartment: 'IT',
      amount: 30000,
      expenseDepartment: 'IT',
      time: '14:30',
      businessHours: true
    },
    steps: [
      {
        id: 'rbac-1',
        type: 'rbac',
        title: 'RBAC 基础验证',
        description: '检查用户是否具有审批权限的基础角色',
        status: 'passed',
        details: [
          '用户角色: 部门经理',
          '基础权限: 费用审批',
          '权限范围: 部门级别'
        ],
        conditions: [
          { attribute: 'user_role', operator: 'equals', value: 'department_manager', result: true },
          { attribute: 'permission', operator: 'contains', value: 'expense_approval', result: true }
        ]
      },
      {
        id: 'abac-1',
        type: 'abac',
        title: 'ABAC 金额阈值检查',
        description: '验证审批金额是否在用户权限范围内',
        status: 'passed',
        details: [
          '审批金额: ¥30,000',
          '权限上限: ¥50,000',
          '结果: 在权限范围内'
        ],
        conditions: [
          { attribute: 'amount', operator: 'less_than', value: 50000, result: true },
          { attribute: 'expense_type', operator: 'equals', value: 'equipment', result: true }
        ]
      },
      {
        id: 'abac-2',
        type: 'abac',
        title: 'ABAC 部门匹配验证',
        description: '确认用户只能审批本部门的费用申请',
        status: 'passed',
        details: [
          '用户部门: IT',
          '费用申请部门: IT',
          '结果: 部门匹配'
        ],
        conditions: [
          { attribute: 'user_department', operator: 'equals', value: 'expense_department', result: true }
        ]
      },
      {
        id: 'abac-3',
        type: 'abac',
        title: 'ABAC 时间窗口检查',
        description: '验证当前时间是否在允许的业务时间范围内',
        status: 'passed',
        details: [
          '当前时间: 14:30',
          '业务时间: 09:00-18:00',
          '结果: 在业务时间内'
        ],
        conditions: [
          { attribute: 'business_hours', operator: 'equals', value: true, result: true },
          { attribute: 'time', operator: 'between', value: ['09:00', '18:00'], result: true }
        ]
      },
      {
        id: 'business-1',
        type: 'business_rule',
        title: '业务规则验证',
        description: '应用特定的费用审批业务逻辑',
        status: 'passed',
        details: [
          '审批流程: 单级审批',
          '预算检查: 通过',
          '合规性: 符合要求'
        ]
      },
      {
        id: 'decision-1',
        type: 'decision',
        title: '最终决策',
        description: '综合所有验证结果做出访问控制决定',
        status: 'passed',
        details: [
          'RBAC验证: 通过',
          'ABAC策略: 全部满足',
          '业务规则: 符合要求',
          '最终结果: 允许审批'
        ]
      }
    ],
    finalResult: 'allow'
  },
  {
    id: 'customer-access-flow',
    title: '客户数据访问流程',
    description: '销售代表访问华东区客户的财务信息',
    user: '李销售 (销售代表)',
    action: '查看客户财务信息',
    resource: '华东区客户财务档案',
    context: {
      userRole: 'sales_rep',
      userRegion: 'east_china',
      customerRegion: 'east_china',
      dataType: 'financial',
      accessLocation: 'office'
    },
    steps: [
      {
        id: 'rbac-1',
        type: 'rbac',
        title: 'RBAC 角色权限检查',
        description: '验证销售代表是否有访问客户数据的基础权限',
        status: 'passed',
        details: [
          '用户角色: 销售代表',
          '基础权限: 客户数据访问',
          '数据类型: 基础信息'
        ],
        conditions: [
          { attribute: 'user_role', operator: 'equals', value: 'sales_rep', result: true },
          { attribute: 'permission', operator: 'contains', value: 'customer_data_read', result: true }
        ]
      },
      {
        id: 'abac-1',
        type: 'abac',
        title: 'ABAC 区域匹配验证',
        description: '确认用户只能访问负责区域的客户数据',
        status: 'passed',
        details: [
          '用户负责区域: 华东',
          '客户所在区域: 华东',
          '结果: 区域匹配'
        ],
        conditions: [
          { attribute: 'user_region', operator: 'equals', value: 'customer_region', result: true }
        ]
      },
      {
        id: 'abac-2',
        type: 'abac',
        title: 'ABAC 数据分类检查',
        description: '检查请求的数据类型是否在权限范围内',
        status: 'failed',
        details: [
          '请求数据: 财务信息',
          '权限级别: 基础信息',
          '结果: 权限不足'
        ],
        conditions: [
          { attribute: 'data_type', operator: 'equals', value: 'financial', result: false },
          { attribute: 'required_clearance', operator: 'greater_than', value: 'basic', result: false }
        ]
      },
      {
        id: 'decision-1',
        type: 'decision',
        title: '最终决策',
        description: '基于策略评估结果做出访问控制决定',
        status: 'failed',
        details: [
          'RBAC验证: 通过',
          'ABAC策略: 部分失败',
          '数据分类: 权限不足',
          '最终结果: 拒绝访问'
        ]
      }
    ],
    finalResult: 'deny'
  },
  {
    id: 'hr-salary-flow',
    title: 'HR薪资数据访问流程',
    description: 'HR专员尝试查看管理层薪资信息',
    user: '王专员 (HR专员)',
    action: '查看薪资信息',
    resource: '管理层薪资数据',
    context: {
      userRole: 'hr_specialist',
      clearanceLevel: 2,
      targetRole: 'manager',
      dataType: 'salary',
      purpose: 'report_generation'
    },
    steps: [
      {
        id: 'rbac-1',
        type: 'rbac',
        title: 'RBAC 基础权限验证',
        description: '检查HR专员的基础数据访问权限',
        status: 'passed',
        details: [
          '用户角色: HR专员',
          '基础权限: 员工数据访问',
          '部门权限: 人力资源'
        ],
        conditions: [
          { attribute: 'user_role', operator: 'equals', value: 'hr_specialist', result: true },
          { attribute: 'department', operator: 'equals', value: 'hr', result: true }
        ]
      },
      {
        id: 'abac-1',
        type: 'abac',
        title: 'ABAC 权限等级检查',
        description: '验证用户的安全等级是否足够访问薪资数据',
        status: 'failed',
        details: [
          '用户等级: 2级',
          '所需等级: 3级以上',
          '结果: 等级不足'
        ],
        conditions: [
          { attribute: 'clearance_level', operator: 'greater_than', value: 3, result: false },
          { attribute: 'salary_access_level', operator: 'equals', value: 'restricted', result: false }
        ]
      },
      {
        id: 'abac-2',
        type: 'abac',
        title: 'ABAC 数据敏感性检查',
        description: '评估目标数据的敏感程度和访问要求',
        status: 'failed',
        details: [
          '数据类型: 薪资信息',
          '敏感等级: 高',
          '访问限制: 仅限HR经理以上'
        ],
        conditions: [
          { attribute: 'data_sensitivity', operator: 'equals', value: 'high', result: true },
          { attribute: 'minimum_role', operator: 'equals', value: 'hr_manager', result: false }
        ]
      },
      {
        id: 'decision-1',
        type: 'decision',
        title: '最终决策',
        description: '根据策略评估结果确定访问权限',
        status: 'failed',
        details: [
          'RBAC验证: 通过',
          'ABAC策略: 失败',
          '敏感数据: 权限不足',
          '最终结果: 拒绝访问'
        ]
      }
    ],
    finalResult: 'deny'
  }
];

export default function BusinessPolicyFlow() {
  const [selectedScenario, setSelectedScenario] = useState<FlowScenario>(businessFlowScenarios[0]);
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'rbac': return <Users className="h-5 w-5" />;
      case 'abac': return <Layers className="h-5 w-5" />;
      case 'business_rule': return <Settings className="h-5 w-5" />;
      case 'decision': return <Zap className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getStepColor = (type: string, status: string) => {
    if (status === 'pending') return 'border-gray-300 bg-gray-50';
    if (status === 'processing') return 'border-blue-300 bg-blue-50 animate-pulse';
    if (status === 'failed') return 'border-red-300 bg-red-50';
    
    switch (type) {
      case 'rbac': return 'border-blue-300 bg-blue-50';
      case 'abac': return 'border-green-300 bg-green-50';
      case 'business_rule': return 'border-purple-300 bg-purple-50';
      case 'decision': return 'border-orange-300 bg-orange-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing': return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default: return <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const runAnimation = () => {
    setIsAnimating(true);
    setAnimationStep(0);
    
    const interval = setInterval(() => {
      setAnimationStep(prev => {
        if (prev >= selectedScenario.steps.length - 1) {
          clearInterval(interval);
          setIsAnimating(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            业务策略流程可视化
          </CardTitle>
          <CardDescription>
            查看RBAC和ABAC如何在实际业务场景中协同工作
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Select
                value={selectedScenario.id}
                onValueChange={(value) => {
                  const scenario = businessFlowScenarios.find(s => s.id === value);
                  if (scenario) {
                    setSelectedScenario(scenario);
                    setAnimationStep(0);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {businessFlowScenarios.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={runAnimation} disabled={isAnimating}>
              {isAnimating ? '运行中...' : '运行流程'}
            </Button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">{selectedScenario.title}</h4>
            <p className="text-sm text-muted-foreground mb-3">{selectedScenario.description}</p>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">用户:</span> {selectedScenario.user}
              </div>
              <div>
                <span className="font-medium">操作:</span> {selectedScenario.action}
              </div>
              <div>
                <span className="font-medium">资源:</span> {selectedScenario.resource}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>策略执行流程</CardTitle>
          <CardDescription>
            逐步展示访问控制决策的完整过程
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {selectedScenario.steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Step Card */}
                <div className={`p-4 border-2 rounded-lg mb-4 transition-all duration-500 ${
                  getStepColor(step.type, isAnimating && index <= animationStep ? 'processing' : step.status)
                } ${isAnimating && index === animationStep ? 'ring-2 ring-blue-400 ring-opacity-75' : ''}`}>
                  
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      step.type === 'rbac' ? 'bg-blue-100 text-blue-600' :
                      step.type === 'abac' ? 'bg-green-100 text-green-600' :
                      step.type === 'business_rule' ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {getStepIcon(step.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold">{step.title}</h5>
                          <Badge variant="outline" className="text-xs">
                            {step.type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(isAnimating && index <= animationStep ? 
                            (index === animationStep ? 'processing' : 'passed') : 
                            step.status
                          )}
                          <Badge variant={
                            (isAnimating && index <= animationStep ? 
                              (index === animationStep ? 'processing' : 'passed') : 
                              step.status) === 'passed' ? 'default' : 'destructive'
                          } className="text-xs">
                            {isAnimating && index <= animationStep ? 
                              (index === animationStep ? '处理中' : '通过') : 
                              (step.status === 'passed' ? '通过' : '失败')
                            }
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                      
                      <div className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="text-xs flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            {detail}
                          </div>
                        ))}
                      </div>
                      
                      {step.conditions && (
                        <div className="mt-3 p-2 bg-white rounded border">
                          <div className="text-xs font-medium mb-2">条件检查:</div>
                          <div className="space-y-1">
                            {step.conditions.map((condition, condIndex) => (
                              <div key={condIndex} className="flex items-center justify-between text-xs">
                                <span className="font-mono">
                                  {condition.attribute} {condition.operator} {
                                    typeof condition.value === 'object' ? JSON.stringify(condition.value) : condition.value
                                  }
                                </span>
                                {condition.result ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-red-600" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                {index < selectedScenario.steps.length - 1 && (
                  <div className="flex justify-center mb-4">
                    <ArrowDown className={`h-6 w-6 ${
                      isAnimating && index < animationStep ? 'text-blue-600' : 'text-gray-400'
                    } transition-colors duration-500`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final Result */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {selectedScenario.finalResult === 'allow' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            最终访问决策
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className={selectedScenario.finalResult === 'allow' ? '' : 'border-red-200'}>
            {selectedScenario.finalResult === 'allow' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <strong>
                {selectedScenario.finalResult === 'allow' ? '访问允许' : '访问拒绝'}
              </strong>
              <div className="mt-2 text-sm">
                {selectedScenario.finalResult === 'allow' ? (
                  <>
                    用户通过了所有必要的验证步骤，包括RBAC基础权限检查、ABAC上下文条件验证，
                    以及相关的业务规则检查。系统允许执行请求的操作。
                  </>
                ) : (
                  <>
                    虽然用户通过了RBAC基础权限验证，但在ABAC策略检查或业务规则验证中失败，
                    因此系统拒绝了访问请求。这体现了分层防护和精细化控制的重要性。
                  </>
                )}
              </div>
            </AlertDescription>
          </Alert>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold text-blue-600">RBAC基础层</div>
              <div className="text-sm text-muted-foreground mt-1">
                提供稳定的角色权限基础
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Layers className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-semibold text-green-600">ABAC增强层</div>
              <div className="text-sm text-muted-foreground mt-1">
                基于上下文的动态控制
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Settings className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold text-purple-600">业务规则层</div>
              <div className="text-sm text-muted-foreground mt-1">
                实现特定业务逻辑
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
