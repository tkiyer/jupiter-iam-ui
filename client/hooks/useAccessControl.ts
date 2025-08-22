/**
 * React hooks for access control enforcement
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AccessControlEngine, AccessControlContext, AccessControlUtils } from '../../shared/access-control';
import {
  User,
  Role,
  Permission,
  ABACPolicy,
  AccessRequest,
  AccessResponse
} from '../../shared/iam';

// Hook for checking permissions
export function usePermission(resource: string, action: string, context?: Record<string, any>) {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    if (!user) {
      setHasPermission(false);
      setLoading(false);
      setReason('User not authenticated');
      return;
    }

    checkPermission();
  }, [user, resource, action, JSON.stringify(context)]);

  const checkPermission = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await evaluateAccess({
        userId: user.id,
        resource,
        action,
        context
      });
      
      setHasPermission(result.allowed);
      setReason(result.reason);
    } catch (error) {
      setHasPermission(false);
      setReason(`Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return { hasPermission, loading, reason, refetch: checkPermission };
}

// Hook for checking multiple permissions
export function usePermissions(permissions: Array<{ resource: string; action: string; context?: Record<string, any> }>) {
  const { user } = useAuth();
  const [results, setResults] = useState<Record<string, { allowed: boolean; reason: string }>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    checkPermissions();
  }, [user, JSON.stringify(permissions)]);

  const checkPermissions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const results: Record<string, { allowed: boolean; reason: string }> = {};
      
      for (const perm of permissions) {
        const key = `${perm.resource}:${perm.action}`;
        const result = await evaluateAccess({
          userId: user.id,
          resource: perm.resource,
          action: perm.action,
          context: perm.context
        });
        
        results[key] = {
          allowed: result.allowed,
          reason: result.reason
        };
      }
      
      setResults(results);
    } catch (error) {
      console.error('Permission check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = useCallback((resource: string, action: string) => {
    const key = `${resource}:${action}`;
    return results[key]?.allowed || false;
  }, [results]);

  return { results, loading, hasPermission, refetch: checkPermissions };
}

// Hook for role-based access
export function useRole(roleName: string) {
  const { user } = useAuth();
  const [hasRole, setHasRole] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setHasRole(false);
      setLoading(false);
      return;
    }

    checkRole();
  }, [user, roleName]);

  const checkRole = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch user's roles and check
      const roles = await fetchUserRoles(user.id);
      const userHasRole = AccessControlUtils.hasRole(user, roleName, roles);
      setHasRole(userHasRole);
    } catch (error) {
      setHasRole(false);
      console.error('Role check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return { hasRole, loading, refetch: checkRole };
}

// Hook for field-level access control
export function useFieldAccess(fieldName: string, accessType: 'read' | 'write' = 'read') {
  const { user } = useAuth();
  const [fieldAccess, setFieldAccess] = useState<{
    allowed: boolean;
    masked: boolean;
    maskingRule?: string;
  }>({ allowed: false, masked: false });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    checkFieldAccess();
  }, [user, fieldName, accessType]);

  const checkFieldAccess = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [permissions, roles] = await Promise.all([
        fetchUserPermissions(user.id),
        fetchUserRoles(user.id)
      ]);

      const context: AccessControlContext = {
        user,
        roles,
        permissions,
        policies: [],
        requestTime: new Date()
      };

      const result = AccessControlEngine.checkFieldAccess(
        fieldName,
        accessType,
        permissions,
        context
      );

      setFieldAccess(result);
    } catch (error) {
      setFieldAccess({ allowed: false, masked: false });
      console.error('Field access check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyMasking = useCallback((value: any) => {
    if (!fieldAccess.masked || !fieldAccess.maskingRule) {
      return value;
    }
    return AccessControlEngine.applyFieldMasking(value, fieldAccess.maskingRule);
  }, [fieldAccess]);

  return { ...fieldAccess, loading, applyMasking, refetch: checkFieldAccess };
}

// Hook for access control context
export function useAccessControlContext() {
  const { user } = useAuth();
  const [context, setContext] = useState<AccessControlContext | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setContext(null);
      setLoading(false);
      return;
    }

    loadContext();
  }, [user]);

  const loadContext = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [roles, permissions, policies] = await Promise.all([
        fetchUserRoles(user.id),
        fetchUserPermissions(user.id),
        fetchActivePolicies()
      ]);

      const accessContext: AccessControlContext = {
        user,
        roles,
        permissions,
        policies,
        requestTime: new Date(),
        environment: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform
        }
      };

      setContext(accessContext);
    } catch (error) {
      console.error('Failed to load access control context:', error);
      setContext(null);
    } finally {
      setLoading(false);
    }
  };

  return { context, loading, refetch: loadContext };
}

// Utility functions for API calls
async function evaluateAccess(request: AccessRequest): Promise<AccessResponse> {
  try {
    const response = await fetch('/api/access-control/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Access evaluation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Access evaluation error:', error);
    return {
      allowed: false,
      reason: `Evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      appliedPolicies: []
    };
  }
}

async function fetchUserRoles(userId: string): Promise<Role[]> {
  try {
    const response = await fetch(`/api/users/${userId}/roles`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user roles');
    }

    const data = await response.json();
    return data.roles || [];
  } catch (error) {
    console.error('Failed to fetch user roles:', error);
    return [];
  }
}

async function fetchUserPermissions(userId: string): Promise<Permission[]> {
  try {
    const response = await fetch(`/api/users/${userId}/permissions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user permissions');
    }

    const data = await response.json();
    return data.permissions || [];
  } catch (error) {
    console.error('Failed to fetch user permissions:', error);
    return [];
  }
}

async function fetchActivePolicies(): Promise<ABACPolicy[]> {
  try {
    const response = await fetch('/api/policies?status=active', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active policies');
    }

    const data = await response.json();
    return data.policies || [];
  } catch (error) {
    console.error('Failed to fetch active policies:', error);
    return [];
  }
}
