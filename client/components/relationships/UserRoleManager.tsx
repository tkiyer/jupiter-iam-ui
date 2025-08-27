/**
 * User-Role关联管理组件
 * 提供用户与角色之间关联关系的完整管理功能
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
import {
  Users,
  Shield,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Filter
} from 'lucide-react';
import { User, Role } from '../../../shared/iam';
import { useUsers } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { toast } from 'sonner';
import { RelationshipValidator, ValidationResult } from '../../../shared/relationship-validator';

interface UserRoleAssignment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roleId: string;
  roleName: string;
  assignedAt: string;
  assignedBy: string;
  expiresAt?: string;
  isActive: boolean;
  reason?: string;
  conditions?: AssignmentCondition[];
}

interface AssignmentCondition {
  type: 'time_based' | 'location_based' | 'approval_required';
  description: string;
  value: any;
}

interface UserRoleManagerProps {
  onAssignmentChange?: (assignments: UserRoleAssignment[]) => void;
}

export default function UserRoleManager({ onAssignmentChange }: UserRoleManagerProps) {
  const [assignments, setAssignments] = useState<UserRoleAssignment[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<UserRoleAssignment | null>(null);
  const [isBulkAssignDialogOpen, setIsBulkAssignDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { users, loading: usersLoading } = useUsers();
  const { roles, loading: rolesLoading } = useRoles();

  // 新增分配表单状态
  const [newAssignment, setNewAssignment] = useState({
    userId: '',
    roleId: '',
    expiresAt: '',
    reason: '',
    temporaryAccess: false,
    requireApproval: false
  });

  // 批量分配状态
  const [bulkAssignment, setBulkAssignment] = useState({
    userIds: [] as string[],
    roleIds: [] as string[],
    reason: '',
    temporaryAccess: false,
    expiresAt: ''
  });

  // 加载现有的用户-角色分配
  useEffect(() => {
    if (users && roles) {
      buildAssignments();
    }
  }, [users, roles]);

  const buildAssignments = () => {
    if (!users || !roles) return;

    const builtAssignments: UserRoleAssignment[] = [];
    
    users.forEach(user => {
      user.roles.forEach(roleId => {
        const role = roles.find(r => r.id === roleId);
        if (role) {
          builtAssignments.push({
            id: `${user.id}-${roleId}`,
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            userEmail: user.email,
            roleId: role.id,
            roleName: role.name,
            assignedAt: user.createdAt,
            assignedBy: 'System',
            isActive: user.status === 'active' && role.status === 'active',
            expiresAt: role.validUntil,
            conditions: []
          });
        }
      });
    });

    setAssignments(builtAssignments);
    onAssignmentChange?.(builtAssignments);
  };

  // 过滤分配列表
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.roleName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'all' || assignment.roleId === filterRole;
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && assignment.isActive) ||
      (filterStatus === 'inactive' && !assignment.isActive) ||
      (filterStatus === 'expiring' && assignment.expiresAt && 
        new Date(assignment.expiresAt) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesRole && matchesStatus;
  });

  // 添加新的用户-角色分配
  const handleAddAssignment = async () => {
    if (!newAssignment.userId || !newAssignment.roleId) {
      toast.error('请选择用户和角色');
      return;
    }

    // ��查是否已存在相同的分配
    const existingAssignment = assignments.find(
      a => a.userId === newAssignment.userId && a.roleId === newAssignment.roleId
    );

    if (existingAssignment) {
      toast.error('该用户已分配此角色');
      return;
    }

    const user = users?.find(u => u.id === newAssignment.userId);
    const role = roles?.find(r => r.id === newAssignment.roleId);

    if (!user || !role) {
      toast.error('用户或角色不存在');
      return;
    }

    const assignment: UserRoleAssignment = {
      id: `${newAssignment.userId}-${newAssignment.roleId}`,
      userId: newAssignment.userId,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      roleId: newAssignment.roleId,
      roleName: role.name,
      assignedAt: new Date().toISOString(),
      assignedBy: 'Admin',
      isActive: true,
      expiresAt: newAssignment.expiresAt || undefined,
      reason: newAssignment.reason || undefined,
      conditions: []
    };

    // 添加条件
    if (newAssignment.temporaryAccess && newAssignment.expiresAt) {
      assignment.conditions?.push({
        type: 'time_based',
        description: '临时访���权限',
        value: { expiresAt: newAssignment.expiresAt }
      });
    }

    if (newAssignment.requireApproval) {
      assignment.conditions?.push({
        type: 'approval_required',
        description: '需要管理员批准',
        value: { approved: false }
      });
    }

    try {
      // 这里应该调用API来保存分配
      // await assignUserRole(assignment);
      
      setAssignments(prev => [...prev, assignment]);
      setNewAssignment({
        userId: '',
        roleId: '',
        expiresAt: '',
        reason: '',
        temporaryAccess: false,
        requireApproval: false
      });
      setIsAddDialogOpen(false);
      toast.success('用户角色分配成功');
      
    } catch (error) {
      toast.error('分配失败，请重试');
    }
  };

  // 编辑分配
  const handleEditAssignment = (assignment: UserRoleAssignment) => {
    setEditingAssignment({ ...assignment });
    setIsEditDialogOpen(true);
  };

  // 保存编辑的分配
  const handleSaveEdit = async () => {
    if (!editingAssignment) return;

    try {
      // 这里应该调用API来更新分配
      // await updateUserRole(editingAssignment);
      
      setAssignments(prev => 
        prev.map(a => a.id === editingAssignment.id ? editingAssignment : a)
      );
      setIsEditDialogOpen(false);
      setEditingAssignment(null);
      toast.success('分配更���成功');
      
    } catch (error) {
      toast.error('更新失败，请重试');
    }
  };

  // 删除分配
  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      // 这里应该调用API来删除分配
      // await removeUserRole(assignmentId);
      
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      toast.success('分配已删除');
      
    } catch (error) {
      toast.error('删除失败，请重试');
    }
  };

  // 批量操作
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  
  const handleBatchDelete = async () => {
    try {
      // 批量删除
      setAssignments(prev => prev.filter(a => !selectedAssignments.includes(a.id)));
      setSelectedAssignments([]);
      toast.success(`已删除 ${selectedAssignments.length} 个分配`);
    } catch (error) {
      toast.error('批量删除失败');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssignments(filteredAssignments.map(a => a.id));
    } else {
      setSelectedAssignments([]);
    }
  };

  // 批量分配用户角色
  const handleBulkAssignment = async () => {
    if (bulkAssignment.userIds.length === 0 || bulkAssignment.roleIds.length === 0) {
      toast.error('请选择用户和角色');
      return;
    }

    try {
      const newAssignments: UserRoleAssignment[] = [];

      bulkAssignment.userIds.forEach(userId => {
        const user = users?.find(u => u.id === userId);
        if (user) {
          bulkAssignment.roleIds.forEach(roleId => {
            const role = roles?.find(r => r.id === roleId);
            if (role) {
              // 检查是否已存在相同的分配
              const existingAssignment = assignments.find(
                a => a.userId === userId && a.roleId === roleId
              );

              if (!existingAssignment) {
                newAssignments.push({
                  id: `${userId}-${roleId}`,
                  userId,
                  userName: `${user.firstName} ${user.lastName}`,
                  userEmail: user.email,
                  roleId,
                  roleName: role.name,
                  assignedAt: new Date().toISOString(),
                  assignedBy: 'Admin',
                  isActive: true,
                  expiresAt: bulkAssignment.expiresAt || undefined,
                  reason: bulkAssignment.reason || undefined,
                  conditions: bulkAssignment.temporaryAccess && bulkAssignment.expiresAt ? [{
                    type: 'time_based' as const,
                    description: '临时访问权限',
                    value: { expiresAt: bulkAssignment.expiresAt }
                  }] : []
                });
              }
            }
          });
        }
      });

      if (newAssignments.length === 0) {
        toast.error('所选用户已分配所选角色');
        return;
      }

      setAssignments(prev => [...prev, ...newAssignments]);
      setBulkAssignment({
        userIds: [],
        roleIds: [],
        reason: '',
        temporaryAccess: false,
        expiresAt: ''
      });
      setIsBulkAssignDialogOpen(false);
      toast.success(`批量分配 ${newAssignments.length} 个角色`);

    } catch (error) {
      toast.error('批量分配失败，请重试');
    }
  };

  if (usersLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          {/* 搜索 */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索用户或角色..."
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

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="按状态过滤" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="inactive">非活跃</SelectItem>
                <SelectItem value="expiring">即将过期</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          {selectedAssignments.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              删除选中 ({selectedAssignments.length})
            </Button>
          )}

          <Dialog open={isBulkAssignDialogOpen} onOpenChange={setIsBulkAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                批量分配
              </Button>
            </DialogTrigger>
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
                <DialogTitle>添加用户角色分配</DialogTitle>
                <DialogDescription>
                  为用户分配新的角色权限
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user">选择用户</Label>
                  <Select value={newAssignment.userId} onValueChange={(value) => 
                    setNewAssignment(prev => ({ ...prev, userId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="选择用户" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {user.firstName} {user.lastName} ({user.email})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                  <Label htmlFor="reason">分配原因（可选）</Label>
                  <Textarea
                    id="reason"
                    placeholder="描述分配此角色的原因..."
                    value={newAssignment.reason}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="temporary"
                      checked={newAssignment.temporaryAccess}
                      onCheckedChange={(checked) => 
                        setNewAssignment(prev => ({ ...prev, temporaryAccess: checked as boolean }))
                      }
                    />
                    <Label htmlFor="temporary">临时访问权限</Label>
                  </div>

                  {newAssignment.temporaryAccess && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="expires">过期时间</Label>
                      <Input
                        id="expires"
                        type="datetime-local"
                        value={newAssignment.expiresAt}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, expiresAt: e.target.value }))}
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="approval"
                      checked={newAssignment.requireApproval}
                      onCheckedChange={(checked) => 
                        setNewAssignment(prev => ({ ...prev, requireApproval: checked as boolean }))
                      }
                    />
                    <Label htmlFor="approval">需要管理员批准</Label>
                  </div>
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
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总分配数</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">活跃分配</p>
                <p className="text-2xl font-bold text-green-600">
                  {assignments.filter(a => a.isActive).length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">即将过期</p>
                <p className="text-2xl font-bold text-orange-600">
                  {assignments.filter(a => 
                    a.expiresAt && new Date(a.expiresAt) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">非活跃分配</p>
                <p className="text-2xl font-bold text-red-600">
                  {assignments.filter(a => !a.isActive).length}
                </p>
              </div>
              <X className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 分配列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            用户角色分配列表
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">
                    <Checkbox
                      checked={selectedAssignments.length === filteredAssignments.length && filteredAssignments.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left">用户</th>
                  <th className="px-6 py-3 text-left">角色</th>
                  <th className="px-6 py-3 text-left">分配时间</th>
                  <th className="px-6 py-3 text-left">过期时间</th>
                  <th className="px-6 py-3 text-left">状态</th>
                  <th className="px-6 py-3 text-left">条件</th>
                  <th className="px-6 py-3 text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <Checkbox
                        checked={selectedAssignments.includes(assignment.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAssignments(prev => [...prev, assignment.id]);
                          } else {
                            setSelectedAssignments(prev => prev.filter(id => id !== assignment.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{assignment.userName}</div>
                        <div className="text-sm text-gray-500">{assignment.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{assignment.roleName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(assignment.assignedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {assignment.expiresAt ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(assignment.expiresAt).toLocaleDateString()}
                        </div>
                      ) : (
                        '永久'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={assignment.isActive ? "default" : "secondary"}>
                        {assignment.isActive ? '活跃' : '非活跃'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {assignment.conditions && assignment.conditions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {assignment.conditions.map((condition, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {condition.description}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">无条件</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditAssignment(assignment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                        >
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

      {/* 编辑分配对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑用户角色分配</DialogTitle>
            <DialogDescription>
              修改分配的详细信息和条件
            </DialogDescription>
          </DialogHeader>

          {editingAssignment && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>用户</Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  {editingAssignment.userName} ({editingAssignment.userEmail})
                </div>
              </div>

              <div className="space-y-2">
                <Label>角色</Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  {editingAssignment.roleName}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-expires">过期时间</Label>
                <Input
                  id="edit-expires"
                  type="datetime-local"
                  value={editingAssignment.expiresAt || ''}
                  onChange={(e) => setEditingAssignment(prev => 
                    prev ? { ...prev, expiresAt: e.target.value || undefined } : null
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-reason">分配原因</Label>
                <Textarea
                  id="edit-reason"
                  value={editingAssignment.reason || ''}
                  onChange={(e) => setEditingAssignment(prev => 
                    prev ? { ...prev, reason: e.target.value } : null
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
                <Label htmlFor="edit-active">分配处于活跃状态</Label>
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

      {/* 批量分配对话框 */}
      <Dialog open={isBulkAssignDialogOpen} onOpenChange={setIsBulkAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>批量分配用户角色</DialogTitle>
            <DialogDescription>
              为多个用户批量分配角色权限
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>选择用户</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                  {users?.map(user => (
                    <div key={user.id} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={bulkAssignment.userIds.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setBulkAssignment(prev => ({
                              ...prev,
                              userIds: [...prev.userIds, user.id]
                            }));
                          } else {
                            setBulkAssignment(prev => ({
                              ...prev,
                              userIds: prev.userIds.filter(id => id !== user.id)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`user-${user.id}`} className="text-sm">
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  已选择 {bulkAssignment.userIds.length} 个用户
                </p>
              </div>

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
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {role.name}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  已选择 {bulkAssignment.roleIds.length} 个角色
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-reason">批量分配原因</Label>
              <Textarea
                id="bulk-reason"
                placeholder="描述批量分配的原因..."
                value={bulkAssignment.reason}
                onChange={(e) => setBulkAssignment(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bulk-temporary"
                  checked={bulkAssignment.temporaryAccess}
                  onCheckedChange={(checked) =>
                    setBulkAssignment(prev => ({ ...prev, temporaryAccess: checked as boolean }))
                  }
                />
                <Label htmlFor="bulk-temporary">临时访问权限</Label>
              </div>

              {bulkAssignment.temporaryAccess && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="bulk-expires">过期时间</Label>
                  <Input
                    id="bulk-expires"
                    type="datetime-local"
                    value={bulkAssignment.expiresAt}
                    onChange={(e) => setBulkAssignment(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkAssignDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleBulkAssignment}>
              批量分配
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
