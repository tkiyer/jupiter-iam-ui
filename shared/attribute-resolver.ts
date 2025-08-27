/**
 * Dynamic Attribute Resolution and Expression Evaluation System
 * Provides secure, extensible attribute resolution for the hybrid RBAC-ABAC model
 */

import {
  User,
  AttributeResolutionContext,
  AttributeCondition,
  ClientInfo,
  GeoLocation,
  DeviceInfo,
  NetworkInfo
} from './iam.js';

export interface AttributeResolver {
  name: string;
  description: string;
  resolve(context: AttributeResolutionContext): Promise<any>;
  dependsOn?: string[];
  cacheTimeout?: number;
  securityLevel: 'public' | 'internal' | 'sensitive' | 'restricted';
}

export interface ExpressionContext {
  attributes: Record<string, any>;
  functions: Record<string, Function>;
  constants: Record<string, any>;
  security: {
    allowedFunctions: string[];
    maxExecutionTime: number;
    preventCodeInjection: boolean;
  };
}

export interface ExpressionResult {
  value: any;
  dependencies: string[];
  computationTime: number;
  cached: boolean;
  securityViolations: string[];
}

/**
 * Secure expression evaluator for dynamic attribute resolution
 */
export class SecureExpressionEvaluator {
  private static readonly SAFE_FUNCTIONS = {
    // Math functions
    abs: Math.abs,
    ceil: Math.ceil,
    floor: Math.floor,
    max: Math.max,
    min: Math.min,
    round: Math.round,
    
    // String functions
    substring: (str: string, start: number, end?: number) => str.substring(start, end),
    toLowerCase: (str: string) => str.toLowerCase(),
    toUpperCase: (str: string) => str.toUpperCase(),
    trim: (str: string) => str.trim(),
    replace: (str: string, search: string, replace: string) => str.replace(search, replace),
    
    // Date functions
    now: () => new Date(),
    dateAdd: (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000),
    dateDiff: (date1: Date, date2: Date) => Math.abs(date1.getTime() - date2.getTime()) / (24 * 60 * 60 * 1000),
    formatDate: (date: Date, format: string) => date.toISOString(),
    
    // Array functions
    length: (arr: any[]) => arr.length,
    contains: (arr: any[], item: any) => arr.includes(item),
    join: (arr: any[], separator: string) => arr.join(separator),
    
    // Logical functions
    and: (...args: boolean[]) => args.every(Boolean),
    or: (...args: boolean[]) => args.some(Boolean),
    not: (value: boolean) => !value,
    
    // Comparison functions
    equals: (a: any, b: any) => a === b,
    greaterThan: (a: number, b: number) => a > b,
    lessThan: (a: number, b: number) => a < b,
    
    // Security functions
    hash: (value: string) => this.hashValue(value),
    mask: (value: string, pattern: string) => this.maskValue(value, pattern),
    
    // Risk assessment functions
    calculateRisk: (factors: Record<string, any>) => this.calculateRiskScore(factors),
    assessTrust: (user: any, context: any) => this.assessTrustLevel(user, context)
  };

