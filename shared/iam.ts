/**
 * IAM System Types and Interfaces
 * Shared between client and server for type safety
 */

// User Management Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'suspended';
  roles: string[];
  attributes: Record<string, any>;
  createdAt: string;
  lastLogin?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roles: string[];
  attributes?: Record<string, any>;
}

// Role Management Types (RBAC)
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
  createdAt: string;
  updatedAt?: string;
  // Hierarchy and inheritance
  parentRole?: string;
  childRoles?: string[];
  inheritedPermissions?: string[];
  // Organizational structure
  organizationUnit?: string;
  level: number;
  // Temporal assignments
  validFrom?: string;
  validUntil?: string;
  // Workflow and approval
  status: 'active' | 'pending' | 'inactive' | 'deprecated';
  approvedBy?: string;
  approvedAt?: string;
  // Analytics
  userCount?: number;
  lastUsed?: string;
  // Attributes for dynamic assignment
  autoAssignmentRules?: RoleAssignmentRule[];
  // Template information
  isTemplate: boolean;
  templateCategory?: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
  parentRole?: string;
  organizationUnit?: string;
  validFrom?: string;
  validUntil?: string;
  autoAssignmentRules?: RoleAssignmentRule[];
  isTemplate?: boolean;
  templateCategory?: string;
}

// Role hierarchy and inheritance
export interface RoleHierarchy {
  id: string;
  parentId: string;
  childId: string;
  inheritanceType: 'full' | 'partial' | 'none';
  createdAt: string;
}

// Dynamic role assignment rules
export interface RoleAssignmentRule {
  id: string;
  name: string;
  condition: AttributeCondition[];
  action: 'assign' | 'unassign';
  priority: number;
  isActive: boolean;
}

// Role templates and presets
export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  permissions: string[];
  organizationUnit?: string;
  level: number;
  isBuiltIn: boolean;
  usageCount: number;
}

// Role conflicts
export interface RoleConflict {
  id: string;
  type: 'permission_overlap' | 'hierarchy_violation' | 'separation_of_duties';
  severity: 'low' | 'medium' | 'high' | 'critical';
  roles: string[];
  description: string;
  suggestion: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

// Role approval workflow
export interface RoleApprovalRequest {
  id: string;
  type: 'create' | 'update' | 'delete' | 'assignment';
  roleId: string;
  requestedBy: string;
  requestedAt: string;
  approvers: string[];
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string;
  approvalHistory: ApprovalStep[];
}

export interface ApprovalStep {
  id: string;
  approverId: string;
  action: 'approved' | 'rejected' | 'pending';
  timestamp: string;
  comments?: string;
}

// Role analytics
export interface RoleAnalytics {
  roleId: string;
  userCount: number;
  permissionCount: number;
  inheritedPermissionCount: number;
  usageMetrics: {
    lastUsed: string;
    frequency: 'high' | 'medium' | 'low' | 'unused';
    averageSessionDuration: number;
  };
  complianceScore: number;
  conflicts: number;
  recommendations: string[];
}

// Permission Management Types
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  category: string;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  attributes: Record<string, any>;
}

// ABAC Policy Types
export interface ABACPolicy {
  id: string;
  name: string;
  description: string;
  rules: PolicyRule[];
  effect: 'allow' | 'deny';
  priority: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface PolicyRule {
  subject: AttributeCondition[];
  resource: AttributeCondition[];
  action: string[];
  environment?: AttributeCondition[];
}

export interface AttributeCondition {
  attribute: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
}

// Access Control Types
export interface AccessRequest {
  userId: string;
  resource: string;
  action: string;
  context?: Record<string, any>;
}

export interface AccessResponse {
  allowed: boolean;
  reason: string;
  appliedPolicies: string[];
}

// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  result: 'success' | 'failure';
  details: Record<string, any>;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

// Dashboard Analytics Types
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalPermissions: number;
  totalPolicies: number;
  recentLogins: number;
  failedLogins: number;
}
