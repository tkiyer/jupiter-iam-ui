/**
 * 关联关系图表可视化组件
 * 使用图形化方式展示User、Role、Permission和Policy之间的关联关系
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Users,
  Shield,
  Key,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Settings,
  Filter,
  Eye,
  EyeOff,
  Maximize,
  MinusCircle,
  PlusCircle
} from 'lucide-react';
import { User, Role, Permission, ABACPolicy } from '../../../shared/iam';

interface GraphNode {
  id: string;
  label: string;
  type: 'user' | 'role' | 'permission' | 'policy';
  x: number;
  y: number;
  size: number;
  color: string;
  data: User | Role | Permission | ABACPolicy;
  connections: number;
  isSelected: boolean;
  isHighlighted: boolean;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'user_role' | 'role_permission' | 'policy_applies' | 'inheritance';
  weight: number;
  color: string;
  isVisible: boolean;
  label?: string;
}

interface RelationshipGraphProps {
  users: User[];
  roles: Role[];
  permissions: Permission[];
  policies: ABACPolicy[];
  selectedNodeId?: string;
  onNodeSelect?: (nodeId: string, nodeData: any) => void;
  onNodeHover?: (nodeId: string | null) => void;
}

export default function RelationshipGraph({
  users,
  roles,
  permissions,
  policies,
  selectedNodeId,
  onNodeSelect,
  onNodeHover
}: RelationshipGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // 可视化控制选项
  const [showUsers, setShowUsers] = useState(true);
  const [showRoles, setShowRoles] = useState(true);
  const [showPermissions, setShowPermissions] = useState(true);
  const [showPolicies, setShowPolicies] = useState(true);
  const [showUserRoleEdges, setShowUserRoleEdges] = useState(true);
  const [showRolePermissionEdges, setShowRolePermissionEdges] = useState(true);
  const [showPolicyEdges, setShowPolicyEdges] = useState(true);
  const [nodeSize, setNodeSize] = useState([50]);
  const [edgeThickness, setEdgeThickness] = useState([2]);
  const [layoutType, setLayoutType] = useState<'force' | 'circle' | 'hierarchy'>('force');

  // 颜色配置
  const nodeColors = {
    user: '#3B82F6',      // 蓝色
    role: '#10B981',      // 绿色
    permission: '#F59E0B', // 橙色
    policy: '#8B5CF6'     // 紫色
  };

  const edgeColors = {
    user_role: '#60A5FA',
    role_permission: '#34D399',
    policy_applies: '#A78BFA',
    inheritance: '#94A3B8'
  };

  // 构建图形数据
  useEffect(() => {
    buildGraphData();
  }, [users, roles, permissions, policies]);

  // 重新布局
  useEffect(() => {
    if (nodes.length > 0) {
      applyLayout();
    }
  }, [layoutType, nodes.length]);

  // 重绘图形
  useEffect(() => {
    drawGraph();
  }, [nodes, edges, scale, offset, hoveredNode, selectedNodeId, showUsers, showRoles, showPermissions, showPolicies]);

  const buildGraphData = () => {
    const newNodes: GraphNode[] = [];
    const newEdges: GraphEdge[] = [];

    // 创建用户节点
    users.forEach((user, index) => {
      newNodes.push({
        id: `user_${user.id}`,
        label: `${user.firstName} ${user.lastName}`,
        type: 'user',
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: nodeSize[0],
        color: nodeColors.user,
        data: user,
        connections: user.roles.length,
        isSelected: selectedNodeId === `user_${user.id}`,
        isHighlighted: false
      });
    });

    // 创建角色节点
    roles.forEach((role, index) => {
      const userCount = users.filter(u => u.roles.includes(role.id)).length;
      
      newNodes.push({
        id: `role_${role.id}`,
        label: role.name,
        type: 'role',
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: nodeSize[0] + userCount * 5,
        color: nodeColors.role,
        data: role,
        connections: userCount + role.permissions.length,
        isSelected: selectedNodeId === `role_${role.id}`,
        isHighlighted: false
      });
    });

    // 创建权限节点
    permissions.forEach((permission, index) => {
      const roleCount = roles.filter(r => 
        r.permissions.includes(permission.id) || 
        r.inheritedPermissions?.includes(permission.id)
      ).length;

      newNodes.push({
        id: `permission_${permission.id}`,
        label: permission.name,
        type: 'permission',
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: nodeSize[0],
        color: nodeColors.permission,
        data: permission,
        connections: roleCount,
        isSelected: selectedNodeId === `permission_${permission.id}`,
        isHighlighted: false
      });
    });

    // 创建策略节点
    policies.forEach((policy, index) => {
      newNodes.push({
        id: `policy_${policy.id}`,
        label: policy.name,
        type: 'policy',
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: nodeSize[0] + policy.priority / 10,
        color: policy.effect === 'allow' ? '#10B981' : '#EF4444',
        data: policy,
        connections: policy.rules.length,
        isSelected: selectedNodeId === `policy_${policy.id}`,
        isHighlighted: false
      });
    });

    // 创建用户-角色边
    users.forEach(user => {
      user.roles.forEach(roleId => {
        const roleExists = roles.find(r => r.id === roleId);
        if (roleExists) {
          newEdges.push({
            id: `${user.id}_${roleId}`,
            source: `user_${user.id}`,
            target: `role_${roleId}`,
            type: 'user_role',
            weight: 1,
            color: edgeColors.user_role,
            isVisible: showUserRoleEdges,
            label: '分配'
          });
        }
      });
    });

    // 创建角色-权限边
    roles.forEach(role => {
      // 直接权限
      role.permissions.forEach(permissionId => {
        const permissionExists = permissions.find(p => p.id === permissionId);
        if (permissionExists) {
          newEdges.push({
            id: `${role.id}_${permissionId}_direct`,
            source: `role_${role.id}`,
            target: `permission_${permissionId}`,
            type: 'role_permission',
            weight: 2,
            color: edgeColors.role_permission,
            isVisible: showRolePermissionEdges,
            label: '直接'
          });
        }
      });

      // 继承权限
      role.inheritedPermissions?.forEach(permissionId => {
        const permissionExists = permissions.find(p => p.id === permissionId);
        if (permissionExists) {
          newEdges.push({
            id: `${role.id}_${permissionId}_inherited`,
            source: `role_${role.id}`,
            target: `permission_${permissionId}`,
            type: 'inheritance',
            weight: 1,
            color: edgeColors.inheritance,
            isVisible: showRolePermissionEdges,
            label: '继承'
          });
        }
      });
    });

    // 创建策略关联边（简化版本）
    policies.forEach(policy => {
      policy.rules.forEach(rule => {
        // 分析规则中的角色引用
        rule.subject.forEach(condition => {
          if (condition.attribute === 'role' || condition.attribute === 'roles') {
            const roleValue = Array.isArray(condition.value) ? condition.value[0] : condition.value;
            const role = roles.find(r => r.name === roleValue || r.id === roleValue);
            if (role) {
              newEdges.push({
                id: `${policy.id}_${role.id}_policy`,
                source: `policy_${policy.id}`,
                target: `role_${role.id}`,
                type: 'policy_applies',
                weight: policy.priority / 100,
                color: edgeColors.policy_applies,
                isVisible: showPolicyEdges,
                label: policy.effect
              });
            }
          }
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const applyLayout = () => {
    const layoutNodes = [...nodes];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    switch (layoutType) {
      case 'circle':
        applyCircleLayout(layoutNodes, centerX, centerY, Math.min(width, height) * 0.3);
        break;
      case 'hierarchy':
        applyHierarchyLayout(layoutNodes, width, height);
        break;
      case 'force':
      default:
        applyForceLayout(layoutNodes, width, height);
        break;
    }

    setNodes(layoutNodes);
  };

  const applyCircleLayout = (layoutNodes: GraphNode[], centerX: number, centerY: number, radius: number) => {
    const nodesByType = {
      user: layoutNodes.filter(n => n.type === 'user'),
      role: layoutNodes.filter(n => n.type === 'role'),
      permission: layoutNodes.filter(n => n.type === 'permission'),
      policy: layoutNodes.filter(n => n.type === 'policy')
    };

    let currentAngle = 0;
    Object.values(nodesByType).forEach(typeNodes => {
      if (typeNodes.length === 0) return;
      
      const angleStep = (Math.PI * 2) / typeNodes.length;
      typeNodes.forEach((node, index) => {
        const angle = currentAngle + (index * angleStep);
        node.x = centerX + Math.cos(angle) * radius;
        node.y = centerY + Math.sin(angle) * radius;
      });
      currentAngle += Math.PI / 2; // 每种类型占据90度
    });
  };

  const applyHierarchyLayout = (layoutNodes: GraphNode[], width: number, height: number) => {
    const levels = [
      layoutNodes.filter(n => n.type === 'user'),
      layoutNodes.filter(n => n.type === 'role'),
      layoutNodes.filter(n => n.type === 'permission'),
      layoutNodes.filter(n => n.type === 'policy')
    ];

    const levelHeight = height / levels.length;
    
    levels.forEach((levelNodes, levelIndex) => {
      const y = levelHeight * (levelIndex + 0.5);
      const nodeWidth = width / (levelNodes.length + 1);
      
      levelNodes.forEach((node, nodeIndex) => {
        node.x = nodeWidth * (nodeIndex + 1);
        node.y = y;
      });
    });
  };

  const applyForceLayout = (layoutNodes: GraphNode[], width: number, height: number) => {
    // 简化的力导向布局
    const iterations = 50;
    const repulsion = 100;
    const attraction = 0.1;
    
    for (let i = 0; i < iterations; i++) {
      // 排斥力
      layoutNodes.forEach(nodeA => {
        layoutNodes.forEach(nodeB => {
          if (nodeA.id === nodeB.id) return;
          
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const force = repulsion / (distance * distance);
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          nodeA.x += fx;
          nodeA.y += fy;
        });
      });

      // 吸引力（基于边）
      edges.forEach(edge => {
        const sourceNode = layoutNodes.find(n => n.id === edge.source);
        const targetNode = layoutNodes.find(n => n.id === edge.target);
        
        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const force = distance * attraction;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          sourceNode.x += fx * 0.5;
          sourceNode.y += fy * 0.5;
          targetNode.x -= fx * 0.5;
          targetNode.y -= fy * 0.5;
        }
      });

      // 边界约束
      layoutNodes.forEach(node => {
        node.x = Math.max(50, Math.min(width - 50, node.x));
        node.y = Math.max(50, Math.min(height - 50, node.y));
      });
    }
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 应用变换
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // 绘制边
    edges.forEach(edge => {
      if (!edge.isVisible) return;

      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode && shouldShowNode(sourceNode) && shouldShowNode(targetNode)) {
        drawEdge(ctx, sourceNode, targetNode, edge);
      }
    });

    // 绘制节点
    nodes.forEach(node => {
      if (shouldShowNode(node)) {
        drawNode(ctx, node);
      }
    });

    ctx.restore();
  };

  const shouldShowNode = (node: GraphNode) => {
    switch (node.type) {
      case 'user': return showUsers;
      case 'role': return showRoles;
      case 'permission': return showPermissions;
      case 'policy': return showPolicies;
      default: return true;
    }
  };

  const drawNode = (ctx: CanvasRenderingContext2D, node: GraphNode) => {
    const isHovered = hoveredNode === node.id;
    const isSelected = selectedNodeId === node.id;
    
    // 绘制节点背景
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
    ctx.fillStyle = node.color;
    ctx.fill();

    // 绘制选中/悬停效果
    if (isSelected || isHovered) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = isSelected ? '#000' : '#666';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 绘制图标
    drawNodeIcon(ctx, node);

    // 绘制标签
    if (scale > 0.5) {
      ctx.fillStyle = '#000';
      ctx.font = `${12 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + node.size + 20);
    }

    // 绘制连接数量
    if (scale > 0.7) {
      ctx.fillStyle = '#fff';
      ctx.font = `${10 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(node.connections.toString(), node.x, node.y + 3);
    }
  };

  const drawNodeIcon = (ctx: CanvasRenderingContext2D, node: GraphNode) => {
    ctx.fillStyle = '#fff';
    ctx.font = `${16 * scale}px Arial`;
    ctx.textAlign = 'center';
    
    let icon = '';
    switch (node.type) {
      case 'user': icon = '👤'; break;
      case 'role': icon = '🛡️'; break;
      case 'permission': icon = '🔑'; break;
      case 'policy': icon = '📋'; break;
    }
    
    ctx.fillText(icon, node.x, node.y + 6);
  };

  const drawEdge = (
    ctx: CanvasRenderingContext2D, 
    sourceNode: GraphNode, 
    targetNode: GraphNode, 
    edge: GraphEdge
  ) => {
    ctx.beginPath();
    ctx.moveTo(sourceNode.x, sourceNode.y);
    ctx.lineTo(targetNode.x, targetNode.y);
    ctx.strokeStyle = edge.color;
    ctx.lineWidth = edgeThickness[0] * edge.weight;
    
    // 虚线样式用于继承关系
    if (edge.type === 'inheritance') {
      ctx.setLineDash([5, 5]);
    } else {
      ctx.setLineDash([]);
    }
    
    ctx.stroke();

    // 绘制箭头
    if (scale > 0.6) {
      drawArrow(ctx, sourceNode, targetNode, edge);
    }
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    sourceNode: GraphNode,
    targetNode: GraphNode,
    edge: GraphEdge
  ) => {
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const angle = Math.atan2(dy, dx);
    
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;
    
    const endX = targetNode.x - Math.cos(angle) * targetNode.size;
    const endY = targetNode.y - Math.sin(angle) * targetNode.size;
    
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle - arrowAngle),
      endY - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle + arrowAngle),
      endY - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.strokeStyle = edge.color;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // 事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    // 检查是否点击了节点
    const clickedNode = nodes.find(node => {
      if (!shouldShowNode(node)) return false;
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= node.size;
    });

    if (clickedNode) {
      onNodeSelect?.(clickedNode.id, clickedNode.data);
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else {
      // 检查悬停的节点
      const x = (e.clientX - rect.left - offset.x) / scale;
      const y = (e.clientY - rect.top - offset.y) / scale;

      const hoveredNode = nodes.find(node => {
        if (!shouldShowNode(node)) return false;
        const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
        return distance <= node.size;
      });

      setHoveredNode(hoveredNode?.id || null);
      onNodeHover?.(hoveredNode?.id || null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = scale * (e.deltaY > 0 ? 0.9 : 1.1);
    setScale(Math.max(0.1, Math.min(3, newScale)));
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const exportGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'relationship-graph.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* 控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            图形控制面板
          </CardTitle>
          <CardDescription>
            调整图形显示和布局选项
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 显示选项 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">显示元素</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-users"
                    checked={showUsers}
                    onCheckedChange={setShowUsers}
                  />
                  <Label htmlFor="show-users" className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    用户
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-roles"
                    checked={showRoles}
                    onCheckedChange={setShowRoles}
                  />
                  <Label htmlFor="show-roles" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    角色
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-permissions"
                    checked={showPermissions}
                    onCheckedChange={setShowPermissions}
                  />
                  <Label htmlFor="show-permissions" className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-orange-500" />
                    权限
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-policies"
                    checked={showPolicies}
                    onCheckedChange={setShowPolicies}
                  />
                  <Label htmlFor="show-policies" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-500" />
                    策略
                  </Label>
                </div>
              </div>
            </div>

            {/* 关系显示 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">关系连线</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-user-role"
                    checked={showUserRoleEdges}
                    onCheckedChange={setShowUserRoleEdges}
                  />
                  <Label htmlFor="show-user-role">用户-角色</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-role-permission"
                    checked={showRolePermissionEdges}
                    onCheckedChange={setShowRolePermissionEdges}
                  />
                  <Label htmlFor="show-role-permission">角色-权限</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-policy"
                    checked={showPolicyEdges}
                    onCheckedChange={setShowPolicyEdges}
                  />
                  <Label htmlFor="show-policy">策略关联</Label>
                </div>
              </div>
            </div>

            {/* 布局和样式 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">布局和样式</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="layout">布局类型</Label>
                  <Select value={layoutType} onValueChange={(value: any) => setLayoutType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="force">力导向</SelectItem>
                      <SelectItem value="circle">圆形</SelectItem>
                      <SelectItem value="hierarchy">层次</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="node-size">节点大小: {nodeSize[0]}</Label>
                  <Slider
                    id="node-size"
                    value={nodeSize}
                    onValueChange={setNodeSize}
                    min={20}
                    max={100}
                    step={5}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edge-thickness">连线粗细: {edgeThickness[0]}</Label>
                  <Slider
                    id="edge-thickness"
                    value={edgeThickness}
                    onValueChange={setEdgeThickness}
                    min={1}
                    max={5}
                    step={0.5}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 图形显示区域 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>关联关系图</CardTitle>
              <CardDescription>
                可视化展示实体间的关联关系，支持缩放和拖拽
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">缩放: {(scale * 100).toFixed(0)}%</Badge>
              <Button variant="outline" size="sm" onClick={() => setScale(s => s * 1.2)}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setScale(s => s / 1.2)}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetView}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={exportGraph}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            ref={containerRef}
            className="border rounded-lg overflow-hidden bg-gray-50"
            style={{ height: '600px' }}
          >
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            />
          </div>
        </CardContent>
      </Card>

      {/* 图例 */}
      <Card>
        <CardHeader>
          <CardTitle>图例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm">用户</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm">角色</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-sm">权限</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-500"></div>
              <span className="text-sm">策略</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-400"></div>
              <span className="text-sm">用户-角色</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-green-400"></div>
              <span className="text-sm">角色-权限</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-purple-400"></div>
              <span className="text-sm">策略应用</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gray-400 border-dashed border-t"></div>
              <span className="text-sm">继承关系</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
