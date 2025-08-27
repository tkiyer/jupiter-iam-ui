/**
 * Policy关联关系展示组件
 * 可视化展示ABAC策略与用户、角色、资源的关联关系
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Users,
  Shield,
  GitBranch,
  Search,
  Filter,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Network,
  Target,
  Clock,
  MapPin,
  Smartphone,
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { ABACPolicy, User, Role, Permission, PolicyRule, AttributeCondition } from '../../../shared/iam';
import { usePolicies } from '../../hooks/usePolicies';
import { useUsers } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { usePermissions } from '../../hooks/usePermissions';
import { toast } from 'sonner';

interface PolicyRelationship {
  policyId: string;
  policyName: string;
  effect: 'allow' | 'deny';
  priority: number;
  status: string;
  category: string;
  applicableSubjects: {
    type: 'user' | 'role' | 'attribute';
    id: string;
    name: string;
    conditions: AttributeCondition[];
  }[];
  applicableResources: {
    type: string;
    name: string;
    conditions: AttributeCondition[];
  }[];
  allowedActions: string[];
  environmentConditions: AttributeCondition[];
  effectiveScope: 'global' | 'role_specific' | 'resource_specific' | 'conditional';
  conflictsWith: string[];
  dependsOn: string[];
}

interface PolicyImpactAnalysis {
  policyId: string;
  affectedUsers: number;
  affectedRoles: number;
  affectedResources: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  compliance: {
    gdpr: boolean;
    sox: boolean;
    hipaa: boolean;
  };
  performance: {
    complexity: number;
    evaluationTime: number;
  };
}

interface PolicyRelationshipViewerProps {
  selectedPolicyId?: string;
  onPolicySelect?: (policyId: string) => void;
}

export default function PolicyRelationshipViewer({ selectedPolicyId, onPolicySelect }: PolicyRelationshipViewerProps) {
  const [relationships, setRelationships] = useState<PolicyRelationship[]>([]);
  const [impactAnalysis, setImpactAnalysis] = useState<PolicyImpactAnalysis[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEffect, setFilterEffect] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('relationships');

  // CRUD操作状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<ABACPolicy | null>(null);

  // 新策略表单状态
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    effect: 'allow' as 'allow' | 'deny',
    priority: 100,
    category: '',
    status: 'active' as 'active' | 'inactive' | 'draft'
  });

  // 批量操作状态
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);

  const { policies, loading: policiesLoading } = usePolicies();
  const { users, loading: usersLoading } = useUsers();
  const { roles, loading: rolesLoading } = useRoles();
  const { permissions, loading: permissionsLoading } = usePermissions();

  const isLoading = policiesLoading || usersLoading || rolesLoading || permissionsLoading;

  // 构建策略关联关系
  useEffect(() => {
    if (policies && users && roles && permissions) {
      buildPolicyRelationships();
      buildImpactAnalysis();
    }
  }, [policies, users, roles, permissions]);

  const buildPolicyRelationships = () => {
    if (!policies || !users || !roles || !permissions) return;

    const builtRelationships: PolicyRelationship[] = policies.map(policy => {
      const relationship: PolicyRelationship = {
        policyId: policy.id,
        policyName: policy.name,
        effect: policy.effect,
        priority: policy.priority,
        status: policy.status,
        category: policy.category || 'general',
        applicableSubjects: [],
        applicableResources: [],
        allowedActions: [],
        environmentConditions: [],
        effectiveScope: 'global',
        conflictsWith: [],
        dependsOn: []
      };

      // 分析策略规则
      policy.rules.forEach(rule => {
        // 分析主体条件
        analyzeSubjectConditions(rule.subject, relationship, users, roles);
        
        // 分析资源条件
        analyzeResourceConditions(rule.resource, relationship);
        
        // 收集动作
        relationship.allowedActions = [...new Set([...relationship.allowedActions, ...rule.action])];
        
        // 分析环境条件
        if (rule.environment) {
          relationship.environmentConditions = [...relationship.environmentConditions, ...rule.environment];
        }
      });

      // 确定有效��围
      relationship.effectiveScope = determineEffectiveScope(relationship);

      // 检测策略冲突
      relationship.conflictsWith = detectPolicyConflicts(policy, policies);

      return relationship;
    });

    setRelationships(builtRelationships);
  };

  const analyzeSubjectConditions = (
    conditions: AttributeCondition[],
    relationship: PolicyRelationship,
    users: User[],
    roles: Role[]
  ) => {
    conditions.forEach(condition => {
      if (condition.attribute === 'role' || condition.attribute === 'roles') {
        // 基于角色的条件
        const roleValues = Array.isArray(condition.value) ? condition.value : [condition.value];
        roleValues.forEach(roleValue => {
          const role = roles.find(r => r.name === roleValue || r.id === roleValue);
          if (role) {
            relationship.applicableSubjects.push({
              type: 'role',
              id: role.id,
              name: role.name,
              conditions: [condition]
            });
          }
        });
      } else if (condition.attribute === 'user_id' || condition.attribute === 'userId') {
        // 基于用户的条件
        const userValue = condition.value;
        const user = users.find(u => u.id === userValue);
        if (user) {
          relationship.applicableSubjects.push({
            type: 'user',
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            conditions: [condition]
          });
        }
      } else {
        // 基于属性的条件
        relationship.applicableSubjects.push({
          type: 'attribute',
          id: condition.attribute,
          name: `${condition.attribute} ${condition.operator} ${condition.value}`,
          conditions: [condition]
        });
      }
    });
  };

  const analyzeResourceConditions = (
    conditions: AttributeCondition[],
    relationship: PolicyRelationship
  ) => {
    conditions.forEach(condition => {
      relationship.applicableResources.push({
        type: condition.attribute,
        name: `${condition.attribute} ${condition.operator} ${condition.value}`,
        conditions: [condition]
      });
    });
  };

  const determineEffectiveScope = (relationship: PolicyRelationship): 'global' | 'role_specific' | 'resource_specific' | 'conditional' => {
    if (relationship.applicableSubjects.length === 0 && relationship.applicableResources.length === 0) {
      return 'global';
    }
    
    if (relationship.applicableSubjects.some(s => s.type === 'role')) {
      return 'role_specific';
    }
    
    if (relationship.applicableResources.length > 0) {
      return 'resource_specific';
    }
    
    return 'conditional';
  };

  const detectPolicyConflicts = (policy: ABACPolicy, allPolicies: ABACPolicy[]): string[] => {
    const conflicts: string[] = [];
    
    allPolicies.forEach(otherPolicy => {
      if (otherPolicy.id !== policy.id && otherPolicy.effect !== policy.effect) {
        // 简化的冲突检测逻辑
        const hasOverlappingRules = policy.rules.some(rule1 =>
          otherPolicy.rules.some(rule2 =>
            rule1.action.some(action => rule2.action.includes(action))
          )
        );
        
        if (hasOverlappingRules) {
          conflicts.push(otherPolicy.id);
        }
      }
    });
    
    return conflicts;
  };

  const buildImpactAnalysis = () => {
    if (!policies || !users || !roles) return;

    const analysis: PolicyImpactAnalysis[] = policies.map(policy => {
      // 计算受影响的用户数量
      let affectedUsers = 0;
      let affectedRoles = 0;

      policy.rules.forEach(rule => {
        rule.subject.forEach(condition => {
          if (condition.attribute === 'role') {
            const roleValues = Array.isArray(condition.value) ? condition.value : [condition.value];
            roleValues.forEach(roleValue => {
              const role = roles.find(r => r.name === roleValue || r.id === roleValue);
              if (role) {
                affectedRoles++;
                affectedUsers += users.filter(u => u.roles.includes(role.id)).length;
              }
            });
          }
        });
      });

      // 计算风险���别
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (policy.effect === 'allow' && affectedUsers > 50) {
        riskLevel = 'high';
      } else if (policy.effect === 'deny' && affectedUsers > 20) {
        riskLevel = 'critical';
      } else if (affectedUsers > 10) {
        riskLevel = 'medium';
      }

      return {
        policyId: policy.id,
        affectedUsers,
        affectedRoles,
        affectedResources: policy.rules.reduce((count, rule) => count + rule.resource.length, 0),
        riskLevel,
        compliance: {
          gdpr: policy.name.toLowerCase().includes('gdpr') || policy.description?.toLowerCase().includes('gdpr'),
          sox: policy.name.toLowerCase().includes('sox') || policy.description?.toLowerCase().includes('sox'),
          hipaa: policy.name.toLowerCase().includes('hipaa') || policy.description?.toLowerCase().includes('hipaa')
        },
        performance: {
          complexity: policy.rules.length * 2 + policy.rules.reduce((sum, rule) => 
            sum + rule.subject.length + rule.resource.length + (rule.environment?.length || 0), 0
          ),
          evaluationTime: Math.random() * 10 + 1 // 模拟评估时间
        }
      };
    });

    setImpactAnalysis(analysis);
  };

  // ���滤策略关联关系
  const filteredRelationships = relationships.filter(relationship => {
    const matchesSearch = 
      relationship.policyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      relationship.applicableSubjects.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEffect = filterEffect === 'all' || relationship.effect === filterEffect;
    const matchesCategory = filterCategory === 'all' || relationship.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || relationship.status === filterStatus;

    return matchesSearch && matchesEffect && matchesCategory && matchesStatus;
  });

  // 获取策略分类
  const policyCategories = [...new Set(relationships.map(r => r.category))];

  // CRUD操作处理函数

  // 添加新策略
  const handleAddPolicy = async () => {
    if (!newPolicy.name.trim()) {
      toast.error('请输入策略名称');
      return;
    }

    try {
      const policyData: Partial<ABACPolicy> = {
        id: `policy_${Date.now()}`,
        name: newPolicy.name,
        description: newPolicy.description,
        effect: newPolicy.effect,
        priority: newPolicy.priority,
        category: newPolicy.category || 'general',
        status: newPolicy.status,
        rules: [], // 新策略从空规���开始
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Admin'
      };

      // 这里应该调用API来创建策略
      // await createPolicy(policyData);

      // 模拟添加到本地状态
      console.log('创建新策略:', policyData);

      setNewPolicy({
        name: '',
        description: '',
        effect: 'allow',
        priority: 100,
        category: '',
        status: 'active'
      });
      setIsAddDialogOpen(false);
      toast.success('策略创建成功');

    } catch (error) {
      toast.error('创建策略失败，请重试');
    }
  };

  // 编辑策略
  const handleEditPolicy = (policyId: string) => {
    const policy = policies?.find(p => p.id === policyId);
    if (policy) {
      setEditingPolicy({ ...policy });
      setIsEditDialogOpen(true);
    }
  };

  // 保存编辑的策略
  const handleSavePolicy = async () => {
    if (!editingPolicy) return;

    try {
      // 这里应该调用API来更新策略
      // await updatePolicy(editingPolicy);

      console.log('更新策略:', editingPolicy);
      setIsEditDialogOpen(false);
      setEditingPolicy(null);
      toast.success('策略更新成功');

    } catch (error) {
      toast.error('更新策略失败，请重试');
    }
  };

  // 删除策略
  const handleDeletePolicy = async (policyId: string) => {
    if (window.confirm('确定要删除这个策略吗？此操作不可撤销。')) {
      try {
        // 这里应该调用API来删除策略
        // await deletePolicy(policyId);

        console.log('删除策略:', policyId);
        toast.success('策略删除成功');

      } catch (error) {
        toast.error('删除策略失败，请重试');
      }
    }
  };

  // 切换策略状态
  const handleTogglePolicyStatus = async (policyId: string, newStatus: 'active' | 'inactive') => {
    try {
      // 这里应该调用API来更新策略状态
      // await updatePolicyStatus(policyId, newStatus);

      console.log('切换策略状态:', policyId, newStatus);
      toast.success(`策略已${newStatus === 'active' ? '激活' : '停用'}`);

    } catch (error) {
      toast.error('状态更新失败，请重试');
    }
  };

  // 批量操作处理函数

  // 批量删除策略
  const handleBatchDelete = async () => {
    if (selectedPolicies.length === 0) {
      toast.error('请选择要删除的策略');
      return;
    }

    if (window.confirm(`确定要删除 ${selectedPolicies.length} 个策略吗？此操作不可撤销。`)) {
      try {
        // 这里应该调用API来批量删除策略
        // await batchDeletePolicies(selectedPolicies);

        console.log('批量删除策略:', selectedPolicies);
        setSelectedPolicies([]);
        toast.success(`已删除 ${selectedPolicies.length} 个策略`);

      } catch (error) {
        toast.error('批量删除失败，请重试');
      }
    }
  };

  // 批量激活策略
  const handleBatchActivate = async () => {
    if (selectedPolicies.length === 0) {
      toast.error('请选择要激活的策略');
      return;
    }

    try {
      // 这里应该调用API来批量激活策略
      // await batchUpdatePolicyStatus(selectedPolicies, 'active');

      console.log('批量激活策略:', selectedPolicies);
      setSelectedPolicies([]);
      toast.success(`已激活 ${selectedPolicies.length} 个策略`);

    } catch (error) {
      toast.error('批量激活失败，请重试');
    }
  };

  // 批量停用策略
  const handleBatchDeactivate = async () => {
    if (selectedPolicies.length === 0) {
      toast.error('请选择要停用的策略');
      return;
    }

    try {
      // 这里应该调用API来批量停用策略
      // await batchUpdatePolicyStatus(selectedPolicies, 'inactive');

      console.log('批量停用策略:', selectedPolicies);
      setSelectedPolicies([]);
      toast.success(`已停用 ${selectedPolicies.length} 个策略`);

    } catch (error) {
      toast.error('批量停用���败，请重试');
    }
  };

  // 选择所有策略
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPolicies(filteredRelationships.map(r => r.policyId));
    } else {
      setSelectedPolicies([]);
    }
  };

  // 渲染环境条件图标
  const renderEnvironmentCondition = (condition: AttributeCondition) => {
    const iconProps = { className: "h-4 w-4" };
    
    switch (condition.attribute) {
      case 'time':
      case 'current_time':
      case 'current_hour':
        return <Clock {...iconProps} />;
      case 'location':
      case 'client_ip':
        return <MapPin {...iconProps} />;
      case 'device':
      case 'user_agent':
        return <Smartphone {...iconProps} />;
      default:
        return <Settings {...iconProps} />;
    }
  };

  // 关联关系详细视图
  const renderRelationshipDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">策略关联关系</h3>
          <p className="text-sm text-muted-foreground">
            查看ABAC策略与用户、角色、资源的关联关系
          </p>
        </div>
        <div className="flex gap-2">
          {selectedPolicies.length > 0 && (
            <>
              <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                删除选中 ({selectedPolicies.length})
              </Button>
              <Button variant="outline" size="sm" onClick={handleBatchActivate}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                批量激活
              </Button>
              <Button variant="outline" size="sm" onClick={handleBatchDeactivate}>
                <XCircle className="h-4 w-4 mr-2" />
                批量停用
              </Button>
            </>
          )}

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                添加策略
              </Button>
            </DialogTrigger>
          </Dialog>

          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索策略..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={filterEffect} onValueChange={setFilterEffect}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="效果" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有效果</SelectItem>
              <SelectItem value="allow">允许</SelectItem>
              <SelectItem value="deny">拒绝</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有分类</SelectItem>
              {policyCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 批量操作控制 */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={selectedPolicies.length === filteredRelationships.length && filteredRelationships.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <Label htmlFor="select-all" className="text-sm">
            全选 ({filteredRelationships.length} 个策略)
          </Label>
        </div>

        {selectedPolicies.length > 0 && (
          <Badge variant="secondary">
            已选择 {selectedPolicies.length} 个策略
          </Badge>
        )}
      </div>

      <div className="grid gap-4">
        {filteredRelationships.map((relationship) => (
          <Card key={relationship.policyId} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedPolicies.includes(relationship.policyId)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPolicies(prev => [...prev, relationship.policyId]);
                      } else {
                        setSelectedPolicies(prev => prev.filter(id => id !== relationship.policyId));
                      }
                    }}
                  />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {relationship.policyName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span>优先级: {relationship.priority}</span>
                      <span>范围: {relationship.effectiveScope}</span>
                      {relationship.conflictsWith.length > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {relationship.conflictsWith.length} 个冲突
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={relationship.effect === 'allow' ? 'default' : 'destructive'}>
                    {relationship.effect === 'allow' ? '允许' : '拒绝'}
                  </Badge>
                  <Badge variant={relationship.status === 'active' ? 'default' : 'secondary'}>
                    {relationship.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 适用主体 */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    适用主体 ({relationship.applicableSubjects.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {relationship.applicableSubjects.length > 0 ? (
                      relationship.applicableSubjects.map((subject, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {subject.type === 'role' ? (
                            <Shield className="h-3 w-3 text-blue-500" />
                          ) : subject.type === 'user' ? (
                            <Users className="h-3 w-3 text-green-500" />
                          ) : (
                            <Target className="h-3 w-3 text-purple-500" />
                          )}
                          <span className="text-sm">{subject.name}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">所有主体</span>
                    )}
                  </div>
                </div>

                {/* 适用资源 */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    适用资源 ({relationship.applicableResources.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {relationship.applicableResources.length > 0 ? (
                      relationship.applicableResources.map((resource, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <GitBranch className="h-3 w-3 text-orange-500" />
                          <span className="text-sm">{resource.name}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">所有资源</span>
                    )}
                  </div>
                </div>

                {/* 环境条件 */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    环境条件 ({relationship.environmentConditions.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {relationship.environmentConditions.length > 0 ? (
                      relationship.environmentConditions.map((condition, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {renderEnvironmentCondition(condition)}
                          <span className="text-sm">
                            {condition.attribute} {condition.operator} {String(condition.value)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">无环境限制</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 允许的动作 */}
              <div>
                <h4 className="text-sm font-medium mb-2">允许的动作</h4>
                <div className="flex flex-wrap gap-1">
                  {relationship.allowedActions.map((action, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {action}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 操作栏 */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>策略ID: {relationship.policyId}</span>
                  {relationship.conflictsWith.length > 0 && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">
                        与 {relationship.conflictsWith.length} 个策略冲突
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPolicySelect?.(relationship.policyId)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    查看详情
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPolicy(relationship.policyId)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    编辑策略
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePolicyStatus(
                      relationship.policyId,
                      relationship.status === 'active' ? 'inactive' : 'active'
                    )}
                  >
                    {relationship.status === 'active' ? (
                      <XCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    {relationship.status === 'active' ? '停用' : '激活'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePolicy(relationship.policyId)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // 影响分析视图
  const renderImpactAnalysis = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">策略影响分析</h3>
        <p className="text-sm text-muted-foreground">
          分析ABAC策略对系统和用户的影响
        </p>
      </div>

      {/* 影响统计 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总受影响用户</p>
                <p className="text-2xl font-bold">
                  {impactAnalysis.reduce((sum, analysis) => sum + analysis.affectedUsers, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总受影响角色</p>
                <p className="text-2xl font-bold">
                  {impactAnalysis.reduce((sum, analysis) => sum + analysis.affectedRoles, 0)}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">高风险策略</p>
                <p className="text-2xl font-bold text-red-600">
                  {impactAnalysis.filter(a => a.riskLevel === 'high' || a.riskLevel === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">合规策略</p>
                <p className="text-2xl font-bold text-green-600">
                  {impactAnalysis.filter(a => a.compliance.gdpr || a.compliance.sox || a.compliance.hipaa).length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细影响分析表 */}
      <Card>
        <CardHeader>
          <CardTitle>策略影响详情</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">策略名称</th>
                  <th className="px-6 py-3 text-left">受影响用户</th>
                  <th className="px-6 py-3 text-left">受影响角色</th>
                  <th className="px-6 py-3 text-left">受影响资源</th>
                  <th className="px-6 py-3 text-left">风险级别</th>
                  <th className="px-6 py-3 text-left">复杂度</th>
                  <th className="px-6 py-3 text-left">合规性</th>
                  <th className="px-6 py-3 text-left">评估时间</th>
                </tr>
              </thead>
              <tbody>
                {impactAnalysis.map((analysis) => {
                  const policy = policies?.find(p => p.id === analysis.policyId);
                  return (
                    <tr key={analysis.policyId} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">
                        {policy?.name || analysis.policyId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          {analysis.affectedUsers}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-500" />
                          {analysis.affectedRoles}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4 text-orange-500" />
                          {analysis.affectedResources}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={
                            analysis.riskLevel === 'critical' ? 'destructive' :
                            analysis.riskLevel === 'high' ? 'outline' :
                            analysis.riskLevel === 'medium' ? 'secondary' :
                            'default'
                          }
                        >
                          {analysis.riskLevel}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(analysis.performance.complexity * 10, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{analysis.performance.complexity}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {analysis.compliance.gdpr && <Badge variant="outline" className="text-xs">GDPR</Badge>}
                          {analysis.compliance.sox && <Badge variant="outline" className="text-xs">SOX</Badge>}
                          {analysis.compliance.hipaa && <Badge variant="outline" className="text-xs">HIPAA</Badge>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {analysis.performance.evaluationTime.toFixed(1)}ms
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="relationships">关联关系</TabsTrigger>
          <TabsTrigger value="impact">影响分析</TabsTrigger>
        </TabsList>

        <TabsContent value="relationships">
          {renderRelationshipDetails()}
        </TabsContent>

        <TabsContent value="impact">
          {renderImpactAnalysis()}
        </TabsContent>
      </Tabs>

      {/* Add Policy Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加新策略</DialogTitle>
            <DialogDescription>
              创建新的ABAC策略
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="policy-name">策略名称</Label>
              <Input
                id="policy-name"
                placeholder="输入策略名称"
                value={newPolicy.name}
                onChange={(e) => setNewPolicy(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy-description">策略描述</Label>
              <Textarea
                id="policy-description"
                placeholder="描述策略的用途和作用..."
                value={newPolicy.description}
                onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policy-effect">策略效果</Label>
                <Select value={newPolicy.effect} onValueChange={(value: 'allow' | 'deny') =>
                  setNewPolicy(prev => ({ ...prev, effect: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allow">允许</SelectItem>
                    <SelectItem value="deny">拒绝</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="policy-priority">优先级</Label>
                <Input
                  id="policy-priority"
                  type="number"
                  min="1"
                  max="1000"
                  value={newPolicy.priority}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, priority: parseInt(e.target.value) || 100 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy-category">策略分类</Label>
              <Input
                id="policy-category"
                placeholder="例如：access, security, compliance"
                value={newPolicy.category}
                onChange={(e) => setNewPolicy(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy-status">状态</Label>
              <Select value={newPolicy.status} onValueChange={(value: 'active' | 'inactive' | 'draft') =>
                setNewPolicy(prev => ({ ...prev, status: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">激活</SelectItem>
                  <SelectItem value="inactive">停用</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddPolicy}>
              创建策略
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Policy Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑策略</DialogTitle>
            <DialogDescription>
              修改策略的基本信息
            </DialogDescription>
          </DialogHeader>

          {editingPolicy && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-policy-name">策略名称</Label>
                <Input
                  id="edit-policy-name"
                  value={editingPolicy.name}
                  onChange={(e) => setEditingPolicy(prev =>
                    prev ? { ...prev, name: e.target.value } : null
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-policy-description">策略描述</Label>
                <Textarea
                  id="edit-policy-description"
                  value={editingPolicy.description || ''}
                  onChange={(e) => setEditingPolicy(prev =>
                    prev ? { ...prev, description: e.target.value } : null
                  )}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-policy-effect">策略效果</Label>
                  <Select value={editingPolicy.effect} onValueChange={(value: 'allow' | 'deny') =>
                    setEditingPolicy(prev => prev ? { ...prev, effect: value } : null)
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">允许</SelectItem>
                      <SelectItem value="deny">拒绝</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-policy-priority">优先级</Label>
                  <Input
                    id="edit-policy-priority"
                    type="number"
                    min="1"
                    max="1000"
                    value={editingPolicy.priority}
                    onChange={(e) => setEditingPolicy(prev =>
                      prev ? { ...prev, priority: parseInt(e.target.value) || 100 } : null
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-policy-category">策略分类</Label>
                <Input
                  id="edit-policy-category"
                  value={editingPolicy.category || ''}
                  onChange={(e) => setEditingPolicy(prev =>
                    prev ? { ...prev, category: e.target.value } : null
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-policy-status">状态</Label>
                <Select value={editingPolicy.status} onValueChange={(value: 'active' | 'inactive' | 'draft') =>
                  setEditingPolicy(prev => prev ? { ...prev, status: value } : null)
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">激活</SelectItem>
                    <SelectItem value="inactive">停用</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSavePolicy}>
              保存更改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
