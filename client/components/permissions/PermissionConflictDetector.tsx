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
  AlertTriangle,
  Shield,
  Key,
  Users,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  Zap,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Lock,
  Unlock,
  Crown,
  AlertCircle,
} from "lucide-react";
import { Permission, Role, User } from "@shared/iam";
import { cn } from "@/lib/utils";

interface PermissionConflictDetectorProps {
  permissions: Permission[];
  roles: Role[];
  users: User[];
  onResolveConflict: (conflictId: string, resolution: PermissionConflictResolution) => Promise<void>;
  onRefreshAnalysis: () => Promise<void>;
  isLoading?: boolean;
}

interface PermissionConflict {
  id: string;
  type: 'logical_conflict' | 'security_risk' | 'over_privilege' | 'dependency_violation' | 'scope_overlap';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  involvedPermissions: string[];
  involvedRoles?: string[];
  affectedUsers?: string[];
  riskScore: number;
  autoResolvable: boolean;
  suggestedResolution: string;
  detectedAt: Date;
}

interface PermissionConflictResolution {
  type: 'remove_permission' | 'modify_scope' | 'add_restriction' | 'merge_permissions' | 'ignore';
  targetPermissions: string[];
  details: Record<string, any>;
  reason: string;
}

interface PermissionRiskAnalysis {
  permissionId: string;
  riskScore: number;
  riskFactors: RiskFactor[];
  usageMetrics: {
    assignedRoles: number;
    affectedUsers: number;
    lastUsed: Date | null;
    usageFrequency: 'high' | 'medium' | 'low' | 'unused';
  };
  recommendations: string[];
}

interface RiskFactor {
  type: 'high_privilege' | 'sensitive_data' | 'admin_access' | 'external_access' | 'deprecated';
  weight: number;
  description: string;
}

interface PermissionMatrix {
  permissionId: string;
  conflicts: string[];
  dependencies: string[];
  redundancies: string[];
}

