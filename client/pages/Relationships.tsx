/**
 * 关联关系管理页面
 * 展示User、Role、Permission和ABAC Policy之间的关联关系
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  BarChart3,
} from "lucide-react";
import { User, Role, Permission, ABACPolicy } from "../../shared/iam";
import { useUsers } from "../hooks/useUsers";
import { useRoles } from "../hooks/useRoles";
import { usePermissions } from "../hooks/usePermissions";
import { usePolicies } from "../hooks/usePolicies";
import UserRoleManager from "../components/relationships/UserRoleManager";
import RolePermissionManager from "../components/relationships/RolePermissionManager";
import PolicyRelationshipViewer from "../components/relationships/PolicyRelationshipViewer";
import RelationshipGraph from "../components/relationships/RelationshipGraph";

// 关联关系统计接口

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
  const [activeTab, setActiveTab] = useState("overview");
  const [relationshipStats, setRelationshipStats] =
    useState<RelationshipStats | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { users, loading: usersLoading } = useUsers();
  const { roles, loading: rolesLoading } = useRoles();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const { policies, loading: policiesLoading } = usePolicies();

  const isLoading =
    usersLoading || rolesLoading || permissionsLoading || policiesLoading;

  // 计算关联关系统计
  useEffect(() => {
    if (users && roles && permissions && policies) {
      calculateRelationshipStats();
    }
  }, [users, roles, permissions, policies]);

  const calculateRelationshipStats = () => {
    if (!users || !roles || !permissions || !policies) return;

    // 计算User-Role关联数量
    const userRoleCount = users.reduce(
      (count, user) => count + user.roles.length,
      0,
    );

    // 计算Role-Permission关联数量
    const rolePermissionCount = roles.reduce((count, role) => {
      return (
        count +
        role.permissions.length +
        (role.inheritedPermissions?.length || 0)
      );
    }, 0);

    // 计算活跃策略关联数量
    const activePolicyCount = policies.filter(
      (p) => p.status === "active",
    ).length;

    // 计算孤立实体
    const usersWithoutRoles = users.filter((u) => u.roles.length === 0).length;
    const rolesWithoutPermissions = roles.filter(
      (r) => r.permissions.length === 0,
    ).length;
    const unusedPermissions = permissions.filter(
      (p) =>
        !roles.some(
          (r) =>
            r.permissions.includes(p.id) ||
            r.inheritedPermissions?.includes(p.id),
        ),
    ).length;
    const inactivePolicies = policies.filter(
      (p) => p.status !== "active",
    ).length;

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
        policies: inactivePolicies,
      },
    });
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
            <div className="text-2xl font-bold">
              {relationshipStats?.totalUsers || 0}
            </div>
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
            <div className="text-2xl font-bold">
              {relationshipStats?.totalRoles || 0}
            </div>
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
            <div className="text-2xl font-bold">
              {relationshipStats?.totalPermissions || 0}
            </div>
            <p className="text-xs text-muted-foreground">涵盖多个资源类型</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃策略数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {relationshipStats?.activePolicyRelations || 0}
            </div>
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
            <CardDescription>检查实体间的关联关系完整性</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">用户-角色关联</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {relationshipStats?.userRoleRelations || 0}
                </Badge>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">角色-权限关联</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {relationshipStats?.rolePermissionRelations || 0}
                </Badge>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">策略关联</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {relationshipStats?.activePolicyRelations || 0}
                </Badge>
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
            <CardDescription>发现未关联的实体，可能需要清理</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">无角色用户</span>
              <Badge
                variant={
                  relationshipStats?.orphanedEntities.users
                    ? "destructive"
                    : "secondary"
                }
              >
                {relationshipStats?.orphanedEntities.users || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">��权限角色</span>
              <Badge
                variant={
                  relationshipStats?.orphanedEntities.roles
                    ? "destructive"
                    : "secondary"
                }
              >
                {relationshipStats?.orphanedEntities.roles || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">未使用权限</span>
              <Badge
                variant={
                  relationshipStats?.orphanedEntities.permissions
                    ? "outline"
                    : "secondary"
                }
              >
                {relationshipStats?.orphanedEntities.permissions || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">非活跃策略</span>
              <Badge
                variant={
                  relationshipStats?.orphanedEntities.policies
                    ? "outline"
                    : "secondary"
                }
              >
                {relationshipStats?.orphanedEntities.policies || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">加载关联关系数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">关联关系管理</h1>
        <p className="text-muted-foreground">
          查看和管理User、Role、Permission和ABAC Policy之间的关联关系
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            概览
          </TabsTrigger>
          <TabsTrigger value="user-role" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            用户-角色
          </TabsTrigger>
          <TabsTrigger
            value="role-permission"
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            角色-权限
          </TabsTrigger>
          <TabsTrigger
            value="policy-relation"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            策略关联
          </TabsTrigger>
          <TabsTrigger value="graph" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            关系图
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverviewTab()}</TabsContent>

        <TabsContent value="user-role">
          <UserRoleManager
            onAssignmentChange={(assignments) => {
              // 处理分配变更
              console.log("User-Role assignments changed:", assignments);
            }}
          />
        </TabsContent>

        <TabsContent value="role-permission">
          <RolePermissionManager
            onAssignmentChange={(assignments) => {
              // 处理分配变更
              console.log("Role-Permission assignments changed:", assignments);
            }}
          />
        </TabsContent>

        <TabsContent value="policy-relation">
          <PolicyRelationshipViewer
            selectedPolicyId={
              selectedNodeId?.startsWith("policy_")
                ? selectedNodeId.replace("policy_", "")
                : undefined
            }
            onPolicySelect={(policyId) => {
              setSelectedNodeId(`policy_${policyId}`);
              setActiveTab("graph"); // 切换到图形视图以查看选中的策略
            }}
          />
        </TabsContent>

        <TabsContent value="graph">
          {users && roles && permissions && policies && (
            <RelationshipGraph
              users={users}
              roles={roles}
              permissions={permissions}
              policies={policies}
              selectedNodeId={selectedNodeId}
              onNodeSelect={(nodeId, nodeData) => {
                setSelectedNodeId(nodeId);
                console.log("Selected node:", nodeId, nodeData);
              }}
              onNodeHover={(nodeId) => {
                setHoveredNode(nodeId);
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
