/**
 * Access Control Guard Components
 * Protect UI elements and routes based on permissions and roles
 */

import React from 'react';
import { usePermission, useRole, usePermissions, useFieldAccess } from '../../hooks/useAccessControl';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { AlertTriangle, Lock, Eye, EyeOff } from 'lucide-react';

// Props for permission-based guards
interface PermissionGuardProps {
  resource: string;
  action: string;
  context?: Record<string, any>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showReason?: boolean;
  loading?: React.ReactNode;
}

// Props for role-based guards
interface RoleGuardProps {
  role: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showReason?: boolean;
  loading?: React.ReactNode;
}

// Props for multiple permissions guard
interface MultiPermissionGuardProps {
  permissions: Array<{ resource: string; action: string; context?: Record<string, any> }>;
  operator?: 'AND' | 'OR';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showReason?: boolean;
  loading?: React.ReactNode;
}

// Props for field access guard
interface FieldGuardProps {
  fieldName: string;
  accessType?: 'read' | 'write';
  children: React.ReactNode | ((value: any, applyMasking: (value: any) => any) => React.ReactNode);
  value?: any;
  fallback?: React.ReactNode;
  showMasking?: boolean;
}

/**
 * Guard component that protects content based on a single permission
 */
export function PermissionGuard({
  resource,
  action,
  context,
  children,
  fallback,
  showReason = false,
  loading
}: PermissionGuardProps) {
  const { hasPermission, loading: isLoading, reason } = usePermission(resource, action, context);

  if (isLoading) {
    return loading || <Skeleton className="h-4 w-full" />;
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showReason) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied: {reason}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
}

/**
 * Guard component that protects content based on user role
 */
export function RoleGuard({
  role,
  children,
  fallback,
  showReason = false,
  loading
}: RoleGuardProps) {
  const { hasRole, loading: isLoading } = useRole(role);

  if (isLoading) {
    return loading || <Skeleton className="h-4 w-full" />;
  }

  if (!hasRole) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showReason) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied: Required role '{role}' not found
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
}

/**
 * Guard component that protects content based on multiple permissions
 */
export function MultiPermissionGuard({
  permissions,
  operator = 'AND',
  children,
  fallback,
  showReason = false,
  loading
}: MultiPermissionGuardProps) {
  const { results, loading: isLoading, hasPermission } = usePermissions(permissions);

  if (isLoading) {
    return loading || <Skeleton className="h-4 w-full" />;
  }

  // Check permissions based on operator
  const hasAccess = operator === 'AND'
    ? permissions.every(perm => hasPermission(perm.resource, perm.action))
    : permissions.some(perm => hasPermission(perm.resource, perm.action));

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showReason) {
      const failedPermissions = permissions.filter(perm => 
        !hasPermission(perm.resource, perm.action)
      );

      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied: Missing required permissions
            <div className="mt-2 space-y-1">
              {failedPermissions.map((perm, index) => (
                <div key={index} className="text-sm">
                  • {perm.resource}:{perm.action}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
}

/**
 * Guard component for field-level access control with masking
 */
export function FieldGuard({
  fieldName,
  accessType = 'read',
  children,
  value,
  fallback,
  showMasking = true
}: FieldGuardProps) {
  const { allowed, masked, loading, applyMasking } = useFieldAccess(fieldName, accessType);

  if (loading) {
    return <Skeleton className="h-4 w-20" />;
  }

  if (!allowed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Lock className="h-3 w-3" />
        <span className="text-xs">Access restricted</span>
      </div>
    );
  }

  // If it's a function, call it with value and masking function
  if (typeof children === 'function') {
    return children(value, applyMasking);
  }

  // If we have a value and masking is applied, show masking indicator
  if (value !== undefined && masked && showMasking) {
    const maskedValue = applyMasking(value);
    return (
      <div className="flex items-center gap-2">
        <span>{maskedValue}</span>
        <Badge variant="outline" className="text-xs">
          <EyeOff className="h-3 w-3 mr-1" />
          Masked
        </Badge>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Higher-order component for protecting entire components
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  resource: string,
  action: string,
  context?: Record<string, any>
) {
  return function PermissionProtectedComponent(props: P) {
    return (
      <PermissionGuard resource={resource} action={action} context={context} showReason>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
}

/**
 * Higher-order component for protecting components with role
 */
export function withRole<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  role: string
) {
  return function RoleProtectedComponent(props: P) {
    return (
      <RoleGuard role={role} showReason>
        <WrappedComponent {...props} />
      </RoleGuard>
    );
  };
}

/**
 * Conditional rendering component based on permissions
 */
interface ConditionalRenderProps {
  when: {
    resource?: string;
    action?: string;
    role?: string;
    context?: Record<string, any>;
  };
  children: React.ReactNode;
  otherwise?: React.ReactNode;
}

export function ConditionalRender({
  when,
  children,
  otherwise
}: ConditionalRenderProps) {
  if (when.resource && when.action) {
    return (
      <PermissionGuard
        resource={when.resource}
        action={when.action}
        context={when.context}
        fallback={otherwise}
      >
        {children}
      </PermissionGuard>
    );
  }

  if (when.role) {
    return (
      <RoleGuard role={when.role} fallback={otherwise}>
        {children}
      </RoleGuard>
    );
  }

  // If no valid conditions, show otherwise or nothing
  return <>{otherwise}</>;
}

/**
 * Access control indicator component
 */
interface AccessIndicatorProps {
  resource: string;
  action: string;
  context?: Record<string, any>;
  showText?: boolean;
  variant?: 'badge' | 'icon';
}

export function AccessIndicator({
  resource,
  action,
  context,
  showText = true,
  variant = 'badge'
}: AccessIndicatorProps) {
  const { hasPermission, loading, reason } = usePermission(resource, action, context);

  if (loading) {
    return <Skeleton className="h-5 w-16" />;
  }

  if (variant === 'icon') {
    return hasPermission ? (
      <Eye className="h-4 w-4 text-green-600" title={reason} />
    ) : (
      <EyeOff className="h-4 w-4 text-red-600" title={reason} />
    );
  }

  return (
    <Badge 
      variant={hasPermission ? 'default' : 'destructive'}
      title={reason}
    >
      {hasPermission ? 'Allowed' : 'Denied'}
      {showText && (
        <span className="ml-1 text-xs">
          ({resource}:{action})
        </span>
      )}
    </Badge>
  );
}

/**
 * Debug component for access control (development only)
 */
interface AccessDebugProps {
  resource: string;
  action: string;
  context?: Record<string, any>;
}

export function AccessDebug({ resource, action, context }: AccessDebugProps) {
  const { hasPermission, loading, reason } = usePermission(resource, action, context);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="p-2 border border-dashed border-gray-300 rounded text-xs bg-gray-50">
      <div className="font-mono">
        <div>Resource: {resource}</div>
        <div>Action: {action}</div>
        <div>Context: {JSON.stringify(context || {})}</div>
        <div>Loading: {loading.toString()}</div>
        <div>Allowed: {hasPermission.toString()}</div>
        <div>Reason: {reason}</div>
      </div>
    </div>
  );
}
