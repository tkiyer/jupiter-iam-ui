/**
 * Role-Permission关联管理组件
 * 提供角色与权限之间关联关系���完整管理功能
 */

import React, { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Key,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  Eye,
  Copy,
  ArrowRight,
  Settings
} from 'lucide-react';
import { Role, Permission } from '../../../shared/iam';
import { useRoles } from '../../hooks/useRoles';
import { usePermissions } from '../../hooks/usePermissions';
import { toast } from 'sonner';

interface RolePermissionAssignment {
  id: string;
  roleId: string;
  roleName: string;
  permissionId: string;
  permissionName: string;
  permissionCategory: string;
  permissionScope: string;
  assignmentType: 'direct' | 'inherited';
  source: string;
  assignedAt: string;
  assignedBy: string;
  conditions?: AssignmentCondition[];
  isActive: boolean;
  risk: 'low' | 'medium' | 'high' | 'critical';
}

interface AssignmentCondition {
  type: 'time_based' | 'context_based' | 'approval_required';
  description: string;
  value: any;
}

interface PermissionMatrix {
  roleId: string;
  roleName: string;
  permissions: {
    [permissionId: string]: {
      hasPermission: boolean;
      assignmentType: 'direct' | 'inherited' | 'none';
      source?: string;
    };
  };
}

interface RolePermissionManagerProps {
  onAssignmentChange?: (assignments: RolePermissionAssignment[]) => void;
}

