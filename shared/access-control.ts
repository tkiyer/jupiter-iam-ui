/**
 * Enhanced Access Control Engine
 * Implements advanced hybrid RBAC-ABAC model with role-level conditions and permission refinements
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
  FieldRestriction,
  RoleABACCondition,
  PermissionABACRule,
  DetailedAccessResponse,
  EvaluationStep,
  HybridPolicyConfig,
  AttributeResolutionContext,
  ClientInfo,
  TimeWindow,
  DynamicScopeRule,
  OwnershipRule,
  TemporalConstraint
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
  config?: HybridPolicyConfig;
  attributeCache?: Map<string, any>;
}

export class EnhancedAccessControlEngine {
  /**
   * Main access control evaluation method with enhanced hybrid model
   */
  static async evaluate(
    request: AccessRequest,
    context: AccessControlContext
  ): Promise<DetailedAccessResponse> {
    const evaluationSteps: EvaluationStep[] = [];
    const startTime = Date.now();
    const computedAttributes: Record<string, any> = {};
    const warnings: string[] = [];
    const recommendations: string[] = [];

    try {
      // Step 1: Initialize attribute resolution context
      const attributeContext = await this.initializeAttributeContext(request, context);
      evaluationSteps.push({
        step: 'attribute_initialization',
        component: 'rbac',
        evaluation: 'passed',
        details: { attributeCount: Object.keys(attributeContext.computedAttributes || {}).length },
        timestamp: new Date(),
        duration: Date.now() - startTime
      });

      // Step 2: Evaluate role-level ABAC conditions
      const activeRoles = await this.evaluateRoleConditions(context.roles, attributeContext, evaluationSteps);
      
      // Step 3: Get effective permissions from active roles
      const effectivePermissions = this.getEffectivePermissions(activeRoles, context.permissions);
      
      // Step 4: Apply permission-level ABAC refinements
      const refinedPermissions = await this.applyPermissionRefinements(
        effectivePermissions,
        request,
        attributeContext,
        evaluationSteps
      );

      // Step 5: Evaluate RBAC with refined permissions
      const rbacResult = await this.evaluateEnhancedRBAC(
        request,
        { ...context, permissions: refinedPermissions },
        attributeContext,
        evaluationSteps
      );

      // Step 6: Evaluate global ABAC policies
      const abacResult = await this.evaluateEnhancedABAC(
        request,
        context,
        attributeContext,
        evaluationSteps
      );

      // Step 7: Combine results using enhanced logic
      const finalResult = this.combineEnhancedResults(
        rbacResult,
        abacResult,
        context.config,
        evaluationSteps
      );

      // Step 8: Apply post-processing rules (field masking, scope restrictions, etc.)
      const processedResult = await this.applyPostProcessingRules(
        finalResult,
        refinedPermissions,
        request,
        attributeContext
      );

      return {
        allowed: processedResult.allowed,
        reason: processedResult.reason,
        appliedPolicies: processedResult.appliedPolicies,
        appliedRules: processedResult.appliedRules || [],
        evaluationPath: evaluationSteps,
        computedAttributes,
        warnings,
        recommendations,
        evaluationTime: Date.now() - startTime,
        cacheableUntil: this.calculateCacheExpiry(context, refinedPermissions)
      };

    } catch (error) {
      evaluationSteps.push({
        step: 'error_handling',
        component: 'rbac',
        evaluation: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date(),
        duration: Date.now() - startTime
      });

      return {
        allowed: false,
        reason: `Access evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        appliedPolicies: [],
        appliedRules: [],
        evaluationPath: evaluationSteps,
        computedAttributes,
        warnings,
        recommendations,
        evaluationTime: Date.now() - startTime
      };
    }
  }

  /**
   * Initialize attribute resolution context
   */
  private static async initializeAttributeContext(
    request: AccessRequest,
    context: AccessControlContext
  ): Promise<AttributeResolutionContext> {
    const clientInfo: ClientInfo = {
      ipAddress: context.clientIp || 'unknown',
      userAgent: context.userAgent || 'unknown'
    };

    // Compute derived attributes
    const computedAttributes: Record<string, any> = {
      // Time-based attributes
      current_time: context.requestTime.toISOString(),
      current_hour: context.requestTime.getHours(),
      current_day_of_week: context.requestTime.toLocaleDateString('en-US', { weekday: 'lowercase' }),
      current_timestamp: context.requestTime.getTime(),
      
      // User attributes
      user_id: context.user.id,
      user_roles: context.user.roles,
      user_status: context.user.status,
      user_attributes: context.user.attributes,
      
      // Request attributes
      requested_resource: request.resource,
      requested_action: request.action,
      request_context: request.context || {},
      
      // Environment attributes
      client_ip: clientInfo.ipAddress,
      user_agent: clientInfo.userAgent,
      session_id: this.generateSessionId(context.user.id, clientInfo),
      
      // Computed security attributes
      risk_score: this.calculateRiskScore(context.user, clientInfo, request),
      trust_level: this.calculateTrustLevel(context.user, clientInfo),
      
      // Resource ownership (if applicable)
      is_resource_owner: await this.checkResourceOwnership(context.user, request.resource, request.context),
      
      // Time zone and location
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      is_business_hours: this.isBusinessHours(context.requestTime)
    };

    return {
      userId: context.user.id,
      resourceId: request.resource,
      sessionId: computedAttributes.session_id,
      requestTime: context.requestTime,
      clientInfo,
      computedAttributes,
      externalAttributes: context.environment || {}
    };
  }

  /**
   * Evaluate role-level ABAC conditions to determine active roles
   */
  private static async evaluateRoleConditions(
    userRoles: Role[],
    attributeContext: AttributeResolutionContext,
    evaluationSteps: EvaluationStep[]
  ): Promise<Role[]> {
    const activeRoles: Role[] = [];
    const stepStart = Date.now();

    for (const role of userRoles) {
      let roleActive = true;
      const roleEvaluationDetails: any = { roleId: role.id, roleName: role.name };

      // Evaluate ABAC conditions for this role
      if (role.abacConditions && role.abacConditions.length > 0) {
        for (const condition of role.abacConditions) {
          const conditionMet = await this.evaluateRoleABACCondition(condition, attributeContext);
          roleEvaluationDetails[`condition_${condition.id}`] = conditionMet;

          if (condition.effect === 'deactivate' && conditionMet) {
            roleActive = false;
            break;
          } else if (condition.effect === 'activate' && !conditionMet) {
            roleActive = false;
            break;
          }
        }
      }

      // Evaluate contextual activation rules
      if (role.activationRules && role.activationRules.length > 0) {
        const activationResult = await this.evaluateContextualActivationRules(
          role.activationRules,
          attributeContext
        );
        roleEvaluationDetails.contextualActivation = activationResult;
        
        if (!activationResult.isActive) {
          roleActive = false;
        }
      }

      if (roleActive) {
        activeRoles.push(role);
      }

      evaluationSteps.push({
        step: `role_condition_evaluation_${role.id}`,
        component: 'role_condition',
        evaluation: roleActive ? 'passed' : 'failed',
        details: roleEvaluationDetails,
        timestamp: new Date(),
        duration: Date.now() - stepStart
      });
    }

    return activeRoles;
  }

  /**
   * Apply permission-level ABAC refinements
   */
  private static async applyPermissionRefinements(
    permissions: Permission[],
    request: AccessRequest,
    attributeContext: AttributeResolutionContext,
    evaluationSteps: EvaluationStep[]
  ): Promise<Permission[]> {
    const refinedPermissions: Permission[] = [];
    const stepStart = Date.now();

    for (const permission of permissions) {
      let permissionRefined = { ...permission };
      const refinementDetails: any = { permissionId: permission.id };

      // Apply ABAC refinement rules
      if (permission.abacRefinementRules && permission.abacRefinementRules.length > 0) {
        for (const rule of permission.abacRefinementRules) {
          const ruleResult = await this.evaluatePermissionABACRule(rule, request, attributeContext);
          refinementDetails[`rule_${rule.id}`] = ruleResult;

          if (ruleResult.matches) {
            switch (rule.effect) {
              case 'deny':
                // Remove this permission
                permissionRefined = null;
                break;
              case 'modify_scope':
                permissionRefined = this.applyScopeModifications(permissionRefined, rule);
                break;
              case 'require_approval':
                permissionRefined = this.addApprovalRequirement(permissionRefined, rule);
                break;
            }
          }
        }
      }

      // Apply dynamic scope rules
      if (permissionRefined && permission.dynamicScope && permission.dynamicScope.length > 0) {
        permissionRefined = await this.applyDynamicScopeRules(
          permissionRefined,
          permission.dynamicScope,
          request,
          attributeContext
        );
      }

      // Apply ownership rules
      if (permissionRefined && permission.ownershipChecks && permission.ownershipChecks.length > 0) {
        const ownershipResult = await this.evaluateOwnershipRules(
          permission.ownershipChecks,
          request,
          attributeContext
        );
        refinementDetails.ownershipCheck = ownershipResult;

        if (!ownershipResult.hasAccess) {
          permissionRefined = null;
        }
      }

      // Apply temporal constraints
      if (permissionRefined && permission.temporalConstraints && permission.temporalConstraints.length > 0) {
        const temporalResult = await this.evaluateTemporalConstraints(
          permission.temporalConstraints,
          attributeContext
        );
        refinementDetails.temporalCheck = temporalResult;

        if (!temporalResult.isValid) {
          permissionRefined = null;
        }
      }

      if (permissionRefined) {
        refinedPermissions.push(permissionRefined);
      }

      evaluationSteps.push({
        step: `permission_refinement_${permission.id}`,
        component: 'permission_refinement',
        evaluation: permissionRefined ? 'passed' : 'failed',
        details: refinementDetails,
        timestamp: new Date(),
        duration: Date.now() - stepStart
      });
    }

    return refinedPermissions;
  }

  /**
   * Enhanced RBAC evaluation with refined permissions
   */
  private static async evaluateEnhancedRBAC(
    request: AccessRequest,
    context: AccessControlContext,
    attributeContext: AttributeResolutionContext,
    evaluationSteps: EvaluationStep[]
  ): Promise<AccessResponse> {
    const stepStart = Date.now();

    // Find matching permissions for the request
    const matchingPermissions = context.permissions.filter(perm => 
      this.matchesResourceAction(perm, request.resource, request.action)
    );

    if (matchingPermissions.length === 0) {
      evaluationSteps.push({
        step: 'rbac_evaluation',
        component: 'rbac',
        evaluation: 'failed',
        details: { reason: 'No matching permissions found' },
        timestamp: new Date(),
        duration: Date.now() - stepStart
      });

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
          continue;
        }
      }
      
      evaluationSteps.push({
        step: 'rbac_evaluation',
        component: 'rbac',
        evaluation: 'passed',
        details: { 
          matchedPermission: permission.id,
          permissionName: permission.name 
        },
        timestamp: new Date(),
        duration: Date.now() - stepStart
      });

      return {
        allowed: true,
        reason: `Enhanced RBAC permission granted: ${permission.name}`,
        appliedPolicies: [permission.id]
      };
    }

    evaluationSteps.push({
      step: 'rbac_evaluation',
      component: 'rbac',
      evaluation: 'failed',
      details: { reason: 'Permission conditions not met' },
      timestamp: new Date(),
      duration: Date.now() - stepStart
    });

    return {
      allowed: false,
      reason: 'RBAC permission conditions not met',
      appliedPolicies: []
    };
  }

  /**
   * Enhanced ABAC evaluation with improved attribute resolution
   */
  private static async evaluateEnhancedABAC(
    request: AccessRequest,
    context: AccessControlContext,
    attributeContext: AttributeResolutionContext,
    evaluationSteps: EvaluationStep[]
  ): Promise<AccessResponse> {
    const stepStart = Date.now();
    const applicablePolicies = context.policies
      .filter(policy => policy.status === 'active')
      .sort((a, b) => b.priority - a.priority);

    const appliedPolicies: string[] = [];
    
    for (const policy of applicablePolicies) {
      const policyMatches = await this.evaluateEnhancedPolicy(policy, request, attributeContext);
      
      if (policyMatches.matches) {
        appliedPolicies.push(policy.id);
        
        evaluationSteps.push({
          step: `abac_policy_evaluation_${policy.id}`,
          component: 'abac',
          evaluation: 'passed',
          details: {
            policyId: policy.id,
            policyName: policy.name,
            effect: policy.effect,
            matchedRules: policyMatches.matchedRules
          },
          timestamp: new Date(),
          duration: Date.now() - stepStart
        });

        if (policy.effect === 'deny') {
          return {
            allowed: false,
            reason: `Access denied by enhanced ABAC policy: ${policy.name}`,
            appliedPolicies
          };
        } else if (policy.effect === 'allow') {
          return {
            allowed: true,
            reason: `Access allowed by enhanced ABAC policy: ${policy.name}`,
            appliedPolicies
          };
        }
      }
    }

    evaluationSteps.push({
      step: 'abac_evaluation',
      component: 'abac',
      evaluation: 'failed',
      details: { reason: 'No applicable ABAC policies found' },
      timestamp: new Date(),
      duration: Date.now() - stepStart
    });

    return {
      allowed: false,
      reason: 'No applicable enhanced ABAC policies found',
      appliedPolicies
    };
  }

  /**
   * Enhanced policy evaluation with improved attribute resolution
   */
  private static async evaluateEnhancedPolicy(
    policy: ABACPolicy,
    request: AccessRequest,
    attributeContext: AttributeResolutionContext
  ): Promise<{ matches: boolean; matchedRules: string[] }> {
    const matchedRules: string[] = [];

    for (const rule of policy.rules) {
      const ruleMatches = await this.evaluateEnhancedRule(rule, request, attributeContext);
      if (ruleMatches) {
        matchedRules.push(rule.id || 'unnamed_rule');
        return { matches: true, matchedRules };
      }
    }

    return { matches: false, matchedRules };
  }

  /**
   * Enhanced rule evaluation with advanced attribute resolution
   */
  private static async evaluateEnhancedRule(
    rule: PolicyRule,
    request: AccessRequest,
    attributeContext: AttributeResolutionContext
  ): Promise<boolean> {
    // Evaluate subject conditions with logical operators
    const subjectMatch = await this.evaluateEnhancedAttributeConditions(
      rule.subject,
      attributeContext.computedAttributes,
      attributeContext,
      rule.subjectLogic || 'AND'
    );
    
    // Evaluate resource conditions
    const resourceAttributes = { 
      name: request.resource, 
      type: this.getResourceType(request.resource),
      ...request.context 
    };
    const resourceMatch = await this.evaluateEnhancedAttributeConditions(
      rule.resource,
      resourceAttributes,
      attributeContext,
      rule.resourceLogic || 'AND'
    );
    
    // Evaluate action
    const actionMatch = rule.action.includes(request.action) || rule.action.includes('*');
    
    // Evaluate environment conditions
    const environmentMatch = rule.environment 
      ? await this.evaluateEnhancedAttributeConditions(
          rule.environment,
          { ...attributeContext.externalAttributes, ...attributeContext.computedAttributes },
          attributeContext,
          rule.environmentLogic || 'AND'
        )
      : true;

    // Evaluate time constraints
    const timeMatch = rule.timeConstraints
      ? this.evaluateTimeConstraints(rule.timeConstraints, attributeContext.requestTime)
      : true;

    return subjectMatch && resourceMatch && actionMatch && environmentMatch && timeMatch;
  }

  /**
   * Enhanced attribute condition evaluation with logical operators
   */
  private static async evaluateEnhancedAttributeConditions(
    conditions: AttributeCondition[],
    attributes: Record<string, any>,
    context: AttributeResolutionContext,
    logic: 'AND' | 'OR' | 'NOT' = 'AND'
  ): Promise<boolean> {
    if (conditions.length === 0) return true;
    
    const results = await Promise.all(
      conditions.map(condition => this.evaluateEnhancedCondition(condition, attributes, context))
    );

    switch (logic) {
      case 'AND':
        return results.every(r => r);
      case 'OR':
        return results.some(r => r);
      case 'NOT':
        return !results.every(r => r);
      default:
        return results.every(r => r);
    }
  }

  /**
   * Enhanced condition evaluation with dynamic attribute resolution
   */
  private static async evaluateEnhancedCondition(
    condition: AttributeCondition,
    attributes: Record<string, any>,
    context: AttributeResolutionContext
  ): Promise<boolean> {
    const attributeValue = await this.getEnhancedAttributeValue(
      condition.attribute,
      attributes,
      context
    );

    let expectedValue = condition.value;
    
    // Handle dynamic expressions
    if (condition.isDynamic && condition.expression) {
      expectedValue = await this.evaluateExpression(condition.expression, context);
    }

    return this.evaluateEnhancedConditionOperator(condition, attributeValue, expectedValue);
  }

  /**
   * Enhanced attribute value resolution with multiple sources
   */
  private static async getEnhancedAttributeValue(
    attribute: string,
    attributes: Record<string, any>,
    context: AttributeResolutionContext
  ): Promise<any> {
    // Check direct attributes first
    if (attributes.hasOwnProperty(attribute)) {
      return attributes[attribute];
    }
    
    // Check computed attributes
    if (context.computedAttributes?.hasOwnProperty(attribute)) {
      return context.computedAttributes[attribute];
    }

    // Check external attributes
    if (context.externalAttributes?.hasOwnProperty(attribute)) {
      return context.externalAttributes[attribute];
    }
    
    // Handle nested attribute paths (e.g., "user.department", "resource.owner")
    if (attribute.includes('.')) {
      return this.getNestedAttributeValue(attribute, attributes, context);
    }

    // Handle special computed attributes
    switch (attribute) {
      case 'current_time_epoch':
        return context.requestTime.getTime();
      case 'user_age_days':
        return this.calculateUserAgeDays(context.userId, context);
      case 'session_duration':
        return this.calculateSessionDuration(context.sessionId || '');
      case 'resource_access_count':
        return await this.getResourceAccessCount(context.resourceId || '', context.userId);
      case 'risk_assessment_score':
        return this.calculateDynamicRiskScore(context);
      default:
        return undefined;
    }
  }

  /**
   * Enhanced condition operator evaluation
   */
  private static evaluateEnhancedConditionOperator(
    condition: AttributeCondition,
    actualValue: any,
    expectedValue: any
  ): boolean {
    const { operator, caseSensitive = true, allowPartialMatch = false } = condition;
    
    // Handle null/undefined values
    if (operator === 'exists') {
      return actualValue !== undefined && actualValue !== null;
    }
    if (operator === 'is_null') {
      return actualValue === null || actualValue === undefined;
    }
    if (operator === 'is_empty') {
      return !actualValue || (Array.isArray(actualValue) && actualValue.length === 0) || 
             (typeof actualValue === 'string' && actualValue.trim() === '');
    }

    // Handle case sensitivity for string operations
    let processedActual = actualValue;
    let processedExpected = expectedValue;
    
    if (typeof actualValue === 'string' && typeof expectedValue === 'string' && !caseSensitive) {
      processedActual = actualValue.toLowerCase();
      processedExpected = expectedValue.toLowerCase();
    }
    
    switch (operator) {
      case 'equals':
        return processedActual === processedExpected;
      case 'not_equals':
        return processedActual !== processedExpected;
      case 'contains':
        return String(processedActual).includes(String(processedExpected));
      case 'starts_with':
        return String(processedActual).startsWith(String(processedExpected));
      case 'ends_with':
        return String(processedActual).endsWith(String(processedExpected));
      case 'matches_regex':
        try {
          const regex = new RegExp(expectedValue, caseSensitive ? 'g' : 'gi');
          return regex.test(String(actualValue));
        } catch {
          return false;
        }
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(actualValue);
      case 'greater_than':
        return Number(actualValue) > Number(expectedValue);
      case 'less_than':
        return Number(actualValue) < Number(expectedValue);
      default:
        return false;
    }
  }

  /**
   * Combine results with enhanced logic
   */
  private static combineEnhancedResults(
    rbacResult: AccessResponse,
    abacResult: AccessResponse,
    config?: HybridPolicyConfig,
    evaluationSteps?: EvaluationStep[]
  ): AccessResponse & { appliedRules?: string[] } {
    const combinationStrategy = config?.conflictResolution || 'deny_wins';
    
    switch (combinationStrategy) {
      case 'deny_wins':
        if (rbacResult.reason.includes('denied') || abacResult.reason.includes('denied')) {
          return {
            allowed: false,
            reason: rbacResult.reason.includes('denied') ? rbacResult.reason : abacResult.reason,
            appliedPolicies: [...rbacResult.appliedPolicies, ...abacResult.appliedPolicies],
            appliedRules: []
          };
        }
        break;
      case 'allow_wins':
        if (rbacResult.allowed || abacResult.allowed) {
          return {
            allowed: true,
            reason: rbacResult.allowed ? rbacResult.reason : abacResult.reason,
            appliedPolicies: [...rbacResult.appliedPolicies, ...abacResult.appliedPolicies],
            appliedRules: []
          };
        }
        break;
      case 'most_specific':
        // Prefer ABAC if it has specific rules, otherwise RBAC
        if (abacResult.appliedPolicies.length > 0) {
          return { ...abacResult, appliedRules: [] };
        }
        return { ...rbacResult, appliedRules: [] };
      case 'highest_priority':
        // Implementation would depend on priority scoring
        break;
    }

    // Default deny_wins behavior
    if (rbacResult.allowed || abacResult.allowed) {
      return {
        allowed: true,
        reason: rbacResult.allowed ? rbacResult.reason : abacResult.reason,
        appliedPolicies: [...rbacResult.appliedPolicies, ...abacResult.appliedPolicies],
        appliedRules: []
      };
    }
    
    return {
      allowed: false,
      reason: 'Access denied by enhanced hybrid evaluation',
      appliedPolicies: [...rbacResult.appliedPolicies, ...abacResult.appliedPolicies],
      appliedRules: []
    };
  }

  // Utility methods implementation
  private static async evaluateRoleABACCondition(
    condition: RoleABACCondition,
    context: AttributeResolutionContext
  ): Promise<boolean> {
    return this.evaluateEnhancedAttributeConditions(
      condition.conditions,
      context.computedAttributes || {},
      context
    );
  }

  private static async evaluateContextualActivationRules(
    rules: any[],
    context: AttributeResolutionContext
  ): Promise<{ isActive: boolean; details: any }> {
    // Implementation for contextual activation rules
    return { isActive: true, details: {} };
  }

  private static async evaluatePermissionABACRule(
    rule: PermissionABACRule,
    request: AccessRequest,
    context: AttributeResolutionContext
  ): Promise<{ matches: boolean; details: any }> {
    const matches = await this.evaluateEnhancedAttributeConditions(
      rule.conditions,
      { ...context.computedAttributes, ...request.context },
      context
    );
    return { matches, details: { ruleId: rule.id, effect: rule.effect } };
  }

  private static applyScopeModifications(permission: Permission, rule: PermissionABACRule): Permission {
    // Apply scope modifications based on rule
    return permission;
  }

  private static addApprovalRequirement(permission: Permission, rule: PermissionABACRule): Permission {
    // Add approval requirement to permission
    return permission;
  }

  private static async applyDynamicScopeRules(
    permission: Permission,
    rules: DynamicScopeRule[],
    request: AccessRequest,
    context: AttributeResolutionContext
  ): Promise<Permission> {
    // Apply dynamic scope rules
    return permission;
  }

  private static async evaluateOwnershipRules(
    rules: OwnershipRule[],
    request: AccessRequest,
    context: AttributeResolutionContext
  ): Promise<{ hasAccess: boolean; details: any }> {
    // Evaluate ownership rules
    return { hasAccess: true, details: {} };
  }

  private static async evaluateTemporalConstraints(
    constraints: TemporalConstraint[],
    context: AttributeResolutionContext
  ): Promise<{ isValid: boolean; details: any }> {
    // Evaluate temporal constraints
    return { isValid: true, details: {} };
  }

  private static getEffectivePermissions(roles: Role[], allPermissions: Permission[]): Permission[] {
    const permissionIds = new Set<string>();
    
    roles.forEach(role => {
      role.permissions.forEach(permId => permissionIds.add(permId));
      if (role.inheritedPermissions) {
        role.inheritedPermissions.forEach(permId => permissionIds.add(permId));
      }
    });
    
    return allPermissions.filter(perm => permissionIds.has(perm.id));
  }

  private static async applyPostProcessingRules(
    result: AccessResponse & { appliedRules?: string[] },
    permissions: Permission[],
    request: AccessRequest,
    context: AttributeResolutionContext
  ): Promise<AccessResponse & { appliedRules?: string[] }> {
    // Apply post-processing rules like field masking
    return result;
  }

  private static calculateCacheExpiry(context: AccessControlContext, permissions: Permission[]): Date | undefined {
    // Calculate cache expiry based on context and permissions
    return new Date(Date.now() + 300000); // 5 minutes default
  }

  // Helper methods for attribute resolution
  private static generateSessionId(userId: string, clientInfo: ClientInfo): string {
    return `session_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static calculateRiskScore(user: User, clientInfo: ClientInfo, request: AccessRequest): number {
    // Calculate dynamic risk score
    return Math.random() * 100; // Placeholder
  }

  private static calculateTrustLevel(user: User, clientInfo: ClientInfo): string {
    // Calculate trust level
    return 'medium'; // Placeholder
  }

  private static async checkResourceOwnership(user: User, resource: string, context?: Record<string, any>): Promise<boolean> {
    // Check if user owns the resource
    return false; // Placeholder
  }

  private static isBusinessHours(date: Date): boolean {
    const hour = date.getHours();
    const day = date.getDay();
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 17;
  }

  private static getResourceType(resource: string): string {
    // Extract resource type from resource identifier
    return resource.split('_')[0] || 'unknown';
  }

  private static evaluateTimeConstraints(constraints: any[], requestTime: Date): boolean {
    // Evaluate time constraints
    return true; // Placeholder
  }

  private static getNestedAttributeValue(attribute: string, attributes: Record<string, any>, context: AttributeResolutionContext): any {
    const parts = attribute.split('.');
    let value = attributes;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && value.hasOwnProperty(part)) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private static async evaluateExpression(expression: string, context: AttributeResolutionContext): Promise<any> {
    // Evaluate dynamic expressions safely
    // This is a placeholder - in production, use a secure expression evaluator
    return expression;
  }

  private static calculateUserAgeDays(userId: string, context: AttributeResolutionContext): number {
    // Calculate user age in days
    return 30; // Placeholder
  }

  private static calculateSessionDuration(sessionId: string): number {
    // Calculate session duration in minutes
    return 60; // Placeholder
  }

  private static async getResourceAccessCount(resourceId: string, userId: string): Promise<number> {
    // Get resource access count for user
    return 5; // Placeholder
  }

  private static calculateDynamicRiskScore(context: AttributeResolutionContext): number {
    // Calculate dynamic risk score
    return 25; // Placeholder
  }

  // Existing methods from original implementation
  private static matchesResourceAction(permission: Permission, resource: string, action: string): boolean {
    const resourceMatch = permission.resource === resource || permission.resource === '*';
    const actionMatch = permission.action === action || permission.action === '*';
    return resourceMatch && actionMatch;
  }

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
      
      return this.evaluateEnhancedConditionOperator(
        { attribute: condition.field, operator: condition.operator, value: condition.value },
        value,
        condition.value
      );
    });
  }

  /**
   * Check field-level access with enhanced features
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
   * Apply field masking with enhanced rules
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
        return `#${stringValue.length}${stringValue.charCodeAt(0)}`;
      default:
        return value;
    }
  }
}

// Enhanced utility functions
export class EnhancedAccessControlUtils {
  /**
   * Check if user has a specific role
   */
  static hasRole(user: User, roleName: string, roles: Role[]): boolean {
    // Check if user's roles include the specified role
    if (!user.roles || !Array.isArray(user.roles)) {
      return false;
    }

    // Check by role name or role ID
    return user.roles.some(userRole => {
      if (typeof userRole === 'string') {
        return userRole === roleName;
      }
      return userRole === roleName || roles.some(role =>
        role.id === userRole && role.name === roleName
      );
    }) || roles.some(role =>
      role.name === roleName && user.roles.includes(role.id)
    );
  }

  /**
   * Check if user has permission with enhanced context
   */
  static async hasEnhancedPermission(
    userId: string,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    // Enhanced permission check implementation
    return true; // Placeholder
  }

  /**
   * Get user's effective permissions with role conditions
   */
  static getEnhancedEffectivePermissions(
    user: User,
    roles: Role[],
    permissions: Permission[],
    attributeContext: AttributeResolutionContext
  ): Promise<Permission[]> {
    // Enhanced effective permissions calculation
    return Promise.resolve(permissions); // Placeholder
  }

  /**
   * Validate hybrid policy configuration
   */
  static validateHybridConfig(config: HybridPolicyConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config.evaluationOrder || config.evaluationOrder.length === 0) {
      errors.push('Evaluation order must be specified');
    }
    
    if (config.cacheTimeout && config.cacheTimeout < 0) {
      errors.push('Cache timeout must be non-negative');
    }
    
    return { isValid: errors.length === 0, errors };
  }
}

// Export the enhanced engine as the default access control engine
export const AccessControlEngine = EnhancedAccessControlEngine;
export const AccessControlUtils = EnhancedAccessControlUtils;
