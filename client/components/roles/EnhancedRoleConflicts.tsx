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
  AlertTriangle,
  GitBranch,
  Users,
  Shield,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  Zap,
  ArrowRight,
  Circle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { RoleConflict, Role, User } from "@shared/iam";
import { cn } from "@/lib/utils";

interface EnhancedRoleConflictsProps {
  conflicts: RoleConflict[];
  roles: Role[];
  users: User[];
  onResolveConflict: (conflictId: string, resolution: ConflictResolution) => Promise<void>;
  onRefreshConflicts: () => Promise<void>;
  isLoading?: boolean;
}

interface ConflictResolution {
  type: 'auto' | 'manual' | 'ignore';
  actions: ConflictAction[];
  reason?: string;
}

interface ConflictAction {
  type: 'remove_role' | 'modify_hierarchy' | 'add_exception' | 'merge_roles';
  targetId: string;
  details: Record<string, any>;
}

interface CircularDependency {
  id: string;
  path: string[];
  severity: 'critical' | 'high' | 'medium';
  description: string;
}

interface HierarchyConflict {
  id: string;
  type: 'inheritance_loop' | 'level_violation' | 'permission_escalation';
  involvedRoles: string[];
  severity: 'critical' | 'high' | 'medium';
  description: string;
  suggestedFix: string;
}

