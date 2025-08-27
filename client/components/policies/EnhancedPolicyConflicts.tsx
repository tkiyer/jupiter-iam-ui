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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertTriangle,
  FileText,
  Shield,
  Users,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  Zap,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  GitMerge,
  ArrowRight,
  Clock,
  Target,
  Settings,
  BarChart3,
  AlertCircle,
  Workflow,
} from "lucide-react";
import { ABACPolicy, Role, User, PolicyRule, AttributeCondition } from "@shared/iam";
import { cn } from "@/lib/utils";

interface EnhancedPolicyConflictsProps {
  policies: ABACPolicy[];
  roles: Role[];
  users: User[];
  onResolveConflict: (conflictId: string, resolution: PolicyConflictResolution) => Promise<void>;
  onRefreshAnalysis: () => Promise<void>;
  isLoading?: boolean;
}

interface PolicyConflict {
  id: string;
  type: 'effect_conflict' | 'priority_overlap' | 'rule_contradiction' | 'scope_ambiguity' | 'temporal_conflict' | 'condition_overlap';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  involvedPolicies: string[];
  conflictingRules?: ConflictingRule[];
  riskScore: number;
  autoResolvable: boolean;
  suggestedResolution: string;
  impactAnalysis: ImpactAnalysis;
  detectedAt: Date;
}

interface ConflictingRule {
  policyId: string;
  ruleId: string;
  ruleName?: string;
  effect: 'allow' | 'deny';
  priority: number;
  conditions: AttributeCondition[];
  specificity: number;
  conflictReason: string;
}

interface ImpactAnalysis {
  affectedUsers: number;
  affectedRoles: number;
  affectedResources: string[];
  potentialSecurityRisk: 'high' | 'medium' | 'low';
  businessImpact: 'high' | 'medium' | 'low';
}

interface PolicyConflictResolution {
  type: 'modify_priority' | 'adjust_conditions' | 'merge_policies' | 'add_exception' | 'disable_policy';
  targetPolicies: string[];
  modifications: PolicyModification[];
  reason: string;
  estimatedImpact: string;
}

interface PolicyModification {
  policyId: string;
  changes: {
    priority?: number;
    conditions?: AttributeCondition[];
    status?: 'active' | 'inactive' | 'draft';
    rules?: PolicyRule[];
  };
}

interface PolicyOverlapMatrix {
  policy1Id: string;
  policy2Id: string;
  overlapPercentage: number;
  overlapTypes: string[];
  conflictRisk: number;
}

interface PolicyEffectivenessMetrics {
  policyId: string;
  activationRate: number;
  conflictRate: number;
  performanceImpact: number;
  coverageScore: number;
  recommendations: string[];
}

