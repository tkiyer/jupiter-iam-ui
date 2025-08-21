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
  // Granular and context-based permissions
  conditions?: PermissionCondition[];
  fieldRestrictions?: FieldRestriction[];
  apiEndpoints?: string[];
  scope: 'global' | 'resource' | 'field' | 'api';
  // Permission hierarchy and delegation
  parentPermission?: string;
  canDelegate: boolean;
  delegatedBy?: string;
  delegatedAt?: string;
  // Metadata and analytics
  createdAt: string;
  updatedAt?: string;
  usageCount?: number;
  lastUsed?: string;
  isSystemPermission: boolean;
  isDeprecated?: boolean;
  // Optimization and cleanup
  risk: 'low' | 'medium' | 'high' | 'critical';
  complianceRequired: boolean;
  autoCleanupDate?: string;
}

// Permission conditions for context-based access
export interface PermissionCondition {
  id: string;
  type: 'time' | 'location' | 'device' | 'attribute' | 'custom';
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  field: string;
  value: any;
  description: string;
}

// Field-level permission restrictions
export interface FieldRestriction {
  id: string;
  field: string;
  access: 'read' | 'write' | 'none';
  conditions?: PermissionCondition[];
  maskingRule?: 'none' | 'partial' | 'full' | 'hash';
}

// Permission categories and grouping
export interface PermissionCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  parentCategory?: string;
  permissions: string[];
  isSystemCategory: boolean;
}

// Resource definitions for resource-based access control
export interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  attributes: Record<string, any>;
  // API endpoint mapping
  endpoints?: ResourceEndpoint[];
  // Field definitions
  fields?: ResourceField[];
  // Access patterns
  accessPatterns?: AccessPattern[];
  createdAt: string;
  updatedAt?: string;
}

// API endpoint definitions
export interface ResourceEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  requiredPermissions: string[];
  rateLimit?: number;
  authRequired: boolean;
}

// Resource field definitions
export interface ResourceField {
  id: string;
  name: string;
  type: string;
  sensitive: boolean;
  piiType?: 'email' | 'phone' | 'ssn' | 'cc' | 'custom';
  defaultAccess: 'read' | 'write' | 'none';
  validationRules?: string[];
}

// Access patterns for analytics
export interface AccessPattern {
  id: string;
  userId: string;
  action: string;
  frequency: number;
  lastAccess: string;
  anomalyScore: number;
}

// Permission analytics and reporting
export interface PermissionAnalytics {
  permissionId: string;
  usageStats: {
    totalUses: number;
    uniqueUsers: number;
    lastUsed: string;
    averageDaily: number;
    peakUsage: string;
  };
  riskMetrics: {
    riskScore: number;
    sensitiveDataAccess: boolean;
    privilegeEscalation: boolean;
    unusualAccess: boolean;
  };
  complianceStatus: {
    isCompliant: boolean;
    violations: string[];
    auditReady: boolean;
  };
  recommendations: string[];
}

// Permission delegation tracking
export interface PermissionDelegation {
  id: string;
  permissionId: string;
  delegatedBy: string;
  delegatedTo: string;
  delegatedAt: string;
  expiresAt?: string;
  conditions?: PermissionCondition[];
  reason: string;
  status: 'active' | 'expired' | 'revoked';
}

// Permission optimization suggestions
export interface PermissionOptimization {
  id: string;
  type: 'cleanup' | 'consolidation' | 'deprecation' | 'risk_reduction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  permissions: string[];
  description: string;
  recommendation: string;
  estimatedImpact: string;
  autoApplicable: boolean;
}

// Permission usage tracking
export interface PermissionUsage {
  id: string;
  permissionId: string;
  userId: string;
  resourceId?: string;
  action: string;
  timestamp: string;
  context: Record<string, any>;
  result: 'granted' | 'denied' | 'error';
  reason?: string;
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
