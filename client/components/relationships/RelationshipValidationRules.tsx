import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Shield,
  Users,
  Key,
  FileText,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  Zap,
  Settings,
  Plus,
  Edit,
  Trash2,
  Clock,
  Target,
  Workflow,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  Crown,
  Gavel,
  Filter,
} from "lucide-react";
import { User, Role, Permission, ABACPolicy } from "@shared/iam";
import { cn } from "@/lib/utils";

interface RelationshipValidationRulesProps {
  users: User[];
  roles: Role[];
  permissions: Permission[];
  policies: ABACPolicy[];
  onApplyRule: (ruleId: string, targetType: string, targetIds: string[]) => Promise<void>;
  onUpdateRule: (rule: ValidationRule) => Promise<void>;
  onDeleteRule: (ruleId: string) => Promise<void>;
  isLoading?: boolean;
}

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  type: 'user_role' | 'role_permission' | 'policy_scope' | 'separation_of_duties' | 'least_privilege' | 'temporal' | 'compliance';
  category: 'security' | 'compliance' | 'business' | 'performance';
  priority: number;
  isActive: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  violations: ValidationViolation[];
  lastExecuted?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

interface RuleCondition {
  id: string;
  type: 'attribute_check' | 'count_limit' | 'time_constraint' | 'relationship_check' | 'risk_assessment';
  attribute?: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in';
  value: any;
  description: string;
}

interface RuleAction {
  id: string;
  type: 'deny_assignment' | 'require_approval' | 'add_restriction' | 'send_alert' | 'auto_remove' | 'flag_for_review';
  parameters: Record<string, any>;
  description: string;
}

interface ValidationViolation {
  id: string;
  ruleId: string;
  violationType: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  involvedEntities: {
    users?: string[];
    roles?: string[];
    permissions?: string[];
    policies?: string[];
  };
  detectedAt: Date;
  status: 'active' | 'resolved' | 'acknowledged' | 'ignored';
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

interface ValidationMetrics {
  totalRules: number;
  activeRules: number;
  totalViolations: number;
  criticalViolations: number;
  resolutionRate: number;
  complianceScore: number;
  lastScanTime: Date;
}

interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  ruleType: string;
  template: Partial<ValidationRule>;
}