export const PermissionConflictDetector: React.FC<PermissionConflictDetectorProps> = ({
  permissions,
  roles,
  users,
  onResolveConflict,
  onRefreshAnalysis,
  isLoading = false,
}) => {
  const [conflicts, setConflicts] = useState<PermissionConflict[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<PermissionRiskAnalysis[]>([]);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMetrics, setAnalysisMetrics] = useState<any>(null);
  const [selectedConflict, setSelectedConflict] = useState<PermissionConflict | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    analyzePermissionConflicts();
  }, [permissions, roles, users]);

  const analyzePermissionConflicts = async () => {
    setIsAnalyzing(true);
    try {
      // 检测逻辑冲突
      const logicalConflicts = detectLogicalConflicts(permissions, roles);
      
      // 检测安全风险
      const securityRisks = detectSecurityRisks(permissions, roles, users);
      
      // 检测过度权限
      const overPrivileges = detectOverPrivileges(permissions, roles, users);
      
      // 检测依赖关系违规
      const dependencyViolations = detectDependencyViolations(permissions, roles);
      
      // 检测作用域重叠
      const scopeOverlaps = detectScopeOverlaps(permissions);

      const allConflicts = [
        ...logicalConflicts,
        ...securityRisks,
        ...overPrivileges,
        ...dependencyViolations,
        ...scopeOverlaps
      ];

      setConflicts(allConflicts);

      // 生成风险分析
      const riskAnalysisResults = generateRiskAnalysis(permissions, roles, users, allConflicts);
      setRiskAnalysis(riskAnalysisResults);

      // 生成权限矩阵
      const matrixResults = generatePermissionMatrix(permissions, allConflicts);
      setPermissionMatrix(matrixResults);

      // 计算分析指标
      const metrics = calculateAnalysisMetrics(allConflicts, riskAnalysisResults);
      setAnalysisMetrics(metrics);

    } catch (error) {
      console.error('Permission conflict analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const detectLogicalConflicts = (permissions: Permission[], roles: Role[]): PermissionConflict[] => {
    const conflicts: PermissionConflict[] = [];

    // 检测读写冲突
    for (let i = 0; i < permissions.length; i++) {
      for (let j = i + 1; j < permissions.length; j++) {
        const perm1 = permissions[i];
        const perm2 = permissions[j];

        // 检查相同资源上的冲突权限
        if (perm1.resource === perm2.resource) {
          if (isConflictingActions(perm1.action, perm2.action)) {
            const conflictRoles = roles.filter(role => 
              role.permissions.includes(perm1.id) && role.permissions.includes(perm2.id)
            );

            if (conflictRoles.length > 0) {
              conflicts.push({
                id: `logical_${perm1.id}_${perm2.id}`,
                type: 'logical_conflict',
                severity: calculateConflictSeverity(perm1, perm2, conflictRoles),
                description: `权限"${perm1.name}"与"${perm2.name}"在资源"${perm1.resource}"上存在逻辑冲突`,
                involvedPermissions: [perm1.id, perm2.id],
                involvedRoles: conflictRoles.map(r => r.id),
                affectedUsers: getUsersByRoles(conflictRoles, users),
                riskScore: calculateRiskScore(perm1, perm2, conflictRoles, users),
                autoResolvable: canAutoResolve(perm1, perm2),
                suggestedResolution: generateResolutionSuggestion(perm1, perm2, 'logical_conflict'),
                detectedAt: new Date()
              });
            }
          }
        }
      }
    }

    return conflicts;
  };

  const detectSecurityRisks = (permissions: Permission[], roles: Role[], users: User[]): PermissionConflict[] => {
    const conflicts: PermissionConflict[] = [];

    permissions.forEach(permission => {
      const riskFactors = assessPermissionRisk(permission);
      const totalRisk = riskFactors.reduce((sum, factor) => sum + factor.weight, 0);

      if (totalRisk > 75) { // 高风险阈值
        const assignedRoles = roles.filter(role => role.permissions.includes(permission.id));
        const affectedUsers = getUsersByRoles(assignedRoles, users);

        conflicts.push({
          id: `security_risk_${permission.id}`,
          type: 'security_risk',
          severity: totalRisk > 90 ? 'critical' : 'high',
          description: `权限"${permission.name}"存在高安全风险，风险评分: ${totalRisk}`,
          involvedPermissions: [permission.id],
          involvedRoles: assignedRoles.map(r => r.id),
          affectedUsers: affectedUsers,
          riskScore: totalRisk,
          autoResolvable: false,
          suggestedResolution: `审查权限"${permission.name}"的分配，考虑限制访问范围或添加额外验证`,
          detectedAt: new Date()
        });
      }
    });

    return conflicts;
  };

  const detectOverPrivileges = (permissions: Permission[], roles: Role[], users: User[]): PermissionConflict[] => {
    const conflicts: PermissionConflict[] = [];

    roles.forEach(role => {
      // 检查角色是否拥有过多高风险权限
      const highRiskPermissions = role.permissions.filter(permId => {
        const permission = permissions.find(p => p.id === permId);
        return permission && permission.risk === 'critical';
      });

      if (highRiskPermissions.length > 3) { // 阈值：超过3个高风险权限
        const roleUsers = users.filter(user => user.roles.includes(role.id));

        conflicts.push({
          id: `over_privilege_${role.id}`,
          type: 'over_privilege',
          severity: 'medium',
          description: `角色"${role.name}"拥有过多高风险权限 (${highRiskPermissions.length}个)`,
          involvedPermissions: highRiskPermissions,
          involvedRoles: [role.id],
          affectedUsers: roleUsers.map(u => u.id),
          riskScore: highRiskPermissions.length * 15,
          autoResolvable: false,
          suggestedResolution: `重新评估角色"${role.name}"的权限分配，考虑拆分角色或移除不必要的高风险权限`,
          detectedAt: new Date()
        });
      }
    });

    return conflicts;
  };

  const detectDependencyViolations = (permissions: Permission[], roles: Role[]): PermissionConflict[] => {
    const conflicts: PermissionConflict[] = [];

    // 检查权限依赖关系
    permissions.forEach(permission => {
      if (permission.scope === 'field' && permission.fieldRestrictions) {
        // 检查字段级权限的依赖
        const resourcePermissions = permissions.filter(p => 
          p.resource === permission.resource && p.scope === 'resource'
        );

        const rolesWithField = roles.filter(role => role.permissions.includes(permission.id));
        const rolesWithoutResource = rolesWithField.filter(role => 
          !resourcePermissions.some(rp => role.permissions.includes(rp.id))
        );

        if (rolesWithoutResource.length > 0) {
          conflicts.push({
            id: `dependency_${permission.id}`,
            type: 'dependency_violation',
            severity: 'medium',
            description: `字段权限"${permission.name}"缺少对应的资源权限依赖`,
            involvedPermissions: [permission.id, ...resourcePermissions.map(p => p.id)],
            involvedRoles: rolesWithoutResource.map(r => r.id),
            riskScore: 40,
            autoResolvable: true,
            suggestedResolution: `为角色添加必要的资源权限或移除孤立的字段权限`,
            detectedAt: new Date()
          });
        }
      }
    });

    return conflicts;
  };

  const detectScopeOverlaps = (permissions: Permission[]): PermissionConflict[] => {
    const conflicts: PermissionConflict[] = [];

    // 检测权限作用域重叠
    const permissionsByResource = new Map<string, Permission[]>();
    permissions.forEach(perm => {
      if (!permissionsByResource.has(perm.resource)) {
        permissionsByResource.set(perm.resource, []);
      }
      permissionsByResource.get(perm.resource)!.push(perm);
    });

    permissionsByResource.forEach((perms, resource) => {
      // 检查全局权限和特定权限的重叠
      const globalPerms = perms.filter(p => p.scope === 'global');
      const specificPerms = perms.filter(p => p.scope !== 'global');

      if (globalPerms.length > 0 && specificPerms.length > 0) {
        globalPerms.forEach(globalPerm => {
          specificPerms.forEach(specificPerm => {
            if (globalPerm.action === specificPerm.action || globalPerm.action === '*') {
              conflicts.push({
                id: `scope_overlap_${globalPerm.id}_${specificPerm.id}`,
                type: 'scope_overlap',
                severity: 'low',
                description: `全局权限"${globalPerm.name}"与特定权限"${specificPerm.name}"存在作用域重叠`,
                involvedPermissions: [globalPerm.id, specificPerm.id],
                riskScore: 20,
                autoResolvable: true,
                suggestedResolution: `考虑合并重叠权限或明确权限边界`,
                detectedAt: new Date()
              });
            }
          });
        });
      }
    });

    return conflicts;
  };

  const generateRiskAnalysis = (
    permissions: Permission[], 
    roles: Role[], 
    users: User[], 
    conflicts: PermissionConflict[]
  ): PermissionRiskAnalysis[] => {
    return permissions.map(permission => {
      const riskFactors = assessPermissionRisk(permission);
      const riskScore = riskFactors.reduce((sum, factor) => sum + factor.weight, 0);
      
      const assignedRoles = roles.filter(role => role.permissions.includes(permission.id));
      const affectedUsers = getUsersByRoles(assignedRoles, users);
      
      const permissionConflicts = conflicts.filter(c => 
        c.involvedPermissions.includes(permission.id)
      );

      const usageFrequency = calculateUsageFrequency(permission, assignedRoles, users);

      return {
        permissionId: permission.id,
        riskScore,
        riskFactors,
        usageMetrics: {
          assignedRoles: assignedRoles.length,
          affectedUsers: affectedUsers.length,
          lastUsed: permission.lastUsed ? new Date(permission.lastUsed) : null,
          usageFrequency
        },
        recommendations: generatePermissionRecommendations(permission, riskScore, permissionConflicts, usageFrequency)
      };
    });
  };

  const generatePermissionMatrix = (permissions: Permission[], conflicts: PermissionConflict[]): PermissionMatrix[] => {
    return permissions.map(permission => {
      const permissionConflicts = conflicts
        .filter(c => c.involvedPermissions.includes(permission.id))
        .flatMap(c => c.involvedPermissions.filter(id => id !== permission.id));

      const dependencies = findPermissionDependencies(permission, permissions);
      const redundancies = findPermissionRedundancies(permission, permissions);

      return {
        permissionId: permission.id,
        conflicts: [...new Set(permissionConflicts)],
        dependencies,
        redundancies
      };
    });
  };

  const calculateAnalysisMetrics = (conflicts: PermissionConflict[], riskAnalysis: PermissionRiskAnalysis[]) => {
    const totalConflicts = conflicts.length;
    const severityDistribution = {
      critical: conflicts.filter(c => c.severity === 'critical').length,
      high: conflicts.filter(c => c.severity === 'high').length,
      medium: conflicts.filter(c => c.severity === 'medium').length,
      low: conflicts.filter(c => c.severity === 'low').length,
    };

    const typeDistribution = {
      logical_conflict: conflicts.filter(c => c.type === 'logical_conflict').length,
      security_risk: conflicts.filter(c => c.type === 'security_risk').length,
      over_privilege: conflicts.filter(c => c.type === 'over_privilege').length,
      dependency_violation: conflicts.filter(c => c.type === 'dependency_violation').length,
      scope_overlap: conflicts.filter(c => c.type === 'scope_overlap').length,
    };

    const avgRiskScore = riskAnalysis.reduce((sum, analysis) => sum + analysis.riskScore, 0) / riskAnalysis.length;
    const highRiskPermissions = riskAnalysis.filter(analysis => analysis.riskScore > 75).length;
    const autoResolvableConflicts = conflicts.filter(c => c.autoResolvable).length;

    return {
      totalConflicts,
      severityDistribution,
      typeDistribution,
      avgRiskScore: Math.round(avgRiskScore),
      highRiskPermissions,
      autoResolvableConflicts,
      resolutionRate: autoResolvableConflicts / Math.max(totalConflicts, 1) * 100
    };
  };

  // Helper functions
  const isConflictingActions = (action1: string, action2: string): boolean => {
    const conflictPairs = [
      ['read_only', 'write'],
      ['read_only', 'delete'],
      ['create', 'delete_all'],
      ['view_public', 'view_private']
    ];

    return conflictPairs.some(([a1, a2]) => 
      (action1.includes(a1) && action2.includes(a2)) ||
      (action1.includes(a2) && action2.includes(a1))
    );
  };

  const calculateConflictSeverity = (perm1: Permission, perm2: Permission, roles: Role[]): 'critical' | 'high' | 'medium' | 'low' => {
    const riskLevel1 = perm1.risk || 'low';
    const riskLevel2 = perm2.risk || 'low';
    const roleCount = roles.length;

    if ((riskLevel1 === 'critical' || riskLevel2 === 'critical') && roleCount > 0) return 'critical';
    if ((riskLevel1 === 'high' || riskLevel2 === 'high') && roleCount > 2) return 'high';
    if (roleCount > 1) return 'medium';
    return 'low';
  };

  const getUsersByRoles = (roles: Role[], users: User[]): string[] => {
    const userIds = new Set<string>();
    roles.forEach(role => {
      users.filter(user => user.roles.includes(role.id)).forEach(user => userIds.add(user.id));
    });
    return Array.from(userIds);
  };

  const calculateRiskScore = (perm1: Permission, perm2: Permission, roles: Role[], users: User[]): number => {
    const baseScore = 30;
    const riskMultiplier = {
      'critical': 3,
      'high': 2,
      'medium': 1.5,
      'low': 1
    };

    const multiplier1 = riskMultiplier[perm1.risk as keyof typeof riskMultiplier] || 1;
    const multiplier2 = riskMultiplier[perm2.risk as keyof typeof riskMultiplier] || 1;
    const userImpact = getUsersByRoles(roles, users).length * 5;

    return Math.min(baseScore * multiplier1 * multiplier2 + userImpact, 100);
  };

  const canAutoResolve = (perm1: Permission, perm2: Permission): boolean => {
    return perm1.scope !== 'global' && perm2.scope !== 'global' && 
           !perm1.isSystemPermission && !perm2.isSystemPermission;
  };

  const generateResolutionSuggestion = (perm1: Permission, perm2: Permission, conflictType: string): string => {
    switch (conflictType) {
      case 'logical_conflict':
        return `考虑修改权限作用域或创建更具体的权限来解决"${perm1.name}"和"${perm2.name}"之间的冲突`;
      case 'security_risk':
        return `限制高风险权限的分配，添加额外的验证步骤`;
      default:
        return '需要手动审查并解决此冲突';
    }
  };

  const assessPermissionRisk = (permission: Permission): RiskFactor[] => {
    const factors: RiskFactor[] = [];

    // 检查权限风险级别
    if (permission.risk === 'critical') {
      factors.push({
        type: 'high_privilege',
        weight: 40,
        description: '权限被标记为关键风险级别'
      });
    }

    // 检查是否涉及敏感数据
    if (permission.name.toLowerCase().includes('pii') || 
        permission.description.toLowerCase().includes('sensitive')) {
      factors.push({
        type: 'sensitive_data',
        weight: 30,
        description: '权限涉及敏感数据访问'
      });
    }

    // 检查管理员权限
    if (permission.name.toLowerCase().includes('admin') || 
        permission.action === '*' || 
        permission.resource === '*') {
      factors.push({
        type: 'admin_access',
        weight: 35,
        description: '权限提供管理员级别访问'
      });
    }

    // 检查外部访问
    if (permission.scope === 'global') {
      factors.push({
        type: 'external_access',
        weight: 20,
        description: '权限允许全局范围访问'
      });
    }

    // 检查是否已弃用
    if (permission.isDeprecated) {
      factors.push({
        type: 'deprecated',
        weight: 25,
        description: '权限已被标记为弃用'
      });
    }

    return factors;
  };

  const calculateUsageFrequency = (permission: Permission, roles: Role[], users: User[]): 'high' | 'medium' | 'low' | 'unused' => {
    const userCount = getUsersByRoles(roles, users).length;
    const roleCount = roles.length;

    if (userCount === 0) return 'unused';
    if (userCount > 10 || roleCount > 5) return 'high';
    if (userCount > 3 || roleCount > 2) return 'medium';
    return 'low';
  };

  const generatePermissionRecommendations = (
    permission: Permission, 
    riskScore: number, 
    conflicts: PermissionConflict[], 
    usageFrequency: string
  ): string[] => {
    const recommendations: string[] = [];

    if (riskScore > 75) {
      recommendations.push('考虑限制此权限的分配范围');
    }

    if (conflicts.length > 0) {
      recommendations.push(`解决 ${conflicts.length} 个相关冲突`);
    }

    if (usageFrequency === 'unused') {
      recommendations.push('考虑移除未使用的权限');
    }

    if (permission.isDeprecated) {
      recommendations.push('替换已弃用的权限');
    }

    return recommendations;
  };

  const findPermissionDependencies = (permission: Permission, allPermissions: Permission[]): string[] => {
    // 简化的依赖检测逻辑
    if (permission.scope === 'field') {
      return allPermissions
        .filter(p => p.resource === permission.resource && p.scope === 'resource')
        .map(p => p.id);
    }
    return [];
  };

  const findPermissionRedundancies = (permission: Permission, allPermissions: Permission[]): string[] => {
    // 简化的冗余检测逻辑
    return allPermissions
      .filter(p => 
        p.id !== permission.id &&
        p.resource === permission.resource &&
        p.action === permission.action &&
        p.scope === 'global' &&
        permission.scope !== 'global'
      )
      .map(p => p.id);
  };

  const filteredConflicts = conflicts.filter(conflict => {
    const matchesSeverity = filterSeverity === 'all' || conflict.severity === filterSeverity;
    const matchesSearch = searchTerm === '' || 
      conflict.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conflict.involvedPermissions.some(permId => {
        const permission = permissions.find(p => p.id === permId);
        return permission?.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    
    return matchesSeverity && matchesSearch;
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
      case 'logical_conflict':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'security_risk':
        return <Shield className="h-4 w-4 text-orange-600" />;
      case 'over_privilege':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'dependency_violation':
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      case 'scope_overlap':
        return <Eye className="h-4 w-4 text-purple-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleAutoResolve = async (conflict: PermissionConflict) => {
    const resolution: PermissionConflictResolution = {
      type: 'modify_scope',
      targetPermissions: conflict.involvedPermissions,
      details: { autoGenerated: true },
      reason: '系统自动解决方案'
    };

    await onResolveConflict(conflict.id, resolution);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              权限冲突检测与分析
            </CardTitle>
            <CardDescription>
              检测权限间的逻辑冲突、安全风险和依赖关系问题
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
              {isAnalyzing ? '���析中' : '刷新'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">分析概览</TabsTrigger>
            <TabsTrigger value="conflicts">
              冲突列表
              {conflicts.length > 0 && (
                <Badge className="ml-1 bg-red-100 text-red-800">
                  {conflicts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="risk">风险评估</TabsTrigger>
            <TabsTrigger value="matrix">权限矩阵</TabsTrigger>
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
                        <p className="text-sm font-medium text-gray-600">高风险权限</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {analysisMetrics?.highRiskPermissions || 0}
                        </p>
                      </div>
                      <Shield className="h-8 w-8 text-yellow-600" />
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
              </div>

              {/* 冲突列表 */}
              <div className="space-y-3">
                {filteredConflicts.map((conflict) => (
                  <Card
                    key={conflict.id}
                    className={cn("border", getConflictSeverityColor(conflict.severity))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
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
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-2">
                            {conflict.description}
                          </p>
                          
                          <div className="text-xs text-gray-500">
                            涉及权限: {conflict.involvedPermissions.map(permId => {
                              const permission = permissions.find(p => p.id === permId);
                              return permission?.name;
                            }).filter(Boolean).join(', ')}
                          </div>

                          {conflict.affectedUsers && conflict.affectedUsers.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              影响用户: {conflict.affectedUsers.length} 个
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>冲突详情</DialogTitle>
                                <DialogDescription>
                                  {conflict.description}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">建议解决方案</h4>
                                  <p className="text-sm text-gray-600">{conflict.suggestedResolution}</p>
                                </div>
                                {conflict.autoResolvable && (
                                  <Alert>
                                    <Zap className="h-4 w-4" />
                                    <AlertDescription>
                                      此冲突可以自动解决
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          {conflict.autoResolvable && (
                            <Button 
                              size="sm" 
                              onClick={() => handleAutoResolve(conflict)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Zap className="h-4 w-4 mr-1" />
                              自动解决
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredConflicts.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      没有发现权限冲突
                    </h3>
                    <p className="text-gray-500">
                      所有权限配置都符合安全规则
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="risk">
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>权限名称</TableHead>
                    <TableHead>风险评分</TableHead>
                    <TableHead>分配角色</TableHead>
                    <TableHead>影响用户</TableHead>
                    <TableHead>使用频率</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riskAnalysis
                    .sort((a, b) => b.riskScore - a.riskScore)
                    .slice(0, 20)
                    .map((analysis) => {
                      const permission = permissions.find(p => p.id === analysis.permissionId);
                      if (!permission) return null;

                      return (
                        <TableRow key={analysis.permissionId}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{permission.name}</div>
                              <div className="text-sm text-gray-500">{permission.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge className={
                                analysis.riskScore > 75 ? 'bg-red-100 text-red-800' :
                                analysis.riskScore > 50 ? 'bg-orange-100 text-orange-800' :
                                analysis.riskScore > 25 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {analysis.riskScore}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{analysis.usageMetrics.assignedRoles}</TableCell>
                          <TableCell>{analysis.usageMetrics.affectedUsers}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {analysis.usageMetrics.usageFrequency}
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
            </div>
          </TabsContent>

          <TabsContent value="matrix">
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>权限名称</TableHead>
                    <TableHead>冲突权限</TableHead>
                    <TableHead>依赖权限</TableHead>
                    <TableHead>冗余权限</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissionMatrix.map((matrix) => {
                    const permission = permissions.find(p => p.id === matrix.permissionId);
                    if (!permission) return null;

                    return (
                      <TableRow key={matrix.permissionId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{permission.name}</div>
                            <div className="text-sm text-gray-500">{permission.category}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {matrix.conflicts.map(conflictId => {
                              const conflictPerm = permissions.find(p => p.id === conflictId);
                              return conflictPerm ? (
                                <Badge key={conflictId} variant="destructive" className="text-xs">
                                  {conflictPerm.name}
                                </Badge>
                              ) : null;
                            })}
                            {matrix.conflicts.length === 0 && (
                              <span className="text-sm text-gray-400">无</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {matrix.dependencies.map(depId => {
                              const depPerm = permissions.find(p => p.id === depId);
                              return depPerm ? (
                                <Badge key={depId} variant="secondary" className="text-xs">
                                  {depPerm.name}
                                </Badge>
                              ) : null;
                            })}
                            {matrix.dependencies.length === 0 && (
                              <span className="text-sm text-gray-400">无</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {matrix.redundancies.map(redId => {
                              const redPerm = permissions.find(p => p.id === redId);
                              return redPerm ? (
                                <Badge key={redId} variant="outline" className="text-xs">
                                  {redPerm.name}
                                </Badge>
                              ) : null;
                            })}
                            {matrix.redundancies.length === 0 && (
                              <span className="text-sm text-gray-400">无</span>
                            )}
                          </div>
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
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PermissionConflictDetector;
