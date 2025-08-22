/**
 * Access Control Engine
 * Evaluates RBAC and ABAC policies to determine access permissions
 */

import {
  User,
  Role,
  Permission,
  ABACPolicy,
  PolicyRule,
  AttributeCondition,
  AccessRequest,
  AccessResponse,
  PermissionCondition,
  FieldRestriction
} from './iam.js';

export interface AccessControlContext {
  user: User;
  roles: Role[];
  permissions: Permission[];
  policies: ABACPolicy[];
  requestTime: Date;
  clientIp?: string;
  userAgent?: string;
  environment?: Record<string, any>;
}

export class AccessControlEngine {
  /**
   * Main access control evaluation method
   */
  static async evaluate(
    request: AccessRequest,
    context: AccessControlContext
  ): Promise<AccessResponse> {
    try {
      // First, check RBAC permissions
      const rbacResult = this.evaluateRBAC(request, context);
      
      // Then, check ABAC policies
      const abacResult = this.evaluateABAC(request, context);
      
      // Combine results (DENY takes precedence)
      const finalResult = this.combineResults(rbacResult, abacResult);
      
      return finalResult;
    } catch (error) {
      return {
        allowed: false,
        reason: `Access evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        appliedPolicies: []
      };
    }
  }

  /**
   * Evaluate RBAC permissions
   */
  private static evaluateRBAC(
    request: AccessRequest,
    context: AccessControlContext
  ): AccessResponse {
    const userRoles = context.user.roles;
    const userRoleObjects = context.roles.filter(role => userRoles.includes(role.id));
    
    // Get all permissions from user's roles
    const userPermissions = new Set<string>();
    userRoleObjects.forEach(role => {
      role.permissions.forEach(permId => userPermissions.add(permId));
      // Include inherited permissions
      if (role.inheritedPermissions) {
        role.inheritedPermissions.forEach(permId => userPermissions.add(permId));
      }
    });

    // Find matching permissions for the request
    const matchingPermissions = context.permissions.filter(perm => 
      userPermissions.has(perm.id) &&
      this.matchesResourceAction(perm, request.resource, request.action)
    );

    if (matchingPermissions.length === 0) {
      return {
        allowed: false,
        reason: 'No matching RBAC permissions found',
        appliedPolicies: []
      };
    }

    // Check conditions on matching permissions
    for (const permission of matchingPermissions) {
      if (permission.conditions && permission.conditions.length > 0) {
        const conditionsMet = this.evaluatePermissionConditions(
          permission.conditions,
          request,
          context
        );
        if (!conditionsMet) {
          continue; // Try next permission
        }
      }
      
      return {
        allowed: true,
        reason: `RBAC permission granted: ${permission.name}`,
        appliedPolicies: [permission.id]
      };
    }

    return {
      allowed: false,
      reason: 'RBAC permission conditions not met',
      appliedPolicies: []
    };
  }

  /**
   * Evaluate ABAC policies
   */
  private static evaluateABAC(
    request: AccessRequest,
    context: AccessControlContext
  ): AccessResponse {
    const applicablePolicies = context.policies
      .filter(policy => policy.status === 'active')
      .sort((a, b) => b.priority - a.priority); // Higher priority first

    const appliedPolicies: string[] = [];
    
    for (const policy of applicablePolicies) {
      const policyMatches = this.evaluatePolicy(policy, request, context);
      
      if (policyMatches) {
        appliedPolicies.push(policy.id);
        
        if (policy.effect === 'deny') {
          return {
            allowed: false,
            reason: `Access denied by ABAC policy: ${policy.name}`,
            appliedPolicies
          };
        } else if (policy.effect === 'allow') {
          return {
            allowed: true,
            reason: `Access allowed by ABAC policy: ${policy.name}`,
            appliedPolicies
          };
        }
      }
    }

    return {
      allowed: false,
      reason: 'No applicable ABAC policies found',
      appliedPolicies
    };
  }

  /**
   * Evaluate a single ABAC policy
   */
  private static evaluatePolicy(
    policy: ABACPolicy,
    request: AccessRequest,
    context: AccessControlContext
  ): boolean {
    return policy.rules.some(rule => this.evaluateRule(rule, request, context));
  }

  /**
   * Evaluate a single policy rule
   */
  private static evaluateRule(
    rule: PolicyRule,
    request: AccessRequest,
    context: AccessControlContext
  ): boolean {
    // Check subject conditions (user attributes)
    const subjectMatch = this.evaluateAttributeConditions(
      rule.subject,
      context.user.attributes,
      context
    );
    
    // Check resource conditions
    const resourceMatch = this.evaluateAttributeConditions(
      rule.resource,
      { name: request.resource, ...request.context },
      context
    );
    
    // Check action
    const actionMatch = rule.action.includes(request.action) || rule.action.includes('*');
    
    // Check environment conditions
    const environmentMatch = rule.environment 
      ? this.evaluateAttributeConditions(rule.environment, context.environment || {}, context)
      : true;

    return subjectMatch && resourceMatch && actionMatch && environmentMatch;
  }

  /**
   * Evaluate attribute conditions
   */
  private static evaluateAttributeConditions(
    conditions: AttributeCondition[],
    attributes: Record<string, any>,
    context: AccessControlContext
  ): boolean {
    if (conditions.length === 0) return true;
    
    return conditions.every(condition => {
      const attributeValue = this.getAttributeValue(condition.attribute, attributes, context);
      return this.evaluateCondition(condition, attributeValue);
    });
  }

  /**
   * Get attribute value from various sources
   */
  private static getAttributeValue(
    attribute: string,
    attributes: Record<string, any>,
    context: AccessControlContext
  ): any {
    // Check in provided attributes
    if (attributes.hasOwnProperty(attribute)) {
      return attributes[attribute];
    }
    
    // Check special attributes
    switch (attribute) {
      case 'current_time':
        return context.requestTime.toISOString();
      case 'user_id':
        return context.user.id;
      case 'user_roles':
        return context.user.roles;
      case 'client_ip':
        return context.clientIp;
      default:
        return undefined;
    }
  }

  /**
   * Evaluate a single condition
   */
  private static evaluateCondition(condition: AttributeCondition, value: any): boolean {
    const { operator, value: expectedValue } = condition;
    
    switch (operator) {
      case 'equals':
        return value === expectedValue;
      case 'not_equals':
        return value !== expectedValue;
      case 'contains':
        return String(value).toLowerCase().includes(String(expectedValue).toLowerCase());
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(value);
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(value);
      case 'greater_than':
        return Number(value) > Number(expectedValue);
      case 'less_than':
        return Number(value) < Number(expectedValue);
      default:
        return false;
    }
  }

  /**
   * Evaluate permission conditions
   */
  private static evaluatePermissionConditions(
    conditions: PermissionCondition[],
    request: AccessRequest,
    context: AccessControlContext
  ): boolean {
    return conditions.every(condition => {
      let value: any;
      
      switch (condition.type) {
        case 'time':
          value = context.requestTime.toISOString();
          break;
        case 'location':
          value = context.clientIp;
          break;
        case 'device':
          value = context.userAgent;
          break;
        case 'attribute':
          value = context.user.attributes[condition.field];
          break;
        case 'custom':
          value = request.context?.[condition.field];
          break;
        default:
          return false;
      }
      
      return this.evaluateCondition(
        { attribute: condition.field, operator: condition.operator, value: condition.value },
        value
      );
    });
  }

  /**
   * Check if permission matches resource and action
   */
  private static matchesResourceAction(
    permission: Permission,
    resource: string,
    action: string
  ): boolean {
    const resourceMatch = permission.resource === resource || permission.resource === '*';
    const actionMatch = permission.action === action || permission.action === '*';
    return resourceMatch && actionMatch;
  }

  /**
   * Combine RBAC and ABAC results
   */
  private static combineResults(
    rbacResult: AccessResponse,
    abacResult: AccessResponse
  ): AccessResponse {
    // If either explicitly denies, deny access
    if (rbacResult.reason.includes('denied') || abacResult.reason.includes('denied')) {
      return {
        allowed: false,
        reason: rbacResult.reason.includes('denied') ? rbacResult.reason : abacResult.reason,
        appliedPolicies: [...rbacResult.appliedPolicies, ...abacResult.appliedPolicies]
      };
    }
    
    // If either allows, allow access
    if (rbacResult.allowed || abacResult.allowed) {
      return {
        allowed: true,
        reason: rbacResult.allowed ? rbacResult.reason : abacResult.reason,
        appliedPolicies: [...rbacResult.appliedPolicies, ...abacResult.appliedPolicies]
      };
    }
    
    // Otherwise, deny
    return {
      allowed: false,
      reason: 'Access denied by both RBAC and ABAC',
      appliedPolicies: [...rbacResult.appliedPolicies, ...abacResult.appliedPolicies]
    };
  }

  /**
   * Check field-level access
   */
  static checkFieldAccess(
    fieldName: string,
    accessType: 'read' | 'write',
    permissions: Permission[],
    context: AccessControlContext
  ): { allowed: boolean; masked: boolean; maskingRule?: string } {
    for (const permission of permissions) {
      if (permission.fieldRestrictions) {
        const restriction = permission.fieldRestrictions.find(r => r.field === fieldName);
        if (restriction) {
          const hasAccess = restriction.access === accessType || restriction.access === 'write';
          const masked = restriction.maskingRule && restriction.maskingRule !== 'none';
          
          return {
            allowed: hasAccess,
            masked: !!masked,
            maskingRule: restriction.maskingRule
          };
        }
      }
    }
    
    return { allowed: false, masked: false };
  }

  /**
   * Apply field masking
   */
  static applyFieldMasking(value: any, maskingRule: string): any {
    if (!value) return value;
    
    const stringValue = String(value);
    
    switch (maskingRule) {
      case 'partial':
        if (stringValue.length <= 4) return '*'.repeat(stringValue.length);
        return stringValue.slice(0, 2) + '*'.repeat(stringValue.length - 4) + stringValue.slice(-2);
      case 'full':
        return '*'.repeat(stringValue.length);
      case 'hash':
        // Simple hash for demo - use proper hashing in production
        return `#${stringValue.length}${stringValue.charCodeAt(0)}`;
      default:
        return value;
    }
  }
}

// Utility functions for common access checks
export class AccessControlUtils {
  /**
   * Check if user has permission for a specific action on a resource
   */
  static async hasPermission(
    userId: string,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    // This would be called with actual context data in a real implementation
    // For now, return a simple check based on mock data
    return true; // Placeholder
  }

  /**
   * Get user's effective permissions
   */
  static getEffectivePermissions(user: User, roles: Role[], permissions: Permission[]): Permission[] {
    const userRoles = roles.filter(role => user.roles.includes(role.id));
    const permissionIds = new Set<string>();
    
    userRoles.forEach(role => {
      role.permissions.forEach(permId => permissionIds.add(permId));
      if (role.inheritedPermissions) {
        role.inheritedPermissions.forEach(permId => permissionIds.add(permId));
      }
    });
    
    return permissions.filter(perm => permissionIds.has(perm.id));
  }

  /**
   * Check if user has role
   */
  static hasRole(user: User, roleName: string, roles: Role[]): boolean {
    const role = roles.find(r => r.name === roleName);
    return role ? user.roles.includes(role.id) : false;
  }

  /**
   * Check if user has any of the specified roles
   */
  static hasAnyRole(user: User, roleNames: string[], roles: Role[]): boolean {
    return roleNames.some(roleName => this.hasRole(user, roleName, roles));
  }
}