export const EnhancedRoleConflicts: React.FC<EnhancedRoleConflictsProps> = ({
  conflicts,
  roles,
  users,
  onResolveConflict,
  onRefreshConflicts,
  isLoading = false,
}) => {
  const [selectedConflict, setSelectedConflict] = useState<RoleConflict | null>(null);
  const [circularDependencies, setCircularDependencies] = useState<CircularDependency[]>([]);
  const [hierarchyConflicts, setHierarchyConflicts] = useState<HierarchyConflict[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  useEffect(() => {
    analyzeRoleStructure();
  }, [roles, conflicts]);

  const analyzeRoleStructure = async () => {
    setIsAnalyzing(true);
    try {
      // 检测循环依赖
      const circular = detectCircularDependencies(roles);
      setCircularDependencies(circular);

      // 检测层级冲突
      const hierarchy = detectHierarchyConflicts(roles);
      setHierarchyConflicts(hierarchy);

      // 分析冲突统��
      const analysis = analyzeConflictPatterns(conflicts, roles, users);
      setAnalysisResults(analysis);
    } catch (error) {
      console.error('Role structure analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const detectCircularDependencies = (roles: Role[]): CircularDependency[] => {
    const dependencies: CircularDependency[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (roleId: string, path: string[]): void => {
      if (recursionStack.has(roleId)) {
        // 找到循环依赖
        const cycleStart = path.indexOf(roleId);
        const cyclePath = path.slice(cycleStart);
        cyclePath.push(roleId);

        dependencies.push({
          id: `circular_${Date.now()}_${roleId}`,
          path: cyclePath,
          severity: cyclePath.length > 4 ? 'critical' : 'high',
          description: `检测到循环依赖：${cyclePath.map(id => roles.find(r => r.id === id)?.name || id).join(' → ')}`
        });
        return;
      }

      if (visited.has(roleId)) return;

      visited.add(roleId);
      recursionStack.add(roleId);

      const role = roles.find(r => r.id === roleId);
      if (role?.parentRole) {
        dfs(role.parentRole, [...path, roleId]);
      }

      // 检查子角色
      if (role?.childRoles) {
        role.childRoles.forEach(childId => {
          dfs(childId, [...path, roleId]);
        });
      }

      recursionStack.delete(roleId);
    };

    roles.forEach(role => {
      if (!visited.has(role.id)) {
        dfs(role.id, []);
      }
    });

    return dependencies;
  };

  const detectHierarchyConflicts = (roles: Role[]): HierarchyConflict[] => {
    const conflicts: HierarchyConflict[] = [];

    roles.forEach(role => {
      // 检查级别违规
      if (role.parentRole) {
        const parent = roles.find(r => r.id === role.parentRole);
        if (parent && role.level <= parent.level) {
          conflicts.push({
            id: `level_violation_${role.id}`,
            type: 'level_violation',
            involvedRoles: [role.id, parent.id],
            severity: 'high',
            description: `角色"${role.name}"的级别(${role.level})不应高于或等于其父角色"${parent.name}"的级别(${parent.level})`,
            suggestedFix: `调整"${role.name}"的级别为${parent.level + 1}或更高`
          });
        }
      }

      // 检查权限升级冲突
      if (role.parentRole) {
        const parent = roles.find(r => r.id === role.parentRole);
        if (parent) {
          const childExtraPermissions = role.permissions.filter(
            perm => !parent.permissions.includes(perm) && 
                   !(parent.inheritedPermissions || []).includes(perm)
          );
          
          if (childExtraPermissions.length > parent.permissions.length) {
            conflicts.push({
              id: `permission_escalation_${role.id}`,
              type: 'permission_escalation',
              involvedRoles: [role.id, parent.id],
              severity: 'medium',
              description: `子角色"${role.name}"拥有比父角色"${parent.name}"更多的权限，可能违反最小权限原则`,
              suggestedFix: `审查"${role.name}"的权限分配，确保符合层级结构`
            });
          }
        }
      }
    });

    return conflicts;
  };

  const analyzeConflictPatterns = (conflicts: RoleConflict[], roles: Role[], users: User[]) => {
    const totalConflicts = conflicts.length;
    const severityDistribution = {
      critical: conflicts.filter(c => c.severity === 'critical').length,
      high: conflicts.filter(c => c.severity === 'high').length,
      medium: conflicts.filter(c => c.severity === 'medium').length,
      low: conflicts.filter(c => c.severity === 'low').length,
    };

    const typeDistribution = {
      permission_overlap: conflicts.filter(c => c.type === 'permission_overlap').length,
      hierarchy_violation: conflicts.filter(c => c.type === 'hierarchy_violation').length,
      separation_of_duties: conflicts.filter(c => c.type === 'separation_of_duties').length,
    };

    const affectedUsers = new Set();
    conflicts.forEach(conflict => {
      conflict.roles.forEach(roleId => {
        users.filter(u => u.roles.includes(roleId)).forEach(u => affectedUsers.add(u.id));
      });
    });

    const riskScore = calculateRiskScore(severityDistribution, totalConflicts, affectedUsers.size);

    return {
      totalConflicts,
      severityDistribution,
      typeDistribution,
      affectedUsersCount: affectedUsers.size,
      riskScore,
      recommendations: generateRecommendations(severityDistribution, typeDistribution)
    };
  };

  const calculateRiskScore = (severity: any, totalConflicts: number, affectedUsers: number): number => {
    const weights = { critical: 40, high: 25, medium: 15, low: 5 };
    const severityScore = Object.entries(severity).reduce(
      (score, [level, count]) => score + (weights[level as keyof typeof weights] * (count as number)), 0
    );
    
    const userImpactMultiplier = Math.min(1 + (affectedUsers * 0.1), 2);
    return Math.min(Math.round(severityScore * userImpactMultiplier), 100);
  };

  const generateRecommendations = (severity: any, types: any): string[] => {
    const recommendations: string[] = [];

    if (severity.critical > 0) {
      recommendations.push(`立即解决 ${severity.critical} 个严重冲突，这些可能导致安全漏洞`);
    }

    if (types.hierarchy_violation > 0) {
      recommendations.push(`检查角色层级结构，修复 ${types.hierarchy_violation} 个层级违规`);
    }

    if (types.separation_of_duties > 0) {
      recommendations.push(`审查职责分离策略，处理 ${types.separation_of_duties} 个冲突`);
    }

    if (severity.high + severity.medium > 10) {
      recommendations.push('考虑重新设计角色架构以减少系统性冲突');
    }

    return recommendations;
  };

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

  const getConflictIcon = (type: string, severity: string) => {
    const iconClass = severity === 'critical' ? 'text-red-600' : 
                     severity === 'high' ? 'text-orange-600' : 
                     severity === 'medium' ? 'text-yellow-600' : 'text-blue-600';

    switch (type) {
      case 'permission_overlap':
        return <Shield className={`h-4 w-4 ${iconClass}`} />;
      case 'hierarchy_violation':
        return <GitBranch className={`h-4 w-4 ${iconClass}`} />;
      case 'separation_of_duties':
        return <Users className={`h-4 w-4 ${iconClass}`} />;
      default:
        return <AlertTriangle className={`h-4 w-4 ${iconClass}`} />;
    }
  };

  const handleAutoResolve = async (conflict: RoleConflict) => {
    const resolution: ConflictResolution = {
      type: 'auto',
      actions: generateAutoResolutionActions(conflict),
      reason: '系统自动解决方案'
    };

    await onResolveConflict(conflict.id, resolution);
  };

  const generateAutoResolutionActions = (conflict: RoleConflict): ConflictAction[] => {
    switch (conflict.type) {
      case 'hierarchy_violation':
        return [{
          type: 'modify_hierarchy',
          targetId: conflict.roles[0],
          details: { action: 'adjust_level', newLevel: 'auto' }
        }];
      case 'permission_overlap':
        return [{
          type: 'remove_role',
          targetId: conflict.roles[1],
          details: { reason: 'redundant_permissions' }
        }];
      default:
        return [{
          type: 'add_exception',
          targetId: conflict.id,
          details: { temporary: true, reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        }];
    }
  };

  const renderConflictDetails = (conflict: RoleConflict) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {getConflictIcon(conflict.type, conflict.severity)}
        <span className="font-medium">{conflict.type.replace('_', ' ')}</span>
        <Badge className={getConflictSeverityColor(conflict.severity)}>
          {conflict.severity}
        </Badge>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">描述</h4>
        <p className="text-sm text-gray-600">{conflict.description}</p>
      </div>

      <div>
        <h4 className="font-medium mb-2">涉及角色</h4>
        <div className="flex flex-wrap gap-2">
          {conflict.roles.map(roleId => {
            const role = roles.find(r => r.id === roleId);
            return role ? (
              <Badge key={roleId} variant="outline">{role.name}</Badge>
            ) : null;
          })}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">建议解决方案</h4>
        <p className="text-sm text-gray-600">{conflict.suggestion}</p>
      </div>

      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={() => handleAutoResolve(conflict)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Zap className="mr-1 h-3 w-3" />
          自动解决
        </Button>
        <Button variant="outline" size="sm">
          <Eye className="mr-1 h-3 w-3" />
          详细分析
        </Button>
      </div>
    </div>
  );

  const renderCircularDependencies = () => (
    <div className="space-y-4">
      {circularDependencies.map(dependency => (
        <Card key={dependency.id} className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="h-4 w-4 text-red-600" />
                  <Badge className="bg-red-100 text-red-800">
                    {dependency.severity}
                  </Badge>
                  <span className="text-sm font-medium">循环依赖</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{dependency.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">依赖路径：</span>
                  <div className="flex items-center gap-1">
                    {dependency.path.map((roleId, index) => (
                      <React.Fragment key={roleId}>
                        <Badge variant="outline" className="text-xs">
                          {roles.find(r => r.id === roleId)?.name || roleId}
                        </Badge>
                        {index < dependency.path.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-red-600">
                修复循环
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {circularDependencies.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <p>未检测到循环依赖</p>
        </div>
      )}
    </div>
  );

  const renderHierarchyConflicts = () => (
    <div className="space-y-4">
      {hierarchyConflicts.map(conflict => (
        <Card key={conflict.id} className={cn(
          "border",
          conflict.severity === 'critical' ? 'border-red-200 bg-red-50' :
          conflict.severity === 'high' ? 'border-orange-200 bg-orange-50' :
          'border-yellow-200 bg-yellow-50'
        )}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {conflict.type === 'level_violation' ? (
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  ) : conflict.type === 'permission_escalation' ? (
                    <Shield className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <GitBranch className="h-4 w-4 text-red-600" />
                  )}
                  <Badge className={getConflictSeverityColor(conflict.severity)}>
                    {conflict.severity}
                  </Badge>
                  <span className="text-sm font-medium">
                    {conflict.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{conflict.description}</p>
                <p className="text-xs text-gray-500">{conflict.suggestedFix}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">涉及角色：</span>
                  <div className="flex gap-1">
                    {conflict.involvedRoles.map(roleId => (
                      <Badge key={roleId} variant="outline" className="text-xs">
                        {roles.find(r => r.id === roleId)?.name || roleId}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                修复层级
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {hierarchyConflicts.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <p>层级结构正常</p>
        </div>
      )}
    </div>
  );

  const renderAnalysisOverview = () => (
    <div className="space-y-6">
      {/* 风险评分 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            角色冲突风险评分
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">总体风险评分</span>
              <div className="flex items-center gap-2">
                <Progress 
                  value={analysisResults?.riskScore || 0} 
                  className="w-32" 
                />
                <Badge 
                  className={
                    (analysisResults?.riskScore || 0) > 75 ? 'bg-red-100 text-red-800' :
                    (analysisResults?.riskScore || 0) > 50 ? 'bg-orange-100 text-orange-800' :
                    (analysisResults?.riskScore || 0) > 25 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }
                >
                  {analysisResults?.riskScore || 0}/100
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {analysisResults?.severityDistribution.critical || 0}
                </div>
                <div className="text-xs text-gray-500">严重</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {analysisResults?.severityDistribution.high || 0}
                </div>
                <div className="text-xs text-gray-500">高</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {analysisResults?.severityDistribution.medium || 0}
                </div>
                <div className="text-xs text-gray-500">中</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analysisResults?.severityDistribution.low || 0}
                </div>
                <div className="text-xs text-gray-500">低</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 建议 */}
      {analysisResults?.recommendations && analysisResults.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>系统建议</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysisResults.recommendations.map((recommendation: string, index: number) => (
                <Alert key={index}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{recommendation}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              角色冲突检测与管理
            </CardTitle>
            <CardDescription>
              检测循环依赖、层级冲突和权限重叠等问题
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefreshConflicts}
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="conflicts">
              冲突列表
              {conflicts.filter(c => !c.resolved).length > 0 && (
                <Badge className="ml-1 bg-red-100 text-red-800">
                  {conflicts.filter(c => !c.resolved).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="circular">
              循环依赖
              {circularDependencies.length > 0 && (
                <Badge className="ml-1 bg-orange-100 text-orange-800">
                  {circularDependencies.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="hierarchy">
              层级冲突
              {hierarchyConflicts.length > 0 && (
                <Badge className="ml-1 bg-yellow-100 text-yellow-800">
                  {hierarchyConflicts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {renderAnalysisOverview()}
          </TabsContent>

          <TabsContent value="conflicts">
            <div className="space-y-4">
              {conflicts.filter(c => !c.resolved).map((conflict) => (
                <Card
                  key={conflict.id}
                  className={cn("border", getConflictSeverityColor(conflict.severity))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {renderConflictDetails(conflict)}
                      </div>
                      <div className="flex flex-col gap-2">
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
                            {renderConflictDetails(conflict)}
                          </DialogContent>
                        </Dialog>
                        
                        {conflict.resolved ? (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            已解决
                          </Badge>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAutoResolve(conflict)}
                          >
                            解决
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {conflicts.filter(c => !c.resolved).length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    没有发现角色冲突
                  </h3>
                  <p className="text-gray-500">
                    所有角色分配都符合系统规则
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="circular">
            {renderCircularDependencies()}
          </TabsContent>

          <TabsContent value="hierarchy">
            {renderHierarchyConflicts()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedRoleConflicts;
