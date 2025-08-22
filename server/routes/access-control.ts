/**
 * Access Control API Routes
 * Handles access evaluation, permissions, and enforcement
 */

import express from 'express';
import { AccessControlEngine, AccessControlContext } from '../../shared/access-control';
import {
  User,
  Role,
  Permission,
  ABACPolicy,
  AccessRequest,
  AccessResponse,
  AuditLog
} from '../../shared/iam';

const router = express.Router();

// Mock data (in production, this would come from a database)
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    status: 'active',
    roles: ['admin', 'user'],
    attributes: {
      department: 'IT',
      location: 'NYC',
      clearanceLevel: 'high'
    },
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    username: 'manager',
    email: 'manager@example.com',
    firstName: 'Manager',
    lastName: 'User',
    status: 'active',
    roles: ['manager', 'user'],
    attributes: {
      department: 'Sales',
      location: 'LA',
      clearanceLevel: 'medium'
    },
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-15T09:00:00Z'
  }
];

const mockRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access',
    permissions: ['read_all', 'write_all', 'delete_all', 'manage_users', 'manage_roles'],
    isSystemRole: true,
    createdAt: '2024-01-01T00:00:00Z',
    level: 1,
    status: 'active',
    isTemplate: false,
    userCount: 1
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Management access',
    permissions: ['read_users', 'write_users', 'read_reports'],
    isSystemRole: false,
    createdAt: '2024-01-01T00:00:00Z',
    level: 2,
    status: 'active',
    isTemplate: false,
    userCount: 1
  },
  {
    id: 'user',
    name: 'User',
    description: 'Basic user access',
    permissions: ['read_own_profile', 'write_own_profile'],
    isSystemRole: false,
    createdAt: '2024-01-01T00:00:00Z',
    level: 3,
    status: 'active',
    isTemplate: false,
    userCount: 2
  }
];

const mockPermissions: Permission[] = [
  {
    id: 'read_all',
    name: 'Read All',
    resource: '*',
    action: 'read',
    description: 'Read access to all resources',
    category: 'system',
    scope: 'global',
    createdAt: '2024-01-01T00:00:00Z',
    isSystemPermission: true,
    risk: 'high',
    complianceRequired: true
  },
  {
    id: 'write_all',
    name: 'Write All',
    resource: '*',
    action: 'write',
    description: 'Write access to all resources',
    category: 'system',
    scope: 'global',
    createdAt: '2024-01-01T00:00:00Z',
    isSystemPermission: true,
    risk: 'critical',
    complianceRequired: true
  },
  {
    id: 'read_users',
    name: 'Read Users',
    resource: 'users',
    action: 'read',
    description: 'Read access to user information',
    category: 'user_management',
    scope: 'resource',
    createdAt: '2024-01-01T00:00:00Z',
    isSystemPermission: false,
    risk: 'medium',
    complianceRequired: true,
    fieldRestrictions: [
      {
        id: 'email_restriction',
        field: 'email',
        access: 'read',
        maskingRule: 'partial'
      }
    ]
  }
];