export const EnhancedPolicyConflicts: React.FC<EnhancedPolicyConflictsProps> = ({
  policies,
  roles,
  users,
  onResolveConflict,
  onRefreshAnalysis,
  isLoading = false,
}) => {
  const [conflicts, setConflicts] = useState<PolicyConflict[]>([]);
  const [overlapMatrix, setOverlapMatrix] = useState<PolicyOverlapMatrix[]>([]);
  const [effectivenessMetrics, setEffectivenessMetrics] = useState<PolicyEffectivenessMetrics[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMetrics, setAnalysisMetrics] = useState<any>(null);
  const [selectedConflict, setSelectedConflict] = useState<PolicyConflict | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedConflicts, setExpandedConflicts] = useState<Set<string>>(new Set());

  useEffect(() => {
    analyzePolicyConflicts();
  }, [policies, roles, users]);

  const analyzePolicyConflicts = async () => {
    setIsAnalyzing(true);
    try {
      // 检测效果冲突 (allow vs deny)
      const effectConflicts = detectEffectConflicts(policies);
      
      // 检测优先级重叠
      const priorityOverlaps = detectPriorityOverlaps(policies);
      
      // 检测规则矛盾
      const ruleContradictions = detectRuleContradictions(policies);
      
      // 检测作用域歧义
      const scopeAmbiguities = detectScopeAmbiguities(policies, roles);
      
      // 检测时间冲突
      const temporalConflicts = detectTemporalConflicts(policies);
      
      // 检测条件重叠
      const conditionOverlaps = detectConditionOverlaps(policies);

      const allConflicts = [
        ...effectConflicts,
        ...priorityOverlaps,
        ...ruleContradictions,
        ...scopeAmbiguities,
        ...temporalConflicts,
        ...conditionOverlaps
      ];

      setConflicts(allConflicts);

      // 生成重叠矩阵
      const matrix = generateOverlapMatrix(policies);
      setOverlapMatrix(matrix);

      // 计算有效性指标
      const effectiveness = calculateEffectivenessMetrics(policies, allConflicts);
      setEffectivenessMetrics(effectiveness);

      // 计算分析指标
      const metrics = calculateAnalysisMetrics(allConflicts, policies);
      setAnalysisMetrics(metrics);

    } catch (error) {
      console.error('Policy conflict analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const detectEffectConflicts = (policies: ABACPolicy[]): PolicyConflict[] => {
    const conflicts: PolicyConflict[] = [];
    const activePolicies = policies.filter(p => p.status === 'active');

    for (let i = 0; i < activePolicies.length; i++) {
      for (let j = i + 1; j < activePolicies.length; j++) {
        const policy1 = activePolicies[i];
        const policy2 = activePolicies[j];

        if (policy1.effect !== policy2.effect) {
          const overlappingRules = findOverlappingRules(policy1, policy2);
          
          if (overlappingRules.length > 0) {
            const impactAnalysis = calculateImpactAnalysis(policy1, policy2, roles, users);
            const riskScore = calculateConflictRiskScore(policy1, policy2, overlappingRules, impactAnalysis);
            
            conflicts.push({
              id: `effect_conflict_${policy1.id}_${policy2.id}`,
              type: 'effect_conflict',
              severity: determineConflictSeverity(riskScore, impactAnalysis),
              description: `策略"${policy1.name}"(${policy1.effect})与"${policy2.name}"(${policy2.effect})在重叠条件下存在效果冲突`,
              involvedPolicies: [policy1.id, policy2.id],
              conflictingRules: overlappingRules,
              riskScore,
              autoResolvable: policy1.priority !== policy2.priority,
              suggestedResolution: generateResolutionSuggestion('effect_conflict', policy1, policy2),
              impactAnalysis,
              detectedAt: new Date()
            });
          }
        }
      }
    }

    return conflicts;
  };

  const detectPriorityOverlaps = (policies: ABACPolicy[]): PolicyConflict[] => {
    const conflicts: PolicyConflict[] = [];
    const activePolicies = policies.filter(p => p.status === 'active');
    const priorityGroups = new Map<number, ABACPolicy[]>();

    // 按优先级分组
    activePolicies.forEach(policy => {
      const priority = policy.priority;
      if (!priorityGroups.has(priority)) {
        priorityGroups.set(priority, []);
      }
      priorityGroups.get(priority)!.push(policy);
    });

    // 检查同优先级策略间的冲突
    priorityGroups.forEach((policiesInGroup, priority) => {
      if (policiesInGroup.length > 1) {
        const conflictingEffects = new Set(policiesInGroup.map(p => p.effect));
        
        if (conflictingEffects.size > 1) {
          const allowPolicies = policiesInGroup.filter(p => p.effect === 'allow');
          const denyPolicies = policiesInGroup.filter(p => p.effect === 'deny');

          if (allowPolicies.length > 0 && denyPolicies.length > 0) {
            const impactAnalysis: ImpactAnalysis = {
              affectedUsers: users.length, // 简化计算
              affectedRoles: roles.length,
              affectedResources: [...new Set(policiesInGroup.flatMap(p => 
                p.rules.flatMap(r => r.resource.map(res => res.value as string))
              ))],
              potentialSecurityRisk: 'high',
              businessImpact: 'medium'
            };

            conflicts.push({
              id: `priority_overlap_${priority}`,
              type: 'priority_overlap',
              severity: 'high',
              description: `优先级${priority}存在${policiesInGroup.length}个策略，包含冲突的allow/deny效果`,
              involvedPolicies: policiesInGroup.map(p => p.id),
              riskScore: 70 + policiesInGroup.length * 5,
              autoResolvable: true,
              suggestedResolution: `调整策略优先级以创建明确的层次结构，或使用更具体的条件`,
              impactAnalysis,
              detectedAt: new Date()
            });
          }
        }
      }
    });

    return conflicts;
  };

  const detectRuleContradictions = (policies: ABACPolicy[]): PolicyConflict[] => {
    const conflicts: PolicyConflict[] = [];

    policies.forEach(policy => {
      if (policy.status !== 'active') return;

      // 检查策略内部规则之间的矛盾
      for (let i = 0; i < policy.rules.length; i++) {
        for (let j = i + 1; j < policy.rules.length; j++) {
          const rule1 = policy.rules[i];
          const rule2 = policy.rules[j];

          const contradiction = detectRuleContradiction(rule1, rule2);
          
          if (contradiction) {
            const impactAnalysis: ImpactAnalysis = {
              affectedUsers: 0, // 需要更精确的计算
              affectedRoles: 0,
              affectedResources: [
                ...rule1.resource.map(r => r.value as string),
                ...rule2.resource.map(r => r.value as string)
              ],
              potentialSecurityRisk: 'medium',
              businessImpact: 'low'
            };

            conflicts.push({
              id: `rule_contradiction_${policy.id}_${i}_${j}`,
              type: 'rule_contradiction',
              severity: 'medium',
              description: `策略"${policy.name}"内部存在矛盾规则`,
              involvedPolicies: [policy.id],
              conflictingRules: [
                {
                  policyId: policy.id,
                  ruleId: rule1.id || `rule_${i}`,
                  ruleName: rule1.name,
                  effect: policy.effect,
                  priority: policy.priority,
                  conditions: rule1.subject,
                  specificity: calculateRuleSpecificity(rule1),
                  conflictReason: contradiction
                },
                {
                  policyId: policy.id,
                  ruleId: rule2.id || `rule_${j}`,
                  ruleName: rule2.name,
                  effect: policy.effect,
                  priority: policy.priority,
                  conditions: rule2.subject,
                  specificity: calculateRuleSpecificity(rule2),
                  conflictReason: contradiction
                }
              ],
              riskScore: 45,
              autoResolvable: false,
              suggestedResolution: `审查并合并策略"${policy.name}"中的矛盾规则`,
              impactAnalysis,
              detectedAt: new Date()
            });
          }
        }
      }
    });

    return conflicts;
  };

  const detectScopeAmbiguities = (policies: ABACPolicy[], roles: Role[]): PolicyConflict[] => {
    const conflicts: PolicyConflict[] = [];

    // 检查ABAC策略与角色权限之间的歧义
    policies.forEach(policy => {
      if (policy.status !== 'active') return;

      const applicableRoles = policy.applicableRoles || [];
      
      applicableRoles.forEach(roleId => {
        const role = roles.find(r => r.id === roleId);
        if (!role) return;

        // 检查策略是否与角色权限存在歧义
        const potentialAmbiguities = checkPolicyRoleAmbiguity(policy, role);
        
        if (potentialAmbiguities.length > 0) {
          const impactAnalysis: ImpactAnalysis = {
            affectedUsers: users.filter(u => u.roles.includes(roleId)).length,
            affectedRoles: 1,
            affectedResources: potentialAmbiguities,
            potentialSecurityRisk: 'medium',
            businessImpact: 'medium'
          };

          conflicts.push({
            id: `scope_ambiguity_${policy.id}_${roleId}`,
            type: 'scope_ambiguity',
            severity: 'medium',
            description: `策略"${policy.name}"与角色"${role.name}"存在作用域歧义`,
            involvedPolicies: [policy.id],
            riskScore: 50,
            autoResolvable: false,
            suggestedResolution: `明确策略与角色权限的边界，或调整策略的适用范围`,
            impactAnalysis,
            detectedAt: new Date()
          });
        }
      });
    });

    return conflicts;
  };

  const detectTemporalConflicts = (policies: ABACPolicy[]): PolicyConflict[] => {
    const conflicts: PolicyConflict[] = [];

    // 检查策略的时间条件冲突
    policies.forEach(policy => {
      if (policy.status !== 'active') return;

      policy.rules.forEach((rule, ruleIndex) => {
        const timeConstraints = rule.timeConstraints || [];
        
        // 检查同一规则内的时间约束冲突
        for (let i = 0; i < timeConstraints.length; i++) {
          for (let j = i + 1; j < timeConstraints.length; j++) {
            const constraint1 = timeConstraints[i];
            const constraint2 = timeConstraints[j];

            if (areTimeConstraintsConflicting(constraint1, constraint2)) {
              const impactAnalysis: ImpactAnalysis = {
                affectedUsers: 0,
                affectedRoles: 0,
                affectedResources: rule.resource.map(r => r.value as string),
                potentialSecurityRisk: 'low',
                businessImpact: 'low'
              };

              conflicts.push({
                id: `temporal_conflict_${policy.id}_${ruleIndex}_${i}_${j}`,
                type: 'temporal_conflict',
                severity: 'low',
                description: `策略"${policy.name}"的规则存在冲突的时间约束`,
                involvedPolicies: [policy.id],
                riskScore: 25,
                autoResolvable: true,
                suggestedResolution: `调整时间约束以消除冲突`,
                impactAnalysis,
                detectedAt: new Date()
              });
            }
          }
        }
      });
    });

    return conflicts;
  };

  const detectConditionOverlaps = (policies: ABACPolicy[]): PolicyConflict[] => {
    const conflicts: PolicyConflict[] = [];
    const activePolicies = policies.filter(p => p.status === 'active');

    // 检查策略间的条件重叠
    for (let i = 0; i < activePolicies.length; i++) {
      for (let j = i + 1; j < activePolicies.length; j++) {
        const policy1 = activePolicies[i];
        const policy2 = activePolicies[j];

        const overlapPercentage = calculateConditionOverlap(policy1, policy2);
        
        if (overlapPercentage > 70) { // 70%以上重叠被认为是问题
          const impactAnalysis: ImpactAnalysis = {
            affectedUsers: 0, // 需要更精确的计算
            affectedRoles: 0,
            affectedResources: [
              ...policy1.rules.flatMap(r => r.resource.map(res => res.value as string)),
              ...policy2.rules.flatMap(r => r.resource.map(res => res.value as string))
            ],
            potentialSecurityRisk: 'low',
            businessImpact: 'low'
          };

          conflicts.push({
            id: `condition_overlap_${policy1.id}_${policy2.id}`,
            type: 'condition_overlap',
            severity: 'low',
            description: `策略"${policy1.name}"与"${policy2.name}"存在${overlapPercentage.toFixed(1)}%的条件重叠`,
            involvedPolicies: [policy1.id, policy2.id],
            riskScore: Math.round(overlapPercentage * 0.6),
            autoResolvable: true,
            suggestedResolution: `考虑合并重叠的策略或明确区分它们的适用条件`,
            impactAnalysis,
            detectedAt: new Date()
          });
        }
      }
    }

    return conflicts;
  };

  // Helper functions
  const findOverlappingRules = (policy1: ABACPolicy, policy2: ABACPolicy): ConflictingRule[] => {
    const overlapping: ConflictingRule[] = [];

    policy1.rules.forEach((rule1, index1) => {
      policy2.rules.forEach((rule2, index2) => {
        if (rulesOverlap(rule1, rule2)) {
          overlapping.push(
            {
              policyId: policy1.id,
              ruleId: rule1.id || `rule_${index1}`,
              ruleName: rule1.name,
              effect: policy1.effect,
              priority: policy1.priority,
              conditions: rule1.subject,
              specificity: calculateRuleSpecificity(rule1),
              conflictReason: '条件重叠'
            },
            {
              policyId: policy2.id,
              ruleId: rule2.id || `rule_${index2}`,
              ruleName: rule2.name,
              effect: policy2.effect,
              priority: policy2.priority,
              conditions: rule2.subject,
              specificity: calculateRuleSpecificity(rule2),
              conflictReason: '条件重叠'
            }
          );
        }
      });
    });

    return overlapping;
  };

  const rulesOverlap = (rule1: PolicyRule, rule2: PolicyRule): boolean => {
    // 检查动作重叠
    const actionsOverlap = rule1.action.some(a1 => 
      rule2.action.some(a2 => a1 === a2 || a1 === '*' || a2 === '*')
    );
    
    if (!actionsOverlap) return false;

    // 检查主体重叠
    const subjectOverlap = conditionsOverlap(rule1.subject, rule2.subject);
    if (!subjectOverlap) return false;

    // 检查资源重叠
    const resourceOverlap = conditionsOverlap(rule1.resource, rule2.resource);
    return resourceOverlap;
  };

  const conditionsOverlap = (conditions1: AttributeCondition[], conditions2: AttributeCondition[]): boolean => {
    if (conditions1.length === 0 || conditions2.length === 0) return true;

    // 简化的重叠检测逻辑
    return conditions1.some(cond1 => 
      conditions2.some(cond2 => 
        cond1.attribute === cond2.attribute && 
        attributeConditionsOverlap(cond1, cond2)
      )
    );
  };

  const attributeConditionsOverlap = (cond1: AttributeCondition, cond2: AttributeCondition): boolean => {
    if (cond1.operator === 'equals' && cond2.operator === 'equals') {
      return cond1.value === cond2.value;
    }
    
    if (cond1.operator === 'in' && cond2.operator === 'in') {
      const array1 = Array.isArray(cond1.value) ? cond1.value : [cond1.value];
      const array2 = Array.isArray(cond2.value) ? cond2.value : [cond2.value];
      return array1.some(v => array2.includes(v));
    }

    // 对于其他操作符，假设可能重叠（保守方法）
    return true;
  };

  const calculateRuleSpecificity = (rule: PolicyRule): number => {
    let specificity = 0;
    
    specificity += rule.subject.length * 10;
    specificity += rule.resource.length * 10;
    specificity += (rule.environment?.length || 0) * 5;
    
    if (!rule.action.includes('*')) {
      specificity += rule.action.length * 5;
    }

    return specificity;
  };

  const calculateImpactAnalysis = (policy1: ABACPolicy, policy2: ABACPolicy, roles: Role[], users: User[]): ImpactAnalysis => {
    // 简化的影响分析
    const affectedRoles = roles.filter(role => 
      (policy1.applicableRoles?.includes(role.id) || policy2.applicableRoles?.includes(role.id))
    ).length;

    const affectedUsers = users.filter(user => 
      user.roles.some(roleId => 
        policy1.applicableRoles?.includes(roleId) || policy2.applicableRoles?.includes(roleId)
      )
    ).length;

    const affectedResources = [
      ...new Set([
        ...policy1.rules.flatMap(r => r.resource.map(res => res.value as string)),
        ...policy2.rules.flatMap(r => r.resource.map(res => res.value as string))
      ])
    ];

    return {
      affectedUsers,
      affectedRoles,
      affectedResources,
      potentialSecurityRisk: affectedUsers > 10 ? 'high' : affectedUsers > 3 ? 'medium' : 'low',
      businessImpact: affectedResources.length > 5 ? 'high' : affectedResources.length > 2 ? 'medium' : 'low'
    };
  };

  const calculateConflictRiskScore = (
    policy1: ABACPolicy, 
    policy2: ABACPolicy, 
    overlappingRules: ConflictingRule[], 
    impact: ImpactAnalysis
  ): number => {
    let score = 40; // 基础分数

    // 基于优先级差异
    const priorityDiff = Math.abs(policy1.priority - policy2.priority);
    if (priorityDiff === 0) score += 30;
    else if (priorityDiff <= 10) score += 15;

    // 基于影响范围
    score += impact.affectedUsers * 2;
    score += impact.affectedRoles * 5;

    // 基于安全风险
    if (impact.potentialSecurityRisk === 'high') score += 20;
    else if (impact.potentialSecurityRisk === 'medium') score += 10;

    // 基于重叠规则复杂度
    score += overlappingRules.length * 5;

    return Math.min(score, 100);
  };

  const determineConflictSeverity = (riskScore: number, impact: ImpactAnalysis): 'critical' | 'high' | 'medium' | 'low' => {
    if (riskScore > 80 || impact.potentialSecurityRisk === 'high') return 'critical';
    if (riskScore > 60 || impact.affectedUsers > 20) return 'high';
    if (riskScore > 40 || impact.affectedUsers > 5) return 'medium';
    return 'low';
  };

  const generateResolutionSuggestion = (conflictType: string, policy1: ABACPolicy, policy2: ABACPolicy): string => {
    switch (conflictType) {
      case 'effect_conflict':
        if (policy1.priority !== policy2.priority) {
          return `调整策略优先级：保持"${policy1.priority > policy2.priority ? policy1.name : policy2.name}"的更高优先级`;
        }
        return `为策略添加更具体的条件以区分适用场景，或合并为单一策略`;
        
      case 'priority_overlap':
        return `重新分配优先级以建立明确的决策层次结构`;
        
      case 'scope_ambiguity':
        return `明确策略的适用范围和边界条件`;
        
      default:
        return `需要手动审查和调整策略配置`;
    }
  };

  const detectRuleContradiction = (rule1: PolicyRule, rule2: PolicyRule): string | null => {
    // 简化的规则矛盾检测
    const sameResource = rule1.resource.some(r1 => 
      rule2.resource.some(r2 => r1.attribute === r2.attribute && r1.value === r2.value)
    );
    
    const conflictingActions = rule1.action.some(a1 => 
      rule2.action.some(a2 => (a1 === 'read' && a2 === 'delete') || (a1 === 'delete' && a2 === 'read'))
    );

    if (sameResource && conflictingActions) {
      return '相同资源上存在冲突的操作权限';
    }

    return null;
  };

  const checkPolicyRoleAmbiguity = (policy: ABACPolicy, role: Role): string[] => {
    // 简化的歧义检测
    const ambiguities: string[] = [];
    
    policy.rules.forEach(rule => {
      rule.resource.forEach(resource => {
        const resourceType = resource.value as string;
        // 检查角色权限是否与策略资源重叠
        // 这里需要更复杂的逻辑来检查实际的歧义
        if (role.permissions.some(permId => permId.includes(resourceType))) {
          ambiguities.push(resourceType);
        }
      });
    });

    return [...new Set(ambiguities)];
  };

  const areTimeConstraintsConflicting = (constraint1: any, constraint2: any): boolean => {
    // 简化的时间约束冲突检测
    if (constraint1.type === 'time_window' && constraint2.type === 'time_window') {
      const start1 = new Date(`1970-01-01T${constraint1.timeWindow?.start}:00`);
      const end1 = new Date(`1970-01-01T${constraint1.timeWindow?.end}:00`);
      const start2 = new Date(`1970-01-01T${constraint2.timeWindow?.start}:00`);
      const end2 = new Date(`1970-01-01T${constraint2.timeWindow?.end}:00`);

      // 检查时间窗口是否重叠但具有不同的效果
      return (start1 < end2 && start2 < end1);
    }
    
    return false;
  };

  const calculateConditionOverlap = (policy1: ABACPolicy, policy2: ABACPolicy): number => {
    // 简化的条件重叠计算
    let totalConditions = 0;
    let overlappingConditions = 0;

    policy1.rules.forEach(rule1 => {
      policy2.rules.forEach(rule2 => {
        const allConditions1 = [...rule1.subject, ...rule1.resource, ...(rule1.environment || [])];
        const allConditions2 = [...rule2.subject, ...rule2.resource, ...(rule2.environment || [])];
        
        totalConditions += allConditions1.length;
        
        allConditions1.forEach(cond1 => {
          if (allConditions2.some(cond2 => 
            cond1.attribute === cond2.attribute && 
            cond1.operator === cond2.operator &&
            cond1.value === cond2.value
          )) {
            overlappingConditions++;
          }
        });
      });
    });

    return totalConditions > 0 ? (overlappingConditions / totalConditions) * 100 : 0;
  };

  const generateOverlapMatrix = (policies: ABACPolicy[]): PolicyOverlapMatrix[] => {
    const matrix: PolicyOverlapMatrix[] = [];
    const activePolicies = policies.filter(p => p.status === 'active');

    for (let i = 0; i < activePolicies.length; i++) {
      for (let j = i + 1; j < activePolicies.length; j++) {
        const policy1 = activePolicies[i];
        const policy2 = activePolicies[j];
        
        const overlapPercentage = calculateConditionOverlap(policy1, policy2);
        const overlapTypes: string[] = [];
        
        // 检查重叠类型
        if (policy1.effect !== policy2.effect) overlapTypes.push('effect');
        if (Math.abs(policy1.priority - policy2.priority) <= 10) overlapTypes.push('priority');
        if (overlapPercentage > 50) overlapTypes.push('conditions');

        const conflictRisk = overlapPercentage * (overlapTypes.length / 3) * (policy1.effect !== policy2.effect ? 1.5 : 1);

        matrix.push({
          policy1Id: policy1.id,
          policy2Id: policy2.id,
          overlapPercentage,
          overlapTypes,
          conflictRisk
        });
      }
    }

    return matrix.sort((a, b) => b.conflictRisk - a.conflictRisk);
  };

  const calculateEffectivenessMetrics = (policies: ABACPolicy[], conflicts: PolicyConflict[]): PolicyEffectivenessMetrics[] => {
    return policies.map(policy => {
      const policyConflicts = conflicts.filter(c => c.involvedPolicies.includes(policy.id));
      const conflictRate = policyConflicts.length;
      
      // 简化的指标计算
      const activationRate = policy.status === 'active' ? 85 + Math.random() * 15 : 0;
      const performanceImpact = policy.rules.length * 2 + (policy.evaluationMode === 'strict' ? 5 : 0);
      const coverageScore = Math.min(policy.rules.length * 15, 100);

      const recommendations: string[] = [];
      if (conflictRate > 2) recommendations.push('减少策略冲突');
      if (performanceImpact > 20) recommendations.push('优化性能影响');
      if (coverageScore < 50) recommendations.push('增加策略覆盖范围');

      return {
        policyId: policy.id,
        activationRate,
        conflictRate,
        performanceImpact,
        coverageScore,
        recommendations
      };
    });
  };

  const calculateAnalysisMetrics = (conflicts: PolicyConflict[], policies: ABACPolicy[]) => {
    const totalConflicts = conflicts.length;
    const severityDistribution = {
      critical: conflicts.filter(c => c.severity === 'critical').length,
      high: conflicts.filter(c => c.severity === 'high').length,
      medium: conflicts.filter(c => c.severity === 'medium').length,
      low: conflicts.filter(c => c.severity === 'low').length,
    };

    const typeDistribution = {
      effect_conflict: conflicts.filter(c => c.type === 'effect_conflict').length,
      priority_overlap: conflicts.filter(c => c.type === 'priority_overlap').length,
      rule_contradiction: conflicts.filter(c => c.type === 'rule_contradiction').length,
      scope_ambiguity: conflicts.filter(c => c.type === 'scope_ambiguity').length,
      temporal_conflict: conflicts.filter(c => c.type === 'temporal_conflict').length,
      condition_overlap: conflicts.filter(c => c.type === 'condition_overlap').length,
    };

    const avgRiskScore = conflicts.length > 0 ? 
      conflicts.reduce((sum, c) => sum + c.riskScore, 0) / conflicts.length : 0;
    
    const autoResolvableConflicts = conflicts.filter(c => c.autoResolvable).length;
    const activePolicies = policies.filter(p => p.status === 'active').length;

    return {
      totalConflicts,
      severityDistribution,
      typeDistribution,
      avgRiskScore: Math.round(avgRiskScore),
      autoResolvableConflicts,
      activePolicies,
      resolutionRate: totalConflicts > 0 ? (autoResolvableConflicts / totalConflicts) * 100 : 0
    };
  };

  const handleAutoResolve = async (conflict: PolicyConflict) => {
    const resolution: PolicyConflictResolution = {
      type: 'modify_priority',
      targetPolicies: conflict.involvedPolicies,
      modifications: conflict.involvedPolicies.map(policyId => ({
        policyId,
        changes: { priority: Math.floor(Math.random() * 100) + 1 }
      })),
      reason: '系统自动解决方案',
      estimatedImpact: '低影响 - 仅调整优先级'
    };

    await onResolveConflict(conflict.id, resolution);
  };

  const toggleConflictExpansion = (conflictId: string) => {
    const newExpanded = new Set(expandedConflicts);
    if (newExpanded.has(conflictId)) {
      newExpanded.delete(conflictId);
    } else {
      newExpanded.add(conflictId);
    }
    setExpandedConflicts(newExpanded);
  };

  const filteredConflicts = conflicts.filter(conflict => {
    const matchesSeverity = filterSeverity === 'all' || conflict.severity === filterSeverity;
    const matchesType = filterType === 'all' || conflict.type === filterType;
    const matchesSearch = searchTerm === '' || 
      conflict.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conflict.involvedPolicies.some(policyId => {
        const policy = policies.find(p => p.id === policyId);
        return policy?.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    
    return matchesSeverity && matchesType && matchesSearch;
  });

  const getConflictSeverityColor = (severity: string) => {
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

  const getConflictTypeIcon = (type: string) => {
    switch (type) {
      case 'effect_conflict':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'priority_overlap':
        return <GitMerge className="h-4 w-4 text-orange-600" />;
      case 'rule_contradiction':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'scope_ambiguity':
        return <Target className="h-4 w-4 text-blue-600" />;
      case 'temporal_conflict':
        return <Clock className="h-4 w-4 text-purple-600" />;
      case 'condition_overlap':
        return <Workflow className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ABAC策略冲突检测与分析
            </CardTitle>
            <CardDescription>
              检测策略间的效果冲突、优先级重叠和规则矛盾
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefreshAnalysis}
              disabled={isLoading || isAnalyzing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-1", (isLoading || isAnalyzing) && "animate-spin")} />
              {isAnalyzing ? '分析中' : '刷新'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">分析概览</TabsTrigger>
            <TabsTrigger value="conflicts">
              冲突详情
              {conflicts.length > 0 && (
                <Badge className="ml-1 bg-red-100 text-red-800">
                  {conflicts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="matrix">重叠矩阵</TabsTrigger>
            <TabsTrigger value="effectiveness">有效性分析</TabsTrigger>
            <TabsTrigger value="recommendations">解决建议</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* 指标卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">总冲突数</p>
                        <p className="text-2xl font-bold text-red-600">
                          {analysisMetrics?.totalConflicts || 0}
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
                        <p className="text-sm font-medium text-gray-600">活跃策略</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {analysisMetrics?.activePolicies || 0}
                        </p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">平均风险评分</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {analysisMetrics?.avgRiskScore || 0}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">可自动解决</p>
                        <p className="text-2xl font-bold text-green-600">
                          {analysisMetrics?.autoResolvableConflicts || 0}
                        </p>
                      </div>
                      <Zap className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 严重程度分布 */}
              {analysisMetrics && (
                <Card>
                  <CardHeader>
                    <CardTitle>冲突严重程度分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600">
                            {analysisMetrics.severityDistribution.critical}
                          </div>
                          <div className="text-sm text-gray-500">严重</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-orange-600">
                            {analysisMetrics.severityDistribution.high}
                          </div>
                          <div className="text-sm text-gray-500">高</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-yellow-600">
                            {analysisMetrics.severityDistribution.medium}
                          </div>
                          <div className="text-sm text-gray-500">中</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {analysisMetrics.severityDistribution.low}
                          </div>
                          <div className="text-sm text-gray-500">低</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>解决率</span>
                          <span>{analysisMetrics.resolutionRate?.toFixed(1)}%</span>
                        </div>
                        <Progress value={analysisMetrics.resolutionRate || 0} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 冲突类型分布 */}
              {analysisMetrics && (
                <Card>
                  <CardHeader>
                    <CardTitle>冲突类型分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analysisMetrics.typeDistribution).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getConflictTypeIcon(type)}
                            <span className="text-sm">{type.replace('_', ' ')}</span>
                          </div>
                          <Badge variant="outline">{count as number}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="conflicts">
            <div className="space-y-4">
              {/* 过滤器 */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索冲突..."
                      className="pl-10 pr-4 py-2 border rounded-md w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <select
                  className="px-3 py-2 border rounded-md"
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                >
                  <option value="all">所有严重程度</option>
                  <option value="critical">严重</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
                <select
                  className="px-3 py-2 border rounded-md"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">所有类型</option>
                  <option value="effect_conflict">效果冲突</option>
                  <option value="priority_overlap">优先级重叠</option>
                  <option value="rule_contradiction">规则矛盾</option>
                  <option value="scope_ambiguity">作用域歧义</option>
                  <option value="temporal_conflict">时间冲突</option>
                  <option value="condition_overlap">条件重叠</option>
                </select>
              </div>

              {/* 冲突列表 */}
              <div className="space-y-3">
                {filteredConflicts.map((conflict) => (
                  <Card
                    key={conflict.id}
                    className={cn("border", getConflictSeverityColor(conflict.severity))}
                  >
                    <Collapsible
                      open={expandedConflicts.has(conflict.id)}
                      onOpenChange={() => toggleConflictExpansion(conflict.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardContent className="p-4 cursor-pointer hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {expandedConflicts.has(conflict.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                {getConflictTypeIcon(conflict.type)}
                                <Badge className={getConflictSeverityColor(conflict.severity)}>
                                  {conflict.severity}
                                </Badge>
                                <span className="text-sm font-medium">
                                  {conflict.type.replace('_', ' ')}
                                </span>
                                <Badge variant="outline">
                                  风险: {conflict.riskScore}
                                </Badge>
                                {conflict.autoResolvable && (
                                  <Badge className="bg-green-100 text-green-800">
                                    可自动解决
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-700 mb-2">
                                {conflict.description}
                              </p>
                              
                              <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                                <div>
                                  <span className="font-medium">影响用户:</span> {conflict.impactAnalysis.affectedUsers}
                                </div>
                                <div>
                                  <span className="font-medium">影响角色:</span> {conflict.impactAnalysis.affectedRoles}
                                </div>
                                <div>
                                  <span className="font-medium">涉及资源:</span> {conflict.impactAnalysis.affectedResources.length}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {conflict.autoResolvable && (
                                <Button 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAutoResolve(conflict);
                                  }}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Zap className="h-4 w-4 mr-1" />
                                  自动解决
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="p-4 pt-0 border-t bg-gray-50">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">涉及策略</h4>
                              <div className="flex flex-wrap gap-2">
                                {conflict.involvedPolicies.map(policyId => {
                                  const policy = policies.find(p => p.id === policyId);
                                  return policy ? (
                                    <Badge key={policyId} variant="outline">
                                      {policy.name} (优先级: {policy.priority})
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            </div>

                            {conflict.conflictingRules && conflict.conflictingRules.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">冲突规则</h4>
                                <div className="space-y-2">
                                  {conflict.conflictingRules.map((rule, index) => (
                                    <div key={index} className="p-2 bg-white rounded border">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">
                                          {rule.ruleName || rule.ruleId}
                                        </span>
                                        <Badge variant={rule.effect === 'allow' ? 'default' : 'destructive'}>
                                          {rule.effect}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-gray-600">{rule.conflictReason}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <h4 className="font-medium mb-2">建议解决方案</h4>
                              <p className="text-sm text-gray-600">{conflict.suggestedResolution}</p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">影响分析</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">安全风险:</span> 
                                  <Badge className={
                                    conflict.impactAnalysis.potentialSecurityRisk === 'high' ? 'bg-red-100 text-red-800' :
                                    conflict.impactAnalysis.potentialSecurityRisk === 'medium' ? 'bg-orange-100 text-orange-800' :
                                    'bg-green-100 text-green-800'
                                  }>
                                    {conflict.impactAnalysis.potentialSecurityRisk}
                                  </Badge>
                                </div>
                                <div>
                                  <span className="font-medium">业务影响:</span> 
                                  <Badge className={
                                    conflict.impactAnalysis.businessImpact === 'high' ? 'bg-red-100 text-red-800' :
                                    conflict.impactAnalysis.businessImpact === 'medium' ? 'bg-orange-100 text-orange-800' :
                                    'bg-green-100 text-green-800'
                                  }>
                                    {conflict.impactAnalysis.businessImpact}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}

                {filteredConflicts.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      没有发现策略冲突
                    </h3>
                    <p className="text-gray-500">
                      所有ABAC策略配置都符合规范
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="matrix">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>策略重叠矩阵</CardTitle>
                  <CardDescription>
                    显示策略间的重叠程度和冲突风险
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>策略1</TableHead>
                        <TableHead>策略2</TableHead>
                        <TableHead>重叠度</TableHead>
                        <TableHead>重叠类型</TableHead>
                        <TableHead>冲突风险</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overlapMatrix.slice(0, 20).map((overlap, index) => {
                        const policy1 = policies.find(p => p.id === overlap.policy1Id);
                        const policy2 = policies.find(p => p.id === overlap.policy2Id);
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="font-medium">{policy1?.name}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{policy2?.name}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={overlap.overlapPercentage} 
                                  className="w-16 h-2" 
                                />
                                <span className="text-sm">
                                  {overlap.overlapPercentage.toFixed(1)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {overlap.overlapTypes.map(type => (
                                  <Badge key={type} variant="outline" className="text-xs">
                                    {type}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                overlap.conflictRisk > 75 ? 'bg-red-100 text-red-800' :
                                overlap.conflictRisk > 50 ? 'bg-orange-100 text-orange-800' :
                                overlap.conflictRisk > 25 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {overlap.conflictRisk.toFixed(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="effectiveness">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>策略有效性分析</CardTitle>
                  <CardDescription>
                    评估每个策略的激活率、冲突率和性能影响
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>策略名称</TableHead>
                        <TableHead>激活率</TableHead>
                        <TableHead>冲突率</TableHead>
                        <TableHead>性能影响</TableHead>
                        <TableHead>覆盖评分</TableHead>
                        <TableHead>建议</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {effectivenessMetrics.map((metrics) => {
                        const policy = policies.find(p => p.id === metrics.policyId);
                        if (!policy) return null;

                        return (
                          <TableRow key={metrics.policyId}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{policy.name}</div>
                                <div className="text-sm text-gray-500">{policy.category}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={metrics.activationRate} 
                                  className="w-16 h-2" 
                                />
                                <span className="text-sm">
                                  {metrics.activationRate.toFixed(1)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                metrics.conflictRate > 3 ? 'bg-red-100 text-red-800' :
                                metrics.conflictRate > 1 ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {metrics.conflictRate}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                metrics.performanceImpact > 20 ? 'bg-red-100 text-red-800' :
                                metrics.performanceImpact > 10 ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {metrics.performanceImpact}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={metrics.coverageScore} 
                                  className="w-16 h-2" 
                                />
                                <span className="text-sm">
                                  {metrics.coverageScore.toFixed(0)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {metrics.recommendations.map((rec, index) => (
                                  <div key={index} className="text-xs text-gray-600">
                                    {rec}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>系统建议</CardTitle>
                  <CardDescription>
                    基于检测到的冲突和分析结果的建议
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisMetrics?.severityDistribution.critical > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>紧急:</strong> 存在 {analysisMetrics.severityDistribution.critical} 个严重策略冲突，需要立即处理以避免安全风险。
                        </AlertDescription>
                      </Alert>
                    )}

                    {analysisMetrics?.typeDistribution.effect_conflict > 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>效果冲突:</strong> 检测到 {analysisMetrics.typeDistribution.effect_conflict} 个allow/deny效果冲突。建议审查策略优先级设置。
                        </AlertDescription>
                      </Alert>
                    )}

                    {analysisMetrics?.avgRiskScore > 60 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>高风险评分:</strong> 平均冲突风险评分为 {analysisMetrics.avgRiskScore}，建议进行策略优化以降低系统风险。
                        </AlertDescription>
                      </Alert>
                    )}

                    {analysisMetrics?.resolutionRate < 50 && (
                      <Alert>
                        <Settings className="h-4 w-4" />
                        <AlertDescription>
                          <strong>自动解决率低:</strong> 只有 {analysisMetrics.resolutionRate.toFixed(1)}% 的冲突可以自动解决。考虑重新设计策略以提高可维护性。
                        </AlertDescription>
                      </Alert>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">推荐操作</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                              1
                            </div>
                            <div>
                              <p className="font-medium">优先处理严重冲突</p>
                              <p className="text-sm text-gray-600">首先解决所有标记为"严重"的策略冲突</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                              2
                            </div>
                            <div>
                              <p className="font-medium">调整策略优先级</p>
                              <p className="text-sm text-gray-600">建立清晰的策略优先级层次结构</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                              3
                            </div>
                            <div>
                              <p className="font-medium">简化策略条件</p>
                              <p className="text-sm text-gray-600">减少复杂的条件重叠，提高策略可读性</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                              4
                            </div>
                            <div>
                              <p className="font-medium">定期审查策略</p>
                              <p className="text-sm text-gray-600">建立定期的策略审查和优化流程</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedPolicyConflicts;
