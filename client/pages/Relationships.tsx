/**
 * 关联关系管理页面
 * 展示User、Role、Permission和ABAC Policy之间的关联关系
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Shield,
  Key,
  FileText,
  Network,
  GitBranch,
  Eye,
  Edit,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Settings,
  BarChart3
} from 'lucide-react';
import { User, Role, Permission, ABACPolicy } from '../../shared/iam';
import { useUsers } from '../hooks/useUsers';
import { useRoles } from '../hooks/useRoles';
import { usePermissions } from '../hooks/usePermissions';
import { usePolicies } from '../hooks/usePolicies';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import UserRoleManager from '../components/relationships/UserRoleManager';
import RolePermissionManager from '../components/relationships/RolePermissionManager';
import PolicyRelationshipViewer from '../components/relationships/PolicyRelationshipViewer';
import RelationshipGraph from '../components/relationships/RelationshipGraph';

// 关联关系接口定义
interface UserRoleRelation {
  userId: string;
  userName: string;
  roleId: string;
  roleName: string;
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
  expiresAt?: string;
}

interface RolePermissionRelation {
  roleId: string;
  roleName: string;
  permissionId: string;
  permissionName: string;
  inherited: boolean;
  source: string;
  effectiveScope: string;
}

interface PolicyRelation {
  policyId: string;
  policyName: string;
  effect: 'allow' | 'deny';
  applicableRoles: string[];
  applicableUsers: string[];
  applicableResources: string[];
  priority: number;
  status: string;
}

interface RelationshipStats {
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
  totalPolicies: number;
  userRoleRelations: number;
  rolePermissionRelations: number;
  activePolicyRelations: number;
  orphanedEntities: {
    users: number;
    roles: number;
    permissions: number;
    policies: number;
  };
}

export default function Relationships() {
  const [activeTab, setActiveTab] = useState('overview');
  const [relationshipStats, setRelationshipStats] = useState<RelationshipStats | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { users, loading: usersLoading } = useUsers();
  const { roles, loading: rolesLoading } = useRoles();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const { policies, loading: policiesLoading } = usePolicies();

  const isLoading = usersLoading || rolesLoading || permissionsLoading || policiesLoading;

  // 计算关联关系统计
  useEffect(() => {
    if (users && roles && permissions && policies) {
      calculateRelationshipStats();
      buildUserRoleRelations();
      buildRolePermissionRelations();
      buildPolicyRelations();
    }
  }, [users, roles, permissions, policies]);

  const calculateRelationshipStats = () => {
    if (!users || !roles || !permissions || !policies) return;

    // 计算User-Role关联数量
    const userRoleCount = users.reduce((count, user) => count + user.roles.length, 0);

    // 计算Role-Permission关联数量
    const rolePermissionCount = roles.reduce((count, role) => {
      return count + role.permissions.length + (role.inheritedPermissions?.length || 0);
    }, 0);

    // 计算活跃策略关联数量
    const activePolicyCount = policies.filter(p => p.status === 'active').length;

    // 计算孤立实体
    const usersWithoutRoles = users.filter(u => u.roles.length === 0).length;
    const rolesWithoutPermissions = roles.filter(r => r.permissions.length === 0).length;
    const unusedPermissions = permissions.filter(p => 
      !roles.some(r => r.permissions.includes(p.id) || r.inheritedPermissions?.includes(p.id))
    ).length;
    const inactivePolicies = policies.filter(p => p.status !== 'active').length;

    setRelationshipStats({
      totalUsers: users.length,
      totalRoles: roles.length,
      totalPermissions: permissions.length,
      totalPolicies: policies.length,
      userRoleRelations: userRoleCount,
      rolePermissionRelations: rolePermissionCount,
      activePolicyRelations: activePolicyCount,
      orphanedEntities: {
        users: usersWithoutRoles,
        roles: rolesWithoutPermissions,
        permissions: unusedPermissions,
        policies: inactivePolicies
      }
    });
  };

  const buildUserRoleRelations = () => {
    if (!users || !roles) return;

    const relations: UserRoleRelation[] = [];
    
    users.forEach(user => {
      user.roles.forEach(roleId => {
        const role = roles.find(r => r.id === roleId);
        if (role) {
          relations.push({
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            roleId: role.id,
            roleName: role.name,
            assignedAt: user.createdAt,
            assignedBy: 'System',
            isActive: user.status === 'active' && role.status === 'active',
            expiresAt: role.validUntil
          });
        }
      });
    });

    setUserRoleRelations(relations);
  };

  const buildRolePermissionRelations = () => {
    if (!roles || !permissions) return;

    const relations: RolePermissionRelation[] = [];
    
    roles.forEach(role => {
      // 直接权限
      role.permissions.forEach(permissionId => {
        const permission = permissions.find(p => p.id === permissionId);
        if (permission) {
          relations.push({
            roleId: role.id,
            roleName: role.name,
            permissionId: permission.id,
            permissionName: permission.name,
            inherited: false,
            source: 'Direct',
            effectiveScope: permission.scope
          });
        }
      });

      // 继承权限
      role.inheritedPermissions?.forEach(permissionId => {
        const permission = permissions.find(p => p.id === permissionId);
        if (permission) {
          relations.push({
            roleId: role.id,
            roleName: role.name,
            permissionId: permission.id,
            permissionName: permission.name,
            inherited: true,
            source: role.parentRole || 'Inherited',
            effectiveScope: permission.scope
          });
        }
      });
    });

    setRolePermissionRelations(relations);
  };

  const buildPolicyRelations = () => {
    if (!policies || !roles || !users) return;

    const relations: PolicyRelation[] = [];
    
    policies.forEach(policy => {
      // 分析策略适用的角色和用户
      const applicableRoles: string[] = [];
      const applicableUsers: string[] = [];
      const applicableResources: string[] = [];

      // 从策略规则中提取适用范围
      policy.rules.forEach(rule => {
        // 分析主体条件以确定适用角色
        rule.subject.forEach(condition => {
          if (condition.attribute === 'role' || condition.attribute === 'roles') {
            if (condition.operator === 'equals' && typeof condition.value === 'string') {
              applicableRoles.push(condition.value);
            } else if (condition.operator === 'in' && Array.isArray(condition.value)) {
              applicableRoles.push(...condition.value);
            }
          }
        });

        // 分析资源条件
        rule.resource.forEach(condition => {
          if (condition.attribute === 'type' || condition.attribute === 'name') {
            applicableResources.push(String(condition.value));
          }
        });
      });

      relations.push({
        policyId: policy.id,
        policyName: policy.name,
        effect: policy.effect,
        applicableRoles: [...new Set(applicableRoles)],
        applicableUsers: [...new Set(applicableUsers)],
        applicableResources: [...new Set(applicableResources)],
        priority: policy.priority,
        status: policy.status
      });
    });

    setPolicyRelations(relations);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relationshipStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{relationshipStats?.userRoleRelations || 0} 角色关联
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总角色数</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relationshipStats?.totalRoles || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{relationshipStats?.rolePermissionRelations || 0} 权限关联
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总权限数</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relationshipStats?.totalPermissions || 0}</div>
            <p className="text-xs text-muted-foreground">
              涵盖多个资源类型
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃策略数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relationshipStats?.activePolicyRelations || 0}</div>
            <p className="text-xs text-muted-foreground">
              / {relationshipStats?.totalPolicies || 0} 总策略
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 关联关系健康状况 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              关联关系健康度
            </CardTitle>
            <CardDescription>
              检查实体间的关联关系完整性
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">用户-角色关联</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{relationshipStats?.userRoleRelations || 0}</Badge>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">角色-权限关联</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{relationshipStats?.rolePermissionRelations || 0}</Badge>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">策略关联</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{relationshipStats?.activePolicyRelations || 0}</Badge>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              孤立实体检测
            </CardTitle>
            <CardDescription>
              发现未关联的实体，可能需要清理
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">无角色用户</span>
              <Badge variant={relationshipStats?.orphanedEntities.users ? "destructive" : "secondary"}>
                {relationshipStats?.orphanedEntities.users || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">无权限角色</span>
              <Badge variant={relationshipStats?.orphanedEntities.roles ? "destructive" : "secondary"}>
                {relationshipStats?.orphanedEntities.roles || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">未使用权限</span>
              <Badge variant={relationshipStats?.orphanedEntities.permissions ? "outline" : "secondary"}>
                {relationshipStats?.orphanedEntities.permissions || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">非活跃策略</span>
              <Badge variant={relationshipStats?.orphanedEntities.policies ? "outline" : "secondary"}>
                {relationshipStats?.orphanedEntities.policies || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUserRoleTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">用户-角色关联</h3>
          <p className="text-sm text-muted-foreground">
            管理用户与角色之间的分配关系
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          添加关联
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">用户</th>
                  <th className="px-6 py-3 text-left">角色</th>
                  <th className="px-6 py-3 text-left">分配时间</th>
                  <th className="px-6 py-3 text-left">状态</th>
                  <th className="px-6 py-3 text-left">过期时间</th>
                  <th className="px-6 py-3 text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                {userRoleRelations.map((relation, index) => (
                  <tr key={index} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{relation.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span>{relation.roleName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(relation.assignedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={relation.isActive ? "default" : "secondary"}>
                        {relation.isActive ? '活跃' : '非活跃'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {relation.expiresAt ? new Date(relation.expiresAt).toLocaleDateString() : '永久'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRolePermissionTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">角色-权限关联</h3>
          <p className="text-sm text-muted-foreground">
            管理角色与权限之间的分配关系
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          添加关联
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">角色</th>
                  <th className="px-6 py-3 text-left">权限</th>
                  <th className="px-6 py-3 text-left">类���</th>
                  <th className="px-6 py-3 text-left">来源</th>
                  <th className="px-6 py-3 text-left">作用域</th>
                  <th className="px-6 py-3 text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                {rolePermissionRelations.map((relation, index) => (
                  <tr key={index} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{relation.roleName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-gray-400" />
                        <span>{relation.permissionName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={relation.inherited ? "outline" : "default"}>
                        {relation.inherited ? '继承' : '直接'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {relation.source}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">
                        {relation.effectiveScope}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!relation.inherited && (
                          <>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPolicyRelationTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">策略关联关系</h3>
          <p className="text-sm text-muted-foreground">
            查看ABAC策略与用户、角色、资源的关联关系
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          策略配置
        </Button>
      </div>

      <div className="grid gap-4">
        {policyRelations.map((relation) => (
          <Card key={relation.policyId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {relation.policyName}
                  </CardTitle>
                  <CardDescription>
                    优先级: {relation.priority} | 状态: {relation.status}
                  </CardDescription>
                </div>
                <Badge variant={relation.effect === 'allow' ? 'default' : 'destructive'}>
                  {relation.effect === 'allow' ? '允许' : '拒绝'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    适用角色
                  </h4>
                  <div className="space-y-1">
                    {relation.applicableRoles.length > 0 ? (
                      relation.applicableRoles.map((roleId) => {
                        const role = roles?.find(r => r.id === roleId);
                        return (
                          <Badge key={roleId} variant="outline" className="mr-1 mb-1">
                            {role?.name || roleId}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-sm text-muted-foreground">全部角色</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    适用用户
                  </h4>
                  <div className="space-y-1">
                    {relation.applicableUsers.length > 0 ? (
                      relation.applicableUsers.map((userId) => (
                        <Badge key={userId} variant="outline" className="mr-1 mb-1">
                          {userId}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">基于角色确定</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    适用资源
                  </h4>
                  <div className="space-y-1">
                    {relation.applicableResources.length > 0 ? (
                      relation.applicableResources.map((resource) => (
                        <Badge key={resource} variant="outline" className="mr-1 mb-1">
                          {resource}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">所有资源</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>策略ID: {relation.policyId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    查看详情
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    编辑策略
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">加载关联关系数据...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">关联关系管理</h1>
          <p className="text-muted-foreground">
            查看和管理User、Role、Permission和ABAC Policy之间的关联关系
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              概览
            </TabsTrigger>
            <TabsTrigger value="user-role" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              用户-角色
            </TabsTrigger>
            <TabsTrigger value="role-permission" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              角色-权限
            </TabsTrigger>
            <TabsTrigger value="policy-relation" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              策略关联
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {renderOverviewTab()}
          </TabsContent>

          <TabsContent value="user-role">
            {renderUserRoleTab()}
          </TabsContent>

          <TabsContent value="role-permission">
            {renderRolePermissionTab()}
          </TabsContent>

          <TabsContent value="policy-relation">
            {renderPolicyRelationTab()}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