export const RelationshipValidationRules: React.FC<RelationshipValidationRulesProps> = ({
  users,
  roles,
  permissions,
  policies,
  onApplyRule,
  onUpdateRule,
  onDeleteRule,
  isLoading = false,
}) => {
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [ruleTemplates, setRuleTemplates] = useState<RuleTemplate[]>([]);
  const [violations, setViolations] = useState<ValidationViolation[]>([]);
  const [metrics, setMetrics] = useState<ValidationMetrics | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ValidationRule | null>(null);
  const [isCreateRuleDialogOpen, setIsCreateRuleDialogOpen] = useState(false);
  const [isEditRuleDialogOpen, setIsEditRuleDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterViolationStatus, setFilterViolationStatus] = useState<string>('all');

  useEffect(() => {
    initializeDefaultRules();
    loadRuleTemplates();
    executeValidationScan();
  }, [users, roles, permissions, policies]);

  const initializeDefaultRules = () => {
    const defaultRules: ValidationRule[] = [
      {
        id: 'sod_admin_user',
        name: '职责分离：管理员-普通用户',
        description: '确保同一用户不能同时拥有管理员和普通用户角色',
        type: 'separation_of_duties',
        category: 'security',
        priority: 100,
        isActive: true,
        conditions: [
          {
            id: 'cond_1',
            type: 'relationship_check',
            attribute: 'user.roles',
            operator: 'contains',
            value: ['admin', 'user'],
            description: '检查用户是否同时拥有admin和user角色'
          }
        ],
        actions: [
          {
            id: 'act_1',
            type: 'deny_assignment',
            parameters: { requireManagerApproval: true },
            description: '拒绝分配并要求经理批准'
          },
          {
            id: 'act_2',
            type: 'send_alert',
            parameters: { alertType: 'security', severity: 'high' },
            description: '发送安全警报'
          }
        ],
        violations: [],
        createdAt: new Date()
      },
      {
        id: 'least_priv_contractor',
        name: '最小权限：外部承包商',
        description: '外部承包商只能获得最小必要权限',
        type: 'least_privilege',
        category: 'security',
        priority: 90,
        isActive: true,
        conditions: [
          {
            id: 'cond_2',
            type: 'attribute_check',
            attribute: 'user.employmentType',
            operator: 'equals',
            value: 'contractor',
            description: '检查用户是否为外部承包商'
          },
          {
            id: 'cond_3',
            type: 'count_limit',
            attribute: 'user.highRiskPermissions',
            operator: 'greater_than',
            value: 2,
            description: '检查高风险权限数量是否超过限制'
          }
        ],
        actions: [
          {
            id: 'act_3',
            type: 'require_approval',
            parameters: { approvers: ['security_officer', 'manager'], level: 'high' },
            description: '需要安全官和经理双重批准'
          }
        ],
        violations: [],
        createdAt: new Date()
      },
      {
        id: 'temporal_guest_access',
        name: '时间限制：访客权限',
        description: '访客权限必须有明确的过期时间',
        type: 'temporal',
        category: 'security',
        priority: 80,
        isActive: true,
        conditions: [
          {
            id: 'cond_4',
            type: 'attribute_check',
            attribute: 'role.name',
            operator: 'contains',
            value: 'guest',
            description: '检查是否为访客角色'
          },
          {
            id: 'cond_5',
            type: 'time_constraint',
            attribute: 'role.validUntil',
            operator: 'equals',
            value: null,
            description: '检查是否设置了过期时间'
          }
        ],
        actions: [
          {
            id: 'act_4',
            type: 'add_restriction',
            parameters: { maxDuration: 30, unit: 'days' },
            description: '自动添加30天过期限制'
          }
        ],
        violations: [],
        createdAt: new Date()
      },
      {
        id: 'compliance_financial_access',
        name: '合规性：财务数据访问',
        description: '财务数据访问必须符合审计要求',
        type: 'compliance',
        category: 'compliance',
        priority: 95,
        isActive: true,
        conditions: [
          {
            id: 'cond_6',
            type: 'attribute_check',
            attribute: 'permission.category',
            operator: 'equals',
            value: 'financial',
            description: '检查是否为财务类权限'
          },
          {
            id: 'cond_7',
            type: 'attribute_check',
            attribute: 'user.complianceTraining',
            operator: 'not_equals',
            value: 'completed',
            description: '检查用户是否完成合规培训'
          }
        ],
        actions: [
          {
            id: 'act_5',
            type: 'deny_assignment',
            parameters: { reason: 'compliance_training_required' },
            description: '拒绝分配直到完成合规培训'
          }
        ],
        violations: [],
        createdAt: new Date()
      },
      {
        id: 'risk_assessment_high_priv',
        name: '风险评估：高权限分配',
        description: '高风险权限分配需要风险评估',
        type: 'role_permission',
        category: 'security',
        priority: 85,
        isActive: true,
        conditions: [
          {
            id: 'cond_8',
            type: 'risk_assessment',
            attribute: 'permission.risk',
            operator: 'equals',
            value: 'critical',
            description: '检查是否为高风险权限'
          },
          {
            id: 'cond_9',
            type: 'count_limit',
            attribute: 'role.criticalPermissions',
            operator: 'greater_than',
            value: 5,
            description: '检查角色中高风险权限数量'
          }
        ],
        actions: [
          {
            id: 'act_6',
            type: 'flag_for_review',
            parameters: { reviewType: 'security', reviewBy: 'security_team' },
            description: '标记为需要安全团队审查'
          }
        ],
        violations: [],
        createdAt: new Date()
      }
    ];

    setValidationRules(defaultRules);
  };

  const loadRuleTemplates = () => {
    const templates: RuleTemplate[] = [
      {
        id: 'template_sod',
        name: '职责分离模板',
        description: '用于创建职责分离规则的模板',
        category: 'security',
        ruleType: 'separation_of_duties',
        template: {
          type: 'separation_of_duties',
          category: 'security',
          priority: 80,
          isActive: true
        }
      },
      {
        id: 'template_least_priv',
        name: '最小权限模板',
        description: '用于创建最小权限规则的模板',
        category: 'security',
        ruleType: 'least_privilege',
        template: {
          type: 'least_privilege',
          category: 'security',
          priority: 70,
          isActive: true
        }
      },
      {
        id: 'template_temporal',
        name: '时间限制模板',
        description: '用于创建时间相关规则的模板',
        category: 'security',
        ruleType: 'temporal',
        template: {
          type: 'temporal',
          category: 'security',
          priority: 60,
          isActive: true
        }
      },
      {
        id: 'template_compliance',
        name: '合规性模板',
        description: '用于创建合规性规则的模板',
        category: 'compliance',
        ruleType: 'compliance',
        template: {
          type: 'compliance',
          category: 'compliance',
          priority: 90,
          isActive: true
        }
      }
    ];

    setRuleTemplates(templates);
  };

  const executeValidationScan = async () => {
    setIsScanning(true);
    try {
      const allViolations: ValidationViolation[] = [];

      // 为每个活跃规则执行验证
      for (const rule of validationRules.filter(r => r.isActive)) {
        const ruleViolations = await executeRule(rule);
        allViolations.push(...ruleViolations);
        
        // 更新规则的最后执行时间
        rule.lastExecuted = new Date();
      }

      setViolations(allViolations);
      
      // 计算指标
      const calculatedMetrics = calculateValidationMetrics(validationRules, allViolations);
      setMetrics(calculatedMetrics);

    } catch (error) {
      console.error('Validation scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const executeRule = async (rule: ValidationRule): Promise<ValidationViolation[]> => {
    const violations: ValidationViolation[] = [];

    switch (rule.type) {
      case 'separation_of_duties':
        violations.push(...await checkSeparationOfDuties(rule));
        break;
      case 'least_privilege':
        violations.push(...await checkLeastPrivilege(rule));
        break;
      case 'temporal':
        violations.push(...await checkTemporalConstraints(rule));
        break;
      case 'compliance':
        violations.push(...await checkComplianceRequirements(rule));
        break;
      case 'user_role':
        violations.push(...await checkUserRoleAssignments(rule));
        break;
      case 'role_permission':
        violations.push(...await checkRolePermissionAssignments(rule));
        break;
      case 'policy_scope':
        violations.push(...await checkPolicyScope(rule));
        break;
    }

    return violations;
  };

  const checkSeparationOfDuties = async (rule: ValidationRule): Promise<ValidationViolation[]> => {
    const violations: ValidationViolation[] = [];

    // 检查职责分离违规
    users.forEach(user => {
      const userRoles = roles.filter(role => user.roles.includes(role.id));
      
      // 检查是否同时拥有冲突的角色
      const hasAdminRole = userRoles.some(role => role.name.toLowerCase().includes('admin'));
      const hasUserRole = userRoles.some(role => role.name.toLowerCase().includes('user') && !role.name.toLowerCase().includes('admin'));

      if (hasAdminRole && hasUserRole) {
        violations.push({
          id: `sod_violation_${user.id}_${Date.now()}`,
          ruleId: rule.id,
          violationType: 'high',
          description: `用户 "${user.firstName} ${user.lastName}" 同时拥有管理员和普通用户角色，违反职责分离原则`,
          involvedEntities: {
            users: [user.id],
            roles: userRoles.map(r => r.id)
          },
          detectedAt: new Date(),
          status: 'active'
        });
      }

      // 检查其他冲突的角色组合
      const conflictingRolePairs = [
        ['finance', 'audit'],
        ['developer', 'tester'],
        ['approver', 'requester']
      ];

      conflictingRolePairs.forEach(([role1, role2]) => {
        const hasRole1 = userRoles.some(role => role.name.toLowerCase().includes(role1));
        const hasRole2 = userRoles.some(role => role.name.toLowerCase().includes(role2));

        if (hasRole1 && hasRole2) {
          violations.push({
            id: `sod_violation_${user.id}_${role1}_${role2}_${Date.now()}`,
            ruleId: rule.id,
            violationType: 'medium',
            description: `用户 "${user.firstName} ${user.lastName}" 同时拥有冲突的 ${role1} 和 ${role2} 角色`,
            involvedEntities: {
              users: [user.id],
              roles: userRoles.filter(r => 
                r.name.toLowerCase().includes(role1) || 
                r.name.toLowerCase().includes(role2)
              ).map(r => r.id)
            },
            detectedAt: new Date(),
            status: 'active'
          });
        }
      });
    });

    return violations;
  };

  const checkLeastPrivilege = async (rule: ValidationRule): Promise<ValidationViolation[]> => {
    const violations: ValidationViolation[] = [];

    // 检查最小权限原则违规
    users.forEach(user => {
      // 检查外部承包商权限
      if (user.attributes?.employmentType === 'contractor') {
        const userRoles = roles.filter(role => user.roles.includes(role.id));
        const allPermissions = userRoles.flatMap(role => role.permissions);
        const highRiskPermissions = allPermissions.filter(permId => {
          const permission = permissions.find(p => p.id === permId);
          return permission && permission.risk === 'critical';
        });

        if (highRiskPermissions.length > 2) {
          violations.push({
            id: `least_priv_violation_${user.id}_${Date.now()}`,
            ruleId: rule.id,
            violationType: 'high',
            description: `外部承包商 "${user.firstName} ${user.lastName}" 拥有过多高风险权限 (${highRiskPermissions.length}个)`,
            involvedEntities: {
              users: [user.id],
              permissions: highRiskPermissions
            },
            detectedAt: new Date(),
            status: 'active'
          });
        }
      }

      // 检查未使用的权限
      const userRoles = roles.filter(role => user.roles.includes(role.id));
      const lastLoginDate = user.lastLogin ? new Date(user.lastLogin) : null;
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      if (lastLoginDate && lastLoginDate < thirtyDaysAgo && userRoles.length > 0) {
        violations.push({
          id: `unused_access_violation_${user.id}_${Date.now()}`,
          ruleId: rule.id,
          violationType: 'medium',
          description: `用户 "${user.firstName} ${user.lastName}" 超过30天未登录但仍拥有活跃权限`,
          involvedEntities: {
            users: [user.id],
            roles: userRoles.map(r => r.id)
          },
          detectedAt: new Date(),
          status: 'active'
        });
      }
    });

    return violations;
  };

  const checkTemporalConstraints = async (rule: ValidationRule): Promise<ValidationViolation[]> => {
    const violations: ValidationViolation[] = [];

    // 检查时间约束违规
    roles.forEach(role => {
      // 检查访客角色是否有过期时间
      if (role.name.toLowerCase().includes('guest') && !role.validUntil) {
        violations.push({
          id: `temporal_violation_${role.id}_${Date.now()}`,
          ruleId: rule.id,
          violationType: 'medium',
          description: `访客角色 "${role.name}" 缺少过期时间设置`,
          involvedEntities: {
            roles: [role.id]
          },
          detectedAt: new Date(),
          status: 'active'
        });
      }

      // 检查已过期的角色
      if (role.validUntil && new Date(role.validUntil) < new Date()) {
        const usersWithExpiredRole = users.filter(user => user.roles.includes(role.id));
        
        if (usersWithExpiredRole.length > 0) {
          violations.push({
            id: `expired_role_violation_${role.id}_${Date.now()}`,
            ruleId: rule.id,
            violationType: 'high',
            description: `角色 "${role.name}" 已过期但仍有 ${usersWithExpiredRole.length} 个用户拥有此角色`,
            involvedEntities: {
              roles: [role.id],
              users: usersWithExpiredRole.map(u => u.id)
            },
            detectedAt: new Date(),
            status: 'active'
          });
        }
      }
    });

    // 检查策略的时间约束
    policies.forEach(policy => {
      if (policy.status === 'active') {
        policy.rules.forEach((policyRule, ruleIndex) => {
          const timeConstraints = policyRule.timeConstraints || [];
          
          timeConstraints.forEach((constraint, constraintIndex) => {
            if (constraint.type === 'expiration' && constraint.expirationDate) {
              const expirationDate = new Date(constraint.expirationDate);
              const now = new Date();
              
              if (expirationDate < now) {
                violations.push({
                  id: `policy_expired_violation_${policy.id}_${ruleIndex}_${constraintIndex}_${Date.now()}`,
                  ruleId: rule.id,
                  violationType: 'medium',
                  description: `策略 "${policy.name}" 的规则 ${ruleIndex + 1} 已过期但仍处于活跃状态`,
                  involvedEntities: {
                    policies: [policy.id]
                  },
                  detectedAt: new Date(),
                  status: 'active'
                });
              }
            }
          });
        });
      }
    });

    return violations;
  };

  const checkComplianceRequirements = async (rule: ValidationRule): Promise<ValidationViolation[]> => {
    const violations: ValidationViolation[] = [];

    // 检查合规性要求违规
    users.forEach(user => {
      const userRoles = roles.filter(role => user.roles.includes(role.id));
      const financialPermissions = userRoles.flatMap(role => 
        role.permissions.filter(permId => {
          const permission = permissions.find(p => p.id === permId);
          return permission && (
            permission.category === 'financial' || 
            permission.name.toLowerCase().includes('financial') ||
            permission.resource.includes('financial')
          );
        })
      );

      if (financialPermissions.length > 0) {
        // 检查是否完成合规培训
        const hasComplianceTraining = user.attributes?.complianceTraining === 'completed';
        
        if (!hasComplianceTraining) {
          violations.push({
            id: `compliance_training_violation_${user.id}_${Date.now()}`,
            ruleId: rule.id,
            violationType: 'high',
            description: `用户 "${user.firstName} ${user.lastName}" 拥有财务权限但未完成合规培训`,
            involvedEntities: {
              users: [user.id],
              permissions: financialPermissions
            },
            detectedAt: new Date(),
            status: 'active'
          });
        }

        // 检查是否有MFA
        const hasMFA = user.attributes?.mfaEnabled === true;
        
        if (!hasMFA) {
          violations.push({
            id: `mfa_required_violation_${user.id}_${Date.now()}`,
            ruleId: rule.id,
            violationType: 'medium',
            description: `用户 "${user.firstName} ${user.lastName}" 拥有敏感权限但未启用多因素认证`,
            involvedEntities: {
              users: [user.id],
              permissions: financialPermissions
            },
            detectedAt: new Date(),
            status: 'active'
          });
        }
      }
    });

    return violations;
  };

  const checkUserRoleAssignments = async (rule: ValidationRule): Promise<ValidationViolation[]> => {
    const violations: ValidationViolation[] = [];

    // 检查用户角色分配的合理性
    users.forEach(user => {
      // 检查是否有过多角色
      if (user.roles.length > 5) {
        violations.push({
          id: `too_many_roles_violation_${user.id}_${Date.now()}`,
          ruleId: rule.id,
          violationType: 'medium',
          description: `用户 "${user.firstName} ${user.lastName}" 拥有过多角色 (${user.roles.length}个)`,
          involvedEntities: {
            users: [user.id],
            roles: user.roles
          },
          detectedAt: new Date(),
          status: 'active'
        });
      }

      // 检查部门与角色的匹配性
      const userDepartment = user.attributes?.department;
      if (userDepartment) {
        const inappropriateRoles = user.roles.filter(roleId => {
          const role = roles.find(r => r.id === roleId);
          if (!role) return false;
          
          // 检查角色是否与用户部门不匹配
          const roleDepartment = role.organizationUnit;
          return roleDepartment && roleDepartment !== userDepartment && 
                 !role.name.toLowerCase().includes('global') &&
                 !role.name.toLowerCase().includes('company-wide');
        });

        if (inappropriateRoles.length > 0) {
          violations.push({
            id: `dept_role_mismatch_violation_${user.id}_${Date.now()}`,
            ruleId: rule.id,
            violationType: 'low',
            description: `用户 "${user.firstName} ${user.lastName}" (${userDepartment}部门) 拥有其他部门的角色`,
            involvedEntities: {
              users: [user.id],
              roles: inappropriateRoles
            },
            detectedAt: new Date(),
            status: 'active'
          });
        }
      }
    });

    return violations;
  };

  const checkRolePermissionAssignments = async (rule: ValidationRule): Promise<ValidationViolation[]> => {
    const violations: ValidationViolation[] = [];

    // 检查角色权限分配的合理性
    roles.forEach(role => {
      // 检查是否有冲突的权限
      const rolePermissions = permissions.filter(perm => role.permissions.includes(perm.id));
      
      for (let i = 0; i < rolePermissions.length; i++) {
        for (let j = i + 1; j < rolePermissions.length; j++) {
          const perm1 = rolePermissions[i];
          const perm2 = rolePermissions[j];
          
          // 检查读写冲突
          if (perm1.resource === perm2.resource) {
            const isConflicting = (
              (perm1.action === 'read_only' && perm2.action.includes('write')) ||
              (perm1.action.includes('write') && perm2.action === 'read_only') ||
              (perm1.action === 'delete' && perm2.action === 'create')
            );
            
            if (isConflicting) {
              violations.push({
                id: `permission_conflict_violation_${role.id}_${perm1.id}_${perm2.id}_${Date.now()}`,
                ruleId: rule.id,
                violationType: 'medium',
                description: `角色 "${role.name}" 拥有冲突的权限：${perm1.name} 与 ${perm2.name}`,
                involvedEntities: {
                  roles: [role.id],
                  permissions: [perm1.id, perm2.id]
                },
                detectedAt: new Date(),
                status: 'active'
              });
            }
          }
        }
      }

      // 检查是否有过多的高风险权限
      const criticalPermissions = rolePermissions.filter(perm => perm.risk === 'critical');
      if (criticalPermissions.length > 3 && !role.name.toLowerCase().includes('admin')) {
        violations.push({
          id: `too_many_critical_perms_violation_${role.id}_${Date.now()}`,
          ruleId: rule.id,
          violationType: 'high',
          description: `非管理员角色 "${role.name}" 拥有过多高风险权限 (${criticalPermissions.length}个)`,
          involvedEntities: {
            roles: [role.id],
            permissions: criticalPermissions.map(p => p.id)
          },
          detectedAt: new Date(),
          status: 'active'
        });
      }
    });

    return violations;
  };

  const checkPolicyScope = async (rule: ValidationRule): Promise<ValidationViolation[]> => {
    const violations: ValidationViolation[] = [];

    // 检查策略作用域的合理性
    policies.forEach(policy => {
      if (policy.status !== 'active') return;

      // 检查策略的适用角色是否存在
      if (policy.applicableRoles) {
        const missingRoles = policy.applicableRoles.filter(roleId => 
          !roles.find(r => r.id === roleId)
        );

        if (missingRoles.length > 0) {
          violations.push({
            id: `policy_missing_roles_violation_${policy.id}_${Date.now()}`,
            ruleId: rule.id,
            violationType: 'medium',
            description: `策略 "${policy.name}" 引用了不存在的角色`,
            involvedEntities: {
              policies: [policy.id]
            },
            detectedAt: new Date(),
            status: 'active'
          });
        }
      }

      // 检查策略的资源是否合理
      policy.rules.forEach((policyRule, ruleIndex) => {
        const resourceConditions = policyRule.resource;
        
        resourceConditions.forEach((resourceCond, condIndex) => {
          // 检查是否引用了不存在的资源
          if (resourceCond.attribute === 'type' && typeof resourceCond.value === 'string') {
            const referencedResource = resourceCond.value;
            const resourceExists = permissions.some(perm => 
              perm.resource === referencedResource || 
              perm.resource.includes(referencedResource)
            );

            if (!resourceExists) {
              violations.push({
                id: `policy_invalid_resource_violation_${policy.id}_${ruleIndex}_${condIndex}_${Date.now()}`,
                ruleId: rule.id,
                violationType: 'low',
                description: `策略 "${policy.name}" 引用了未定义的资源类型: ${referencedResource}`,
                involvedEntities: {
                  policies: [policy.id]
                },
                detectedAt: new Date(),
                status: 'active'
              });
            }
          }
        });
      });
    });

    return violations;
  };

  const calculateValidationMetrics = (rules: ValidationRule[], violations: ValidationViolation[]): ValidationMetrics => {
    const activeRules = rules.filter(r => r.isActive).length;
    const criticalViolations = violations.filter(v => v.violationType === 'critical').length;
    const resolvedViolations = violations.filter(v => v.status === 'resolved').length;
    const resolutionRate = violations.length > 0 ? (resolvedViolations / violations.length) * 100 : 100;
    
    // 简化的合规评分计算
    const totalEntities = users.length + roles.length + permissions.length + policies.length;
    const violationImpact = violations.reduce((sum, v) => {
      const weight = v.violationType === 'critical' ? 4 : 
                    v.violationType === 'high' ? 3 : 
                    v.violationType === 'medium' ? 2 : 1;
      return sum + weight;
    }, 0);
    
    const complianceScore = Math.max(0, 100 - (violationImpact / Math.max(totalEntities, 1)) * 100);

    return {
      totalRules: rules.length,
      activeRules,
      totalViolations: violations.length,
      criticalViolations,
      resolutionRate,
      complianceScore: Math.round(complianceScore),
      lastScanTime: new Date()
    };
  };

  const handleCreateRule = async (ruleData: Partial<ValidationRule>) => {
    const newRule: ValidationRule = {
      id: `rule_${Date.now()}`,
      name: ruleData.name || '新��证规则',
      description: ruleData.description || '',
      type: ruleData.type || 'user_role',
      category: ruleData.category || 'security',
      priority: ruleData.priority || 50,
      isActive: ruleData.isActive ?? true,
      conditions: ruleData.conditions || [],
      actions: ruleData.actions || [],
      violations: [],
      createdAt: new Date()
    };

    setValidationRules(prev => [...prev, newRule]);
    setIsCreateRuleDialogOpen(false);
    
    // 重新执行验证扫描
    await executeValidationScan();
  };

  const handleUpdateRule = async (updatedRule: ValidationRule) => {
    setValidationRules(prev => 
      prev.map(rule => rule.id === updatedRule.id ? updatedRule : rule)
    );
    setIsEditRuleDialogOpen(false);
    setSelectedRule(null);
    
    await onUpdateRule(updatedRule);
    await executeValidationScan();
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (confirm('确定要删除这个验证规则吗？')) {
      setValidationRules(prev => prev.filter(rule => rule.id !== ruleId));
      await onDeleteRule(ruleId);
      await executeValidationScan();
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    setValidationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive, updatedAt: new Date() }
          : rule
      )
    );
    
    await executeValidationScan();
  };

  const handleResolveViolation = async (violationId: string, resolution: string) => {
    setViolations(prev => 
      prev.map(violation => 
        violation.id === violationId 
          ? { 
              ...violation, 
              status: 'resolved',
              resolution,
              resolvedAt: new Date(),
              resolvedBy: 'current_user' // 在实际应用中应该是当前用户ID
            }
          : violation
      )
    );

    // 重新计算指标
    const updatedMetrics = calculateValidationMetrics(validationRules, violations);
    setMetrics(updatedMetrics);
  };

  const filteredRules = validationRules.filter(rule => {
    const matchesCategory = filterCategory === 'all' || rule.category === filterCategory;
    const matchesType = filterType === 'all' || rule.type === filterType;
    return matchesCategory && matchesType;
  });

  const filteredViolations = violations.filter(violation => {
    const matchesStatus = filterViolationStatus === 'all' || violation.status === filterViolationStatus;
    return matchesStatus;
  });

  const getViolationSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case 'separation_of_duties':
        return <Gavel className="h-4 w-4" />;
      case 'least_privilege':
        return <Lock className="h-4 w-4" />;
      case 'temporal':
        return <Clock className="h-4 w-4" />;
      case 'compliance':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'user_role':
        return <Users className="h-4 w-4" />;
      case 'role_permission':
        return <Key className="h-4 w-4" />;
      case 'policy_scope':
        return <Target className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              关系分配验证规则
            </CardTitle>
            <CardDescription>
              定义和管理用户-角色-权限-策略关系的验证规则
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={executeValidationScan}
              disabled={isLoading || isScanning}
            >
              <RefreshCw className={cn("h-4 w-4 mr-1", (isLoading || isScanning) && "animate-spin")} />
              {isScanning ? '扫描中' : '执行验证'}
            </Button>
            <Button 
              onClick={() => setIsCreateRuleDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              创建规则
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="rules">
              验证规则
              <Badge className="ml-1">{validationRules.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="violations">
              违规检测
              {violations.filter(v => v.status === 'active').length > 0 && (
                <Badge className="ml-1 bg-red-100 text-red-800">
                  {violations.filter(v => v.status === 'active').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="templates">规则模板</TabsTrigger>
            <TabsTrigger value="settings">设置</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* 指标卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">活跃规则</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {metrics?.activeRules || 0}
                        </p>
                      </div>
                      <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">检测违规</p>
                        <p className="text-2xl font-bold text-red-600">
                          {metrics?.totalViolations || 0}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">合规评分</p>
                        <p className="text-2xl font-bold text-green-600">
                          {metrics?.complianceScore || 0}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">解决率</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {metrics?.resolutionRate.toFixed(1) || 0}%
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 最近扫描信息 */}
              {metrics && (
                <Card>
                  <CardHeader>
                    <CardTitle>验证状态</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">最后扫描时间</span>
                        <span className="text-sm text-gray-500">
                          {metrics.lastScanTime.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>合规评分</span>
                          <span>{metrics.complianceScore}/100</span>
                        </div>
                        <Progress value={metrics.complianceScore} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>违规解决率</span>
                          <span>{metrics.resolutionRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={metrics.resolutionRate} className="h-2" />
                      </div>

                      {metrics.criticalViolations > 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            存在 {metrics.criticalViolations} 个严重违规，需要立即处理
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rules">
            <div className="space-y-4">
              {/* 过滤器 */}
              <div className="flex gap-4">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有分类</SelectItem>
                    <SelectItem value="security">安全</SelectItem>
                    <SelectItem value="compliance">合规</SelectItem>
                    <SelectItem value="business">业务</SelectItem>
                    <SelectItem value="performance">性能</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类型</SelectItem>
                    <SelectItem value="separation_of_duties">职责分离</SelectItem>
                    <SelectItem value="least_privilege">最小权限</SelectItem>
                    <SelectItem value="temporal">时间限制</SelectItem>
                    <SelectItem value="compliance">合规性</SelectItem>
                    <SelectItem value="user_role">用户角色</SelectItem>
                    <SelectItem value="role_permission">角色权限</SelectItem>
                    <SelectItem value="policy_scope">策略范围</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 规则列表 */}
              <div className="space-y-3">
                {filteredRules.map((rule) => (
                  <Card key={rule.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getRuleTypeIcon(rule.type)}
                            <span className="font-medium">{rule.name}</span>
                            <Badge variant="outline">{rule.category}</Badge>
                            <Badge variant="secondary">优先级: {rule.priority}</Badge>
                            {rule.violations.length > 0 && (
                              <Badge className="bg-red-100 text-red-800">
                                {rule.violations.length} 违规
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {rule.description}
                          </p>
                          
                          <div className="text-xs text-gray-500">
                            条件: {rule.conditions.length} | 
                            动作: {rule.actions.length} |
                            {rule.lastExecuted && (
                              <span> 最后执行: {rule.lastExecuted.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                          />
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRule(rule);
                              setIsEditRuleDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredRules.length === 0 && (
                  <div className="text-center py-12">
                    <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      没有找到验证规则
                    </h3>
                    <p className="text-gray-500 mb-4">
                      创建验证规则来确保系统安全性和合规性
                    </p>
                    <Button onClick={() => setIsCreateRuleDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      创建第一个规则
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="violations">
            <div className="space-y-4">
              {/* 违规过滤器 */}
              <div className="flex gap-4">
                <Select value={filterViolationStatus} onValueChange={setFilterViolationStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="active">活跃</SelectItem>
                    <SelectItem value="resolved">已解决</SelectItem>
                    <SelectItem value="acknowledged">已确认</SelectItem>
                    <SelectItem value="ignored">已忽略</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 违规列表 */}
              <div className="space-y-3">
                {filteredViolations.map((violation) => (
                  <Card
                    key={violation.id}
                    className={cn("border", getViolationSeverityColor(violation.violationType))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getViolationSeverityColor(violation.violationType)}>
                              {violation.violationType}
                            </Badge>
                            <Badge variant="outline">
                              {violation.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {violation.detectedAt.toLocaleString()}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-2">
                            {violation.description}
                          </p>
                          
                          <div className="text-xs text-gray-500">
                            涉及实体: 
                            {violation.involvedEntities.users && (
                              <span className="ml-1">用户({violation.involvedEntities.users.length})</span>
                            )}
                            {violation.involvedEntities.roles && (
                              <span className="ml-1">角色({violation.involvedEntities.roles.length})</span>
                            )}
                            {violation.involvedEntities.permissions && (
                              <span className="ml-1">权限({violation.involvedEntities.permissions.length})</span>
                            )}
                            {violation.involvedEntities.policies && (
                              <span className="ml-1">策略({violation.involvedEntities.policies.length})</span>
                            )}
                          </div>

                          {violation.resolution && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                              <span className="font-medium">解决方案: </span>
                              {violation.resolution}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {violation.status === 'active' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const resolution = prompt('请输入解决方案描述:');
                                if (resolution) {
                                  handleResolveViolation(violation.id, resolution);
                                }
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              解决
                            </Button>
                          )}
                          
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredViolations.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      没有发现违规
                    </h3>
                    <p className="text-gray-500">
                      所有关系分配都符合验证规则
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ruleTemplates.map((template) => (
                  <Card key={template.id} className="border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{template.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                          <div className="flex gap-2">
                            <Badge variant="outline">{template.category}</Badge>
                            <Badge variant="secondary">{template.ruleType}</Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setIsCreateRuleDialogOpen(true);
                            // 可以预填充模板数据
                          }}
                        >
                          使用模板
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>验证设置</CardTitle>
                  <CardDescription>
                    配置验证规则的执行参数和通知设置
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>自动执行验证</Label>
                      <p className="text-sm text-gray-500">在关系变更时自动执行验证规则</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>实时通知</Label>
                      <p className="text-sm text-gray-500">检测到违规时立即发送通知</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label>扫描频率</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">实时</SelectItem>
                        <SelectItem value="hourly">每小时</SelectItem>
                        <SelectItem value="daily">每日</SelectItem>
                        <SelectItem value="weekly">每周</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>违规阈值</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">低</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="high">高</SelectItem>
                        <SelectItem value="critical">严重</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">只报告达到此级别的违规</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* 创建规则对话框 */}
      <Dialog open={isCreateRuleDialogOpen} onOpenChange={setIsCreateRuleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>创建验证规则</DialogTitle>
            <DialogDescription>
              定义新的关系分配验证规则
            </DialogDescription>
          </DialogHeader>
          <CreateRuleForm 
            templates={ruleTemplates}
            onSubmit={handleCreateRule}
            onCancel={() => setIsCreateRuleDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 编辑规则对话框 */}
      {selectedRule && (
        <Dialog open={isEditRuleDialogOpen} onOpenChange={setIsEditRuleDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>编辑验证规则</DialogTitle>
              <DialogDescription>
                修改验证规则的配置
              </DialogDescription>
            </DialogHeader>
            <EditRuleForm 
              rule={selectedRule}
              onSubmit={handleUpdateRule}
              onCancel={() => {
                setIsEditRuleDialogOpen(false);
                setSelectedRule(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

// 创建规则表单组件
const CreateRuleForm: React.FC<{
  templates: RuleTemplate[];
  onSubmit: (ruleData: Partial<ValidationRule>) => void;
  onCancel: () => void;
}> = ({ templates, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ValidationRule>>({
    name: '',
    description: '',
    type: 'user_role',
    category: 'security',
    priority: 50,
    isActive: true,
    conditions: [],
    actions: []
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>规则名称</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="输入规则名称"
          />
        </div>
        <div>
          <Label>优先级</Label>
          <Input
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
            min="1"
            max="100"
          />
        </div>
      </div>

      <div>
        <Label>描述</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="描述规则的用途和行为"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>类型</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user_role">用户角色</SelectItem>
              <SelectItem value="role_permission">角色权限</SelectItem>
              <SelectItem value="policy_scope">策略范围</SelectItem>
              <SelectItem value="separation_of_duties">职责分离</SelectItem>
              <SelectItem value="least_privilege">最小权限</SelectItem>
              <SelectItem value="temporal">时间限制</SelectItem>
              <SelectItem value="compliance">合规性</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>分类</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="security">安全</SelectItem>
              <SelectItem value="compliance">合规</SelectItem>
              <SelectItem value="business">业务</SelectItem>
              <SelectItem value="performance">性能</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label>立即激活规则</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={() => onSubmit(formData)}>
          创建规则
        </Button>
      </div>
    </div>
  );
};

// 编辑规则表单组件
const EditRuleForm: React.FC<{
  rule: ValidationRule;
  onSubmit: (rule: ValidationRule) => void;
  onCancel: () => void;
}> = ({ rule, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ValidationRule>(rule);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>规则名称</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <Label>优先级</Label>
          <Input
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
            min="1"
            max="100"
          />
        </div>
      </div>

      <div>
        <Label>描述</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>类型</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user_role">用户角色</SelectItem>
              <SelectItem value="role_permission">角色权限</SelectItem>
              <SelectItem value="policy_scope">策略范围</SelectItem>
              <SelectItem value="separation_of_duties">职责分离</SelectItem>
              <SelectItem value="least_privilege">最小权限</SelectItem>
              <SelectItem value="temporal">时间限制</SelectItem>
              <SelectItem value="compliance">合规性</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>分类</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="security">安全</SelectItem>
              <SelectItem value="compliance">合规</SelectItem>
              <SelectItem value="business">业务</SelectItem>
              <SelectItem value="performance">性能</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked, updatedAt: new Date() }))}
        />
        <Label>激活规则</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={() => onSubmit(formData)}>
          保存更改
        </Button>
      </div>
    </div>
  );
};

export default RelationshipValidationRules;