  private static readonly BLOCKED_PATTERNS = [
    /eval\s*\(/,
    /Function\s*\(/,
    /new\s+Function/,
    /constructor/,
    /prototype/,
    /__proto__/,
    /import\s*\(/,
    /require\s*\(/,
    /process\./,
    /global\./,
    /window\./,
    /document\./,
    /localStorage/,
    /sessionStorage/,
    /fetch\s*\(/,
    /XMLHttpRequest/,
    /setTimeout/,
    /setInterval/
  ];

  /**
   * Safely evaluate an expression with sandboxing
   */
  static async evaluateExpression(
    expression: string,
    context: ExpressionContext
  ): Promise<ExpressionResult> {
    const startTime = Date.now();
    const dependencies: string[] = [];
    const securityViolations: string[] = [];

    try {
      // Security validation
      this.validateExpressionSecurity(expression, securityViolations);
      
      if (securityViolations.length > 0) {
        return {
          value: null,
          dependencies,
          computationTime: Date.now() - startTime,
          cached: false,
          securityViolations
        };
      }

      // Create safe execution environment
      const safeContext = this.createSafeContext(context, dependencies);
      
      // Parse and evaluate expression
      const result = await this.executeInSandbox(expression, safeContext, context.security.maxExecutionTime);

      return {
        value: result,
        dependencies,
        computationTime: Date.now() - startTime,
        cached: false,
        securityViolations
      };

    } catch (error) {
      securityViolations.push(`Expression evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        value: null,
        dependencies,
        computationTime: Date.now() - startTime,
        cached: false,
        securityViolations
      };
    }
  }

  /**
   * Validate expression for security vulnerabilities
   */
  private static validateExpressionSecurity(expression: string, violations: string[]): void {
    // Check for blocked patterns
    for (const pattern of this.BLOCKED_PATTERNS) {
      if (pattern.test(expression)) {
        violations.push(`Blocked pattern detected: ${pattern.source}`);
      }
    }

    // Check for suspicious function calls
    const functionCalls = expression.match(/(\w+)\s*\(/g);
    if (functionCalls) {
      for (const call of functionCalls) {
        const functionName = call.replace(/\s*\(/, '');
        if (!this.SAFE_FUNCTIONS.hasOwnProperty(functionName)) {
          violations.push(`Unsafe function call: ${functionName}`);
        }
      }
    }

    // Check expression length
    if (expression.length > 10000) {
      violations.push('Expression too long (potential DoS)');
    }

    // Check for excessive nesting
    const maxDepth = 10;
    let depth = 0;
    let maxDepthReached = 0;
    
    for (const char of expression) {
      if (char === '(' || char === '[' || char === '{') {
        depth++;
        maxDepthReached = Math.max(maxDepthReached, depth);
      } else if (char === ')' || char === ']' || char === '}') {
        depth--;
      }
    }
    
    if (maxDepthReached > maxDepth) {
      violations.push(`Expression nesting too deep: ${maxDepthReached} > ${maxDepth}`);
    }
  }

  /**
   * Create a safe execution context
   */
  private static createSafeContext(context: ExpressionContext, dependencies: string[]): any {
    const safeContext: any = {};

    // Add safe functions
    for (const [name, func] of Object.entries(this.SAFE_FUNCTIONS)) {
      safeContext[name] = func;
    }

    // Add constants
    for (const [name, value] of Object.entries(context.constants || {})) {
      safeContext[name] = value;
    }

    // Add attributes with dependency tracking
    const attributeProxy = new Proxy(context.attributes, {
      get(target, prop) {
        if (typeof prop === 'string') {
          dependencies.push(prop);
        }
        return target[prop as string];
      }
    });
    
    safeContext.attr = attributeProxy;
    safeContext.attributes = attributeProxy;

    return safeContext;
  }

  /**
   * Execute expression in a sandboxed environment
   */
  private static async executeInSandbox(
    expression: string,
    context: any,
    maxExecutionTime: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Expression execution timeout'));
      }, maxExecutionTime);

      try {
        // Create a function with restricted scope
        const wrappedExpression = `
          "use strict";
          return (function(context) {
            with (context) {
              return (${expression});
            }
          })(arguments[0]);
        `;

        const result = Function(wrappedExpression)(context);
        clearTimeout(timeout);
        resolve(result);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  // Utility functions for safe operations
  private static hashValue(value: string): string {
    // Simple hash for demonstration - use proper cryptographic hash in production
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  private static maskValue(value: string, pattern: string): string {
    switch (pattern) {
      case 'email':
        return value.replace(/(.{2}).*(@.*)/, '$1***$2');
      case 'phone':
        return value.replace(/(\d{3}).*(\d{3})/, '$1***$2');
      case 'partial':
        if (value.length <= 4) return '*'.repeat(value.length);
        return value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
      default:
        return value.replace(/./g, '*');
    }
  }

  private static calculateRiskScore(factors: Record<string, any>): number {
    // Simple risk calculation - enhance based on your risk model
    let score = 0;
    
    if (factors.newDevice) score += 20;
    if (factors.unusualLocation) score += 15;
    if (factors.offHours) score += 10;
    if (factors.suspiciousActivity) score += 30;
    if (factors.highPrivilegeAccess) score += 25;
    
    return Math.min(score, 100);
  }

  private static assessTrustLevel(user: any, context: any): string {
    // Trust level assessment logic
    if (user.isTrustedUser && context.isTrustedDevice) return 'high';
    if (user.isVerified && context.isKnownNetwork) return 'medium';
    return 'low';
  }
}

/**
 * Dynamic attribute resolver system
 */
export class DynamicAttributeResolver {
  private static resolvers: Map<string, AttributeResolver> = new Map();
  private static cache: Map<string, { value: any; expiry: Date }> = new Map();

  /**
   * Register an attribute resolver
   */
  static registerResolver(resolver: AttributeResolver): void {
    this.resolvers.set(resolver.name, resolver);
  }

  /**
   * Register built-in resolvers
   */
  static registerBuiltInResolvers(): void {
    // User-related resolvers
    this.registerResolver({
      name: 'user.department_hierarchy',
      description: 'Resolves user department hierarchy',
      securityLevel: 'internal',
      resolve: async (context) => {
        const user = context.computedAttributes?.user_attributes || {};
        return this.resolveDepartmentHierarchy(user.department);
      }
    });

    this.registerResolver({
      name: 'user.clearance_level',
      description: 'Resolves user security clearance level',
      securityLevel: 'sensitive',
      resolve: async (context) => {
        const user = context.computedAttributes?.user_attributes || {};
        return this.resolveSecurityClearance(user, context);
      }
    });

    this.registerResolver({
      name: 'user.group_memberships',
      description: 'Resolves all user group memberships',
      securityLevel: 'internal',
      resolve: async (context) => {
        return this.resolveGroupMemberships(context.userId);
      }
    });

    // Time-related resolvers
    this.registerResolver({
      name: 'time.business_hours',
      description: 'Determines if current time is within business hours',
      securityLevel: 'public',
      cacheTimeout: 60000, // 1 minute cache
      resolve: async (context) => {
        return this.isBusinessHours(context.requestTime);
      }
    });

    this.registerResolver({
      name: 'time.holiday_status',
      description: 'Determines if current date is a holiday',
      securityLevel: 'public',
      cacheTimeout: 3600000, // 1 hour cache
      resolve: async (context) => {
        return this.isHoliday(context.requestTime);
      }
    });

    // Location-related resolvers
    this.registerResolver({
      name: 'location.risk_level',
      description: 'Assesses location-based risk',
      securityLevel: 'internal',
      resolve: async (context) => {
        return this.assessLocationRisk(context.clientInfo);
      }
    });

    this.registerResolver({
      name: 'location.compliance_zone',
      description: 'Determines data compliance zone based on location',
      securityLevel: 'internal',
      resolve: async (context) => {
        return this.determineComplianceZone(context.clientInfo);
      }
    });

    // Resource-related resolvers
    this.registerResolver({
      name: 'resource.owner',
      description: 'Resolves resource owner information',
      securityLevel: 'internal',
      resolve: async (context) => {
        return this.resolveResourceOwner(context.resourceId);
      }
    });

    this.registerResolver({
      name: 'resource.classification',
      description: 'Resolves resource data classification',
      securityLevel: 'internal',
      resolve: async (context) => {
        return this.resolveResourceClassification(context.resourceId);
      }
    });

    // Context-related resolvers
    this.registerResolver({
      name: 'context.session_risk',
      description: 'Calculates session-based risk score',
      securityLevel: 'internal',
      resolve: async (context) => {
        return this.calculateSessionRisk(context);
      }
    });

    this.registerResolver({
      name: 'context.device_trust',
      description: 'Evaluates device trust level',
      securityLevel: 'internal',
      resolve: async (context) => {
        return this.evaluateDeviceTrust(context.clientInfo);
      }
    });
  }

  /**
   * Resolve attribute value with caching
   */
  static async resolveAttribute(
    attributeName: string,
    context: AttributeResolutionContext
  ): Promise<any> {
    const resolver = this.resolvers.get(attributeName);
    if (!resolver) {
      throw new Error(`No resolver found for attribute: ${attributeName}`);
    }

    // Check cache first
    const cacheKey = `${attributeName}:${context.userId}:${context.sessionId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expiry > new Date()) {
      return cached.value;
    }

    // Resolve dependencies first
    if (resolver.dependsOn) {
      for (const dependency of resolver.dependsOn) {
        if (!context.computedAttributes?.[dependency]) {
          const depValue = await this.resolveAttribute(dependency, context);
          if (context.computedAttributes) {
            context.computedAttributes[dependency] = depValue;
          }
        }
      }
    }

    // Resolve the attribute
    const value = await resolver.resolve(context);

    // Cache if specified
    if (resolver.cacheTimeout) {
      const expiry = new Date(Date.now() + resolver.cacheTimeout);
      this.cache.set(cacheKey, { value, expiry });
    }

    return value;
  }

  /**
   * Resolve multiple attributes in parallel
   */
  static async resolveAttributes(
    attributeNames: string[],
    context: AttributeResolutionContext
  ): Promise<Record<string, any>> {
    const results = await Promise.allSettled(
      attributeNames.map(name => this.resolveAttribute(name, context))
    );

    const resolved: Record<string, any> = {};
    
    attributeNames.forEach((name, index) => {
      const result = results[index];
      if (result.status === 'fulfilled') {
        resolved[name] = result.value;
      } else {
        console.error(`Failed to resolve attribute ${name}:`, result.reason);
        resolved[name] = null;
      }
    });

    return resolved;
  }

  /**
   * Clear cache for user or globally
   */
  static clearCache(userId?: string): void {
    if (userId) {
      for (const [key] of this.cache) {
        if (key.includes(`:${userId}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Built-in resolver implementations
  private static async resolveDepartmentHierarchy(department: string): Promise<string[]> {
    // Mock department hierarchy resolution
    const hierarchies: Record<string, string[]> = {
      'engineering': ['engineering', 'technology', 'all'],
      'finance': ['finance', 'business', 'all'],
      'hr': ['hr', 'people', 'all'],
      'sales': ['sales', 'business', 'all']
    };
    
    return hierarchies[department?.toLowerCase()] || ['all'];
  }

  private static async resolveSecurityClearance(user: any, context: AttributeResolutionContext): Promise<string> {
    // Mock security clearance resolution
    const clearanceLevels: Record<string, string> = {
      'admin': 'top_secret',
      'manager': 'secret',
      'senior': 'confidential',
      'junior': 'public'
    };
    
    const userLevel = user.level || 'public';
    return clearanceLevels[userLevel] || 'public';
  }

  private static async resolveGroupMemberships(userId: string): Promise<string[]> {
    // Mock group membership resolution
    return ['employees', 'authenticated_users'];
  }

  private static isBusinessHours(date: Date): boolean {
    const hour = date.getHours();
    const day = date.getDay();
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 17;
  }

  private static async isHoliday(date: Date): Promise<boolean> {
    // Mock holiday detection
    const holidays = ['2024-01-01', '2024-07-04', '2024-12-25'];
    const dateStr = date.toISOString().split('T')[0];
    return holidays.includes(dateStr);
  }

  private static async assessLocationRisk(clientInfo: ClientInfo): Promise<string> {
    // Mock location risk assessment
    const highRiskCountries = ['XX', 'YY', 'ZZ'];
    const location = clientInfo.location;
    
    if (location && highRiskCountries.includes(location.country)) {
      return 'high';
    }
    
    return 'low';
  }

  private static async determineComplianceZone(clientInfo: ClientInfo): Promise<string> {
    // Mock compliance zone determination
    const euCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE'];
    const location = clientInfo.location;
    
    if (location && euCountries.includes(location.country)) {
      return 'EU';
    }
    
    return 'US';
  }

  private static async resolveResourceOwner(resourceId?: string): Promise<string | null> {
    // Mock resource owner resolution
    if (!resourceId) return null;
    
    const owners: Record<string, string> = {
      'doc_123': 'user_456',
      'project_789': 'user_123'
    };
    
    return owners[resourceId] || null;
  }

  private static async resolveResourceClassification(resourceId?: string): Promise<string> {
    // Mock resource classification
    if (!resourceId) return 'public';
    
    if (resourceId.includes('financial')) return 'confidential';
    if (resourceId.includes('hr')) return 'sensitive';
    if (resourceId.includes('public')) return 'public';
    
    return 'internal';
  }

  private static async calculateSessionRisk(context: AttributeResolutionContext): Promise<number> {
    // Mock session risk calculation
    let risk = 0;
    
    // Check for unusual patterns
    if (!this.isBusinessHours(context.requestTime)) risk += 10;
    if (context.clientInfo.ipAddress.startsWith('192.168.')) risk -= 5; // Internal network
    
    return Math.max(0, Math.min(100, risk));
  }

  private static async evaluateDeviceTrust(clientInfo: ClientInfo): Promise<string> {
    // Mock device trust evaluation
    const deviceInfo = clientInfo.deviceInfo;
    
    if (deviceInfo?.isManaged && deviceInfo?.isTrusted) return 'high';
    if (deviceInfo?.isTrusted) return 'medium';
    
    return 'low';
  }
}

/**
 * Expression template processor for policy rules
 */
export class ExpressionTemplateProcessor {
  /**
   * Process template expressions in policy values
   */
  static async processTemplate(
    template: string,
    context: AttributeResolutionContext
  ): Promise<string> {
    // Find all template expressions ${...}
    const templateRegex = /\$\{([^}]+)\}/g;
    let result = template;
    let match;

    while ((match = templateRegex.exec(template)) !== null) {
      const expression = match[1];
      const fullMatch = match[0];

      try {
        // Resolve the expression
        const value = await this.resolveTemplateExpression(expression, context);
        result = result.replace(fullMatch, String(value));
      } catch (error) {
        console.error(`Failed to resolve template expression ${expression}:`, error);
        // Keep the original template expression on error
      }
    }

    return result;
  }

  /**
   * Resolve a single template expression
   */
  private static async resolveTemplateExpression(
    expression: string,
    context: AttributeResolutionContext
  ): Promise<any> {
    // Handle simple attribute references
    if (expression.includes('.')) {
      const [category, attribute] = expression.split('.', 2);
      
      switch (category) {
        case 'user':
        case 'subject':
          return this.getUserAttribute(attribute, context);
        case 'resource':
          return this.getResourceAttribute(attribute, context);
        case 'environment':
          return this.getEnvironmentAttribute(attribute, context);
        case 'computed':
          return context.computedAttributes?.[attribute];
        default:
          return DynamicAttributeResolver.resolveAttribute(expression, context);
      }
    }

    // Handle direct attribute references
    return context.computedAttributes?.[expression] || 
           context.externalAttributes?.[expression];
  }

  private static getUserAttribute(attribute: string, context: AttributeResolutionContext): any {
    const userAttrs = context.computedAttributes?.user_attributes || {};
    
    switch (attribute) {
      case 'id':
        return context.userId;
      case 'current_project':
        return userAttrs.currentProject;
      case 'department':
        return userAttrs.department;
      case 'role':
        return userAttrs.primaryRole;
      default:
        return userAttrs[attribute];
    }
  }

  private static getResourceAttribute(attribute: string, context: AttributeResolutionContext): any {
    const resourceAttrs = context.externalAttributes?.resource || {};
    
    switch (attribute) {
      case 'id':
        return context.resourceId;
      case 'owner_id':
        return resourceAttrs.ownerId;
      case 'project_id':
        return resourceAttrs.projectId;
      default:
        return resourceAttrs[attribute];
    }
  }

  private static getEnvironmentAttribute(attribute: string, context: AttributeResolutionContext): any {
    const envAttrs = context.externalAttributes || {};
    
    switch (attribute) {
      case 'time':
        return context.requestTime.toISOString();
      case 'ip':
        return context.clientInfo.ipAddress;
      case 'user_agent':
        return context.clientInfo.userAgent;
      default:
        return envAttrs[attribute];
    }
  }
}

// Initialize built-in resolvers on module load
DynamicAttributeResolver.registerBuiltInResolvers();