const mockPolicies: ABACPolicy[] = [
  {
    id: 'policy_1',
    name: 'Admin Full Access',
    description: 'Administrators have full access to all resources',
    rules: [
      {
        subject: [
          { attribute: 'role', operator: 'in', value: ['admin'] }
        ],
        resource: [
          { attribute: 'type', operator: 'equals', value: '*' }
        ],
        action: ['*']
      }
    ],
    effect: 'allow',
    priority: 100,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'policy_2',
    name: 'Business Hours Only',
    description: 'Access restricted to business hours',
    rules: [
      {
        subject: [
          { attribute: 'role', operator: 'not_in', value: ['admin'] }
        ],
        resource: [
          { attribute: 'type', operator: 'equals', value: 'sensitive' }
        ],
        action: ['read', 'write'],
        environment: [
          { attribute: 'time', operator: 'greater_than', value: '09:00' },
          { attribute: 'time', operator: 'less_than', value: '17:00' }
        ]
      }
    ],
    effect: 'deny',
    priority: 90,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Audit log storage
const auditLogs: AuditLog[] = [];

/**
 * Middleware to authenticate requests
 */
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // In a real implementation, verify the JWT token
  // For now, we'll just extract user ID from a simple token format
  try {
    const userId = token === 'admin-token' ? '1' : '2';
    req.userId = userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

/**
 * Get user's access control context
 */
async function getUserContext(userId: string): Promise<AccessControlContext> {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    throw new Error('User not found');
  }

  const userRoles = mockRoles.filter(role => user.roles.includes(role.id));
  const userPermissions = mockPermissions.filter(perm => 
    userRoles.some(role => role.permissions.includes(perm.id))
  );

  return {
    user,
    roles: userRoles,
    permissions: userPermissions,
    policies: mockPolicies,
    requestTime: new Date()
  };
}

/**
 * Log access attempt for audit
 */
function logAccess(
  userId: string,
  resource: string,
  action: string,
  result: 'success' | 'failure',
  reason: string,
  req: any
) {
  const auditLog: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    action: `${action}_${resource}`,
    resource,
    result,
    details: { reason, timestamp: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown'
  };

  auditLogs.push(auditLog);
  
  // Keep only last 1000 logs in memory
  if (auditLogs.length > 1000) {
    auditLogs.splice(0, auditLogs.length - 1000);
  }
}

// Routes

/**
 * Evaluate access request
 */
router.post('/evaluate', authenticateToken, async (req, res) => {
  try {
    const request: AccessRequest = req.body;
    const context = await getUserContext(req.userId);

    // Add request context
    context.clientIp = req.ip;
    context.userAgent = req.get('User-Agent');
    context.environment = {
      ...context.environment,
      time: new Date().getHours().toString().padStart(2, '0') + ':00'
    };

    const result = await AccessControlEngine.evaluate(request, context);

    // Log the access attempt
    logAccess(
      req.userId,
      request.resource,
      request.action,
      result.allowed ? 'success' : 'failure',
      result.reason,
      req
    );

    res.json(result);
  } catch (error) {
    console.error('Access evaluation error:', error);
    res.status(500).json({
      allowed: false,
      reason: 'Internal server error during access evaluation',
      appliedPolicies: []
    });
  }
});

/**
 * Get user's roles
 */
router.get('/users/:userId/roles', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const roles = mockRoles.filter(role => user.roles.includes(role.id));
    res.json({ roles });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get user's effective permissions
 */
router.get('/users/:userId/permissions', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRoles = mockRoles.filter(role => user.roles.includes(role.id));
    const permissionIds = new Set<string>();
    
    userRoles.forEach(role => {
      role.permissions.forEach(permId => permissionIds.add(permId));
      if (role.inheritedPermissions) {
        role.inheritedPermissions.forEach(permId => permissionIds.add(permId));
      }
    });

    const permissions = mockPermissions.filter(perm => permissionIds.has(perm.id));
    res.json({ permissions });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get active policies
 */
router.get('/policies', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let policies = mockPolicies;
    
    if (status) {
      policies = policies.filter(policy => policy.status === status);
    }

    res.json({ policies });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get access control context for user
 */
router.get('/context', authenticateToken, async (req, res) => {
  try {
    const context = await getUserContext(req.userId);
    res.json(context);
  } catch (error) {
    console.error('Error fetching context:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get audit logs
 */
router.get('/audit-logs', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, resource, action } = req.query;
    
    let filteredLogs = auditLogs;
    
    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }
    
    if (resource) {
      filteredLogs = filteredLogs.filter(log => log.resource === resource);
    }
    
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action.includes(action as string));
    }

    const total = filteredLogs.length;
    const start = (Number(page) - 1) * Number(limit);
    const logs = filteredLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(start, start + Number(limit));

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Middleware factory for protecting API endpoints
 */
export function requirePermission(resource: string, action: string) {
  return async (req: any, res: any, next: any) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const context = await getUserContext(req.userId);
      context.clientIp = req.ip;
      context.userAgent = req.get('User-Agent');

      const request: AccessRequest = {
        userId: req.userId,
        resource,
        action,
        context: req.body || {}
      };

      const result = await AccessControlEngine.evaluate(request, context);

      // Log the access attempt
      logAccess(
        req.userId,
        resource,
        action,
        result.allowed ? 'success' : 'failure',
        result.reason,
        req
      );

      if (!result.allowed) {
        return res.status(403).json({
          error: 'Access denied',
          reason: result.reason,
          appliedPolicies: result.appliedPolicies
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Internal server error during permission check' });
    }
  };
}

/**
 * Middleware factory for protecting API endpoints with role
 */
export function requireRole(roleName: string) {
  return async (req: any, res: any, next: any) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = mockUsers.find(u => u.id === req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const role = mockRoles.find(r => r.name === roleName);
      if (!role || !user.roles.includes(role.id)) {
        return res.status(403).json({ 
          error: 'Access denied',
          reason: `Required role '${roleName}' not found`
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Internal server error during role check' });
    }
  };
}

export default router;