export default function RolePermissionManager({ onAssignmentChange }: RolePermissionManagerProps) {
  const [assignments, setAssignments] = useState<RolePermissionAssignment[]>([]);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkAssignDialogOpen, setIsBulkAssignDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<RolePermissionAssignment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('list');

  const { roles, loading: rolesLoading } = useRoles();
  const { permissions, loading: permissionsLoading } = usePermissions();

  // 新增分配表单状态
  const [newAssignment, setNewAssignment] = useState({
    roleId: '',
    permissionIds: [] as string[],
    reason: '',
    temporaryAccess: false,
    expiresAt: '',
    requireApproval: false
  });

  // 批量分配状态
  const [bulkAssignment, setBulkAssignment] = useState({
    roleIds: [] as string[],
    permissionIds: [] as string[],
    reason: ''
  });

  // 批量撤销状态
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);

  // 加载现有的角色-权限分配
  useEffect(() => {
    if (roles && permissions) {
      buildAssignments();
      buildPermissionMatrix();
    }
  }, [roles, permissions]);

  const buildAssignments = () => {
    if (!roles || !permissions) return;

    const builtAssignments: RolePermissionAssignment[] = [];
    
    roles.forEach(role => {
      // 直接分配的权限
      role.permissions.forEach(permissionId => {
        const permission = permissions.find(p => p.id === permissionId);
        if (permission) {
          builtAssignments.push({
            id: `${role.id}-${permissionId}-direct`,
            roleId: role.id,
            roleName: role.name,
            permissionId: permission.id,
            permissionName: permission.name,
            permissionCategory: permission.category,
            permissionScope: permission.scope,
            assignmentType: 'direct',
            source: 'Direct Assignment',
            assignedAt: role.createdAt,
            assignedBy: 'System',
            isActive: role.status === 'active',
            risk: permission.risk as 'low' | 'medium' | 'high' | 'critical'
          });
        }
      });

      // 继承的权限
      role.inheritedPermissions?.forEach(permissionId => {
        const permission = permissions.find(p => p.id === permissionId);
        if (permission) {
          builtAssignments.push({
            id: `${role.id}-${permissionId}-inherited`,
            roleId: role.id,
            roleName: role.name,
            permissionId: permission.id,
            permissionName: permission.name,
            permissionCategory: permission.category,
            permissionScope: permission.scope,
            assignmentType: 'inherited',
            source: role.parentRole || 'Hierarchy',
            assignedAt: role.createdAt,
            assignedBy: 'System',
            isActive: role.status === 'active',
            risk: permission.risk as 'low' | 'medium' | 'high' | 'critical'
          });
        }
      });
    });

    setAssignments(builtAssignments);
    onAssignmentChange?.(builtAssignments);
  };

  const buildPermissionMatrix = () => {
    if (!roles || !permissions) return;

    const matrix: PermissionMatrix[] = roles.map(role => {
      const rolePermissions: { [permissionId: string]: any } = {};
      
      permissions.forEach(permission => {
        let hasPermission = false;
        let assignmentType: 'direct' | 'inherited' | 'none' = 'none';
        let source: string | undefined;

        if (role.permissions.includes(permission.id)) {
          hasPermission = true;
          assignmentType = 'direct';
          source = 'Direct Assignment';
        } else if (role.inheritedPermissions?.includes(permission.id)) {
          hasPermission = true;
          assignmentType = 'inherited';
          source = role.parentRole || 'Hierarchy';
        }

        rolePermissions[permission.id] = {
          hasPermission,
          assignmentType,
          source
        };
      });

      return {
        roleId: role.id,
        roleName: role.name,
        permissions: rolePermissions
      };
    });

    setPermissionMatrix(matrix);
  };

  // 过滤分配列表
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.permissionName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'all' || assignment.roleId === filterRole;
    const matchesCategory = filterCategory === 'all' || assignment.permissionCategory === filterCategory;
    const matchesType = 
      filterType === 'all' || 
      assignment.assignmentType === filterType;

    return matchesSearch && matchesRole && matchesCategory && matchesType;
  });

  // 获取权限分类
  const permissionCategories = [...new Set(permissions?.map(p => p.category) || [])];

  // 添加单个角色-权限分配
  const handleAddAssignment = async () => {
    if (!newAssignment.roleId || newAssignment.permissionIds.length === 0) {
      toast.error('请选择角色和权限');
      return;
    }

    const role = roles?.find(r => r.id === newAssignment.roleId);
    if (!role) {
      toast.error('角色不存在');
      return;
    }

    try {
      const newAssignments: RolePermissionAssignment[] = [];

      newAssignment.permissionIds.forEach(permissionId => {
        const permission = permissions?.find(p => p.id === permissionId);
        if (permission) {
          // 检查是否已存在相同的分配
          const existingAssignment = assignments.find(
            a => a.roleId === newAssignment.roleId && a.permissionId === permissionId && a.assignmentType === 'direct'
          );

          if (!existingAssignment) {
            newAssignments.push({
              id: `${newAssignment.roleId}-${permissionId}-direct`,
              roleId: newAssignment.roleId,
              roleName: role.name,
              permissionId: permission.id,
              permissionName: permission.name,
              permissionCategory: permission.category,
              permissionScope: permission.scope,
              assignmentType: 'direct',
              source: 'Direct Assignment',
              assignedAt: new Date().toISOString(),
              assignedBy: 'Admin',
              isActive: true,
              risk: permission.risk as 'low' | 'medium' | 'high' | 'critical',
              conditions: []
            });
          }
        }
      });

      if (newAssignments.length === 0) {
        toast.error('所选权限已分配给该角色');
        return;
      }

      // 这里应该调用API来保存分配
      // await assignPermissionsToRole(newAssignments);
      
      setAssignments(prev => [...prev, ...newAssignments]);
      setNewAssignment({
        roleId: '',
        permissionIds: [],
        reason: '',
        temporaryAccess: false,
        expiresAt: '',
        requireApproval: false
      });
      setIsAddDialogOpen(false);
      toast.success(`成功分配 ${newAssignments.length} 个权限`);
      
    } catch (error) {
      toast.error('分配失败，请重试');
    }
  };

  // 批量分配权限
  const handleBulkAssignment = async () => {
    if (bulkAssignment.roleIds.length === 0 || bulkAssignment.permissionIds.length === 0) {
      toast.error('请选择角色和权限');
      return;
    }

    try {
      const newAssignments: RolePermissionAssignment[] = [];

      bulkAssignment.roleIds.forEach(roleId => {
        const role = roles?.find(r => r.id === roleId);
        if (role) {
          bulkAssignment.permissionIds.forEach(permissionId => {
            const permission = permissions?.find(p => p.id === permissionId);
            if (permission) {
              const existingAssignment = assignments.find(
                a => a.roleId === roleId && a.permissionId === permissionId && a.assignmentType === 'direct'
              );

              if (!existingAssignment) {
                newAssignments.push({
                  id: `${roleId}-${permissionId}-direct`,
                  roleId,
                  roleName: role.name,
                  permissionId: permission.id,
                  permissionName: permission.name,
                  permissionCategory: permission.category,
                  permissionScope: permission.scope,
                  assignmentType: 'direct',
                  source: 'Bulk Assignment',
                  assignedAt: new Date().toISOString(),
                  assignedBy: 'Admin',
                  isActive: true,
                  risk: permission.risk as 'low' | 'medium' | 'high' | 'critical'
                });
              }
            }
          });
        }
      });

      if (newAssignments.length === 0) {
        toast.error('所选权限已分配给所选角色');
        return;
      }

      setAssignments(prev => [...prev, ...newAssignments]);
      setBulkAssignment({ roleIds: [], permissionIds: [], reason: '' });
      setIsBulkAssignDialogOpen(false);
      toast.success(`批量分配 ${newAssignments.length} 个权限`);
      
    } catch (error) {
      toast.error('批量分配失败，请重试');
    }
  };

  // 删除分配
  const handleDeleteAssignment = async (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment?.assignmentType === 'inherited') {
      toast.error('无法删除继承的权限');
      return;
    }

    try {
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      toast.success('权限分配已删除');
    } catch (error) {
      toast.error('删除失败，请重试');
    }
  };

  // 编辑分配
  const handleEditAssignment = (assignment: RolePermissionAssignment) => {
    if (assignment.assignmentType === 'inherited') {
      toast.error('无法编辑继承的权限');
      return;
    }
    setEditingAssignment({ ...assignment });
    setIsEditDialogOpen(true);
  };

  // 保存编辑的分配
  const handleSaveEdit = async () => {
    if (!editingAssignment) return;

    try {
      // 这里应该调用API来更新分配
      // await updateRolePermissionAssignment(editingAssignment);

      setAssignments(prev =>
        prev.map(a => a.id === editingAssignment.id ? editingAssignment : a)
      );
      setIsEditDialogOpen(false);
      setEditingAssignment(null);
      toast.success('分配更新成功');

    } catch (error) {
      toast.error('更新失败，请重试');
    }
  };

  // 批量撤销权限
  const handleBulkRevocation = async () => {
    if (selectedAssignments.length === 0) {
      toast.error('请选择要撤销的权限分配');
      return;
    }

    // 检查是否包含继承权限
    const inheritedAssignments = selectedAssignments.filter(id => {
      const assignment = assignments.find(a => a.id === id);
      return assignment?.assignmentType === 'inherited';
    });

    if (inheritedAssignments.length > 0) {
      toast.error('无法撤销继承的权限，请先取消选择继承权限');
      return;
    }

    try {
      // 这里应该调用API来批量撤销权限
      // await bulkRevokePermissions(selectedAssignments);

      setAssignments(prev => prev.filter(a => !selectedAssignments.includes(a.id)));
      setSelectedAssignments([]);
      toast.success(`已撤销 ${selectedAssignments.length} 个权限分配`);

    } catch (error) {
      toast.error('批量撤销失败，请重试');
    }
  };

  // 选择所有分配
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // 只选择直接分配的权限（排除继承权限）
      const directAssignments = filteredAssignments
        .filter(a => a.assignmentType === 'direct')
        .map(a => a.id);
      setSelectedAssignments(directAssignments);
    } else {
      setSelectedAssignments([]);
    }
  };

  // 权限矩阵视图
  const renderMatrixView = () => {
    // 安全检查：确保数据已加载
    if (!roles || !permissions || permissionMatrix.length === 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">权限分配矩阵</h3>
              <p className="text-sm text-muted-foreground">
                查看所有角色和权限的分配关系矩阵
              </p>
            </div>
            <Button variant="outline" onClick={() => setActiveTab('list')}>
              <Eye className="h-4 w-4 mr-2" />
              切换到列表视图
            </Button>
          </div>
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground">加载权限矩阵数据...</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">权限分配矩阵</h3>
          <p className="text-sm text-muted-foreground">
            查看所有角色和权限的分配��系矩阵
          </p>
        </div>
        <Button variant="outline" onClick={() => setActiveTab('list')}>
          <Eye className="h-4 w-4 mr-2" />
          切换到列表视图
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-medium border-r">角色</th>
                  {permissions?.slice(0, 10).map(permission => (
                    <th key={permission.id} className="px-2 py-3 text-center text-xs font-medium border-r min-w-20">
                      <div className="transform -rotate-45 origin-center">
                        {permission.name.substring(0, 10)}...
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center">更多...</th>
                </tr>
              </thead>
              <tbody>
                {permissionMatrix.map(roleMatrix => (
                  <tr key={roleMatrix.roleId} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium border-r bg-gray-50">
                      {roleMatrix.roleName}
                    </td>
                    {permissions?.slice(0, 10).map(permission => {
                      const permissionData = roleMatrix.permissions?.[permission.id];
                      return (
                        <td key={permission.id} className="px-2 py-3 text-center border-r">
                          {permissionData?.hasPermission ? (
                            <div className="flex flex-col items-center">
                              <CheckCircle2
                                className={`h-4 w-4 ${permissionData.assignmentType === 'direct' ? 'text-green-600' : 'text-blue-600'}`}
                              />
                              <span className="text-xs text-gray-500">
                                {permissionData.assignmentType === 'direct' ? '直接' : '继承'}
                              </span>
                            </div>
                          ) : (
                            <div className="h-4 w-4 rounded border border-gray-300"></div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
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
  };

  // 列表视图
  const renderListView = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          {/* 搜索 */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索角色或权限..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* 过滤器 */}
          <div className="flex gap-2">
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="按角色过滤" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有角色</SelectItem>
                {roles?.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="按分类过滤" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有分类</SelectItem>
                {permissionCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="按类型过滤" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                <SelectItem value="direct">直接分配</SelectItem>
                <SelectItem value="inherited">继承分配</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveTab('matrix')}>
            <GitBranch className="h-4 w-4 mr-2" />
            矩阵视图
          </Button>
          
          <Dialog open={isBulkAssignDialogOpen} onOpenChange={setIsBulkAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                批量分配
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>批量分配权限</DialogTitle>
                <DialogDescription>
                  为多个角色批量分配权限
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>选择角色</Label>
                    <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                      {roles?.map(role => (
                        <div key={role.id} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`role-${role.id}`}
                            checked={bulkAssignment.roleIds.includes(role.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setBulkAssignment(prev => ({
                                  ...prev,
                                  roleIds: [...prev.roleIds, role.id]
                                }));
                              } else {
                                setBulkAssignment(prev => ({
                                  ...prev,
                                  roleIds: prev.roleIds.filter(id => id !== role.id)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={`role-${role.id}`} className="text-sm">
                            {role.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      已选择 {bulkAssignment.roleIds.length} 个角色
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>选择权限</Label>
                    <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                      {permissions?.map(permission => (
                        <div key={permission.id} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`perm-${permission.id}`}
                            checked={bulkAssignment.permissionIds.includes(permission.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setBulkAssignment(prev => ({
                                  ...prev,
                                  permissionIds: [...prev.permissionIds, permission.id]
                                }));
                              } else {
                                setBulkAssignment(prev => ({
                                  ...prev,
                                  permissionIds: prev.permissionIds.filter(id => id !== permission.id)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={`perm-${permission.id}`} className="text-sm">
                            <div>
                              <div>{permission.name}</div>
                              <div className="text-xs text-gray-500">{permission.category}</div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      已选择 {bulkAssignment.permissionIds.length} 个权限
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-reason">批量分配原因</Label>
                  <Textarea
                    id="bulk-reason"
                    placeholder="描述批���分配的原因..."
                    value={bulkAssignment.reason}
                    onChange={(e) => setBulkAssignment(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBulkAssignDialogOpen(false)}>
                  ���消
                </Button>
                <Button onClick={handleBulkAssignment}>
                  批量分配
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                添加分配
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>添加角色权限分配</DialogTitle>
                <DialogDescription>
                  为角色分配新的权限
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">选择角色</Label>
                  <Select value={newAssignment.roleId} onValueChange={(value) => 
                    setNewAssignment(prev => ({ ...prev, roleId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="选择角色" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {role.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>选择权限</Label>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                    {permissions?.map(permission => (
                      <div key={permission.id} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`new-perm-${permission.id}`}
                          checked={newAssignment.permissionIds.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewAssignment(prev => ({
                                ...prev,
                                permissionIds: [...prev.permissionIds, permission.id]
                              }));
                            } else {
                              setNewAssignment(prev => ({
                                ...prev,
                                permissionIds: prev.permissionIds.filter(id => id !== permission.id)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`new-perm-${permission.id}`} className="text-sm">
                          <div>
                            <div className="flex items-center gap-2">
                              <Key className="h-3 w-3" />
                              {permission.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {permission.category} • {permission.scope}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    已选择 {newAssignment.permissionIds.length} 个权限
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">分配原因（可选）</Label>
                  <Textarea
                    id="reason"
                    placeholder="描述分配这些权限的原因..."
                    value={newAssignment.reason}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleAddAssignment}>
                  添加分配
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 编辑分配对话框 */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>编辑角色权限分配</DialogTitle>
                <DialogDescription>
                  修改权限分配的详细信息
                </DialogDescription>
              </DialogHeader>

              {editingAssignment && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>角色</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {editingAssignment.roleName}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>权限</Label>
                    <div className="p-2 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        {editingAssignment.permissionName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {editingAssignment.permissionCategory} • {editingAssignment.permissionScope}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-source">分配来源</Label>
                    <Input
                      id="edit-source"
                      value={editingAssignment.source}
                      onChange={(e) => setEditingAssignment(prev =>
                        prev ? { ...prev, source: e.target.value } : null
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-assigned-by">分配人</Label>
                    <Input
                      id="edit-assigned-by"
                      value={editingAssignment.assignedBy}
                      onChange={(e) => setEditingAssignment(prev =>
                        prev ? { ...prev, assignedBy: e.target.value } : null
                      )}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-active"
                      checked={editingAssignment.isActive}
                      onCheckedChange={(checked) => setEditingAssignment(prev =>
                        prev ? { ...prev, isActive: checked as boolean } : null
                      )}
                    />
                    <Label htmlFor="edit-active">激活状态</Label>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSaveEdit}>
                  保存更改
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 分配列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            角色权限分配列表
            <Badge variant="secondary" className="ml-2">
              {filteredAssignments.length} 个分配
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">角色</th>
                  <th className="px-6 py-3 text-left">权限</th>
                  <th className="px-6 py-3 text-left">分类</th>
                  <th className="px-6 py-3 text-left">作用域</th>
                  <th className="px-6 py-3 text-left">类型</th>
                  <th className="px-6 py-3 text-left">来源</th>
                  <th className="px-6 py-3 text-left">风险级别</th>
                  <th className="px-6 py-3 text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{assignment.roleName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-gray-400" />
                        <span>{assignment.permissionName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">
                        {assignment.permissionCategory}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">
                        {assignment.permissionScope}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={assignment.assignmentType === 'direct' ? 'default' : 'outline'}>
                        {assignment.assignmentType === 'direct' ? '直接' : '继承'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {assignment.source}
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={
                          assignment.risk === 'critical' ? 'destructive' :
                          assignment.risk === 'high' ? 'outline' :
                          'secondary'
                        }
                      >
                        {assignment.risk}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {assignment.assignmentType === 'direct' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAssignment(assignment)}
                            >
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                            >
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

  if (rolesLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计信息 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总分配数</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
              <ArrowRight className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">直接分配</p>
                <p className="text-2xl font-bold text-blue-600">
                  {assignments.filter(a => a.assignmentType === 'direct').length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">继承分配</p>
                <p className="text-2xl font-bold text-green-600">
                  {assignments.filter(a => a.assignmentType === 'inherited').length}
                </p>
              </div>
              <GitBranch className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">高风险权限</p>
                <p className="text-2xl font-bold text-red-600">
                  {assignments.filter(a => a.risk === 'high' || a.risk === 'critical').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 选项卡切换 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">列表视图</TabsTrigger>
          <TabsTrigger value="matrix">矩阵视图</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {renderListView()}
        </TabsContent>

        <TabsContent value="matrix">
          {renderMatrixView()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
