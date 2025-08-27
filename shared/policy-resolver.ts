/**
 * Enhanced Policy Conflict Resolution and Combination Logic
 * Handles complex policy conflicts and provides intelligent resolution strategies
 */

import {
  ABACPolicy,
  Role,
  Permission,
  PolicyRule,
  AttributeCondition,
  HybridPolicyConfig,
  AccessRequest,
  AccessResponse,
  DetailedAccessResponse,
  EvaluationStep,
  AttributeResolutionContext
} from './iam.js';

export interface PolicyConflict {
  id: string;
  type: 'effect_conflict' | 'priority_overlap' | 'rule_contradiction' | 'scope_ambiguity' | 'temporal_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  involvedPolicies: string[];
  involvedRoles?: string[];
  involvedPermissions?: string[];
  suggestedResolution: string;
  autoResolvable: boolean;
  detectedAt: Date;
  context?: PolicyConflictContext;
}

export interface PolicyConflictContext {
  resource?: string;
  action?: string;
  subject?: Record<string, any>;
  environment?: Record<string, any>;
  conflictingRules?: ConflictingRule[];
}

export interface ConflictingRule {
  policyId: string;
  ruleId: string;
  effect: 'allow' | 'deny';
  priority: number;
  conditions: AttributeCondition[];
  specificity: number;
}

export interface ResolutionStrategy {
  name: string;
  description: string;
  applicableConflictTypes: string[];
  priority: number;
  resolve: (
    conflict: PolicyConflict,
    context: PolicyResolutionContext
  ) => Promise<PolicyResolution>;
}

export interface PolicyResolution {
  decision: 'allow' | 'deny';
  reason: string;
  confidence: number;
  appliedStrategy: string;
  resolvedConflicts: string[];
  metadata: Record<string, any>;
}

export interface PolicyResolutionContext {
  policies: ABACPolicy[];
  roles: Role[];
  permissions: Permission[];
  request: AccessRequest;
  attributeContext: AttributeResolutionContext;
  config: HybridPolicyConfig;
}

export interface PolicyCombinationResult {
  finalDecision: 'allow' | 'deny';
  combinationStrategy: string;
  confidence: number;
  conflictsDetected: PolicyConflict[];
  conflictsResolved: PolicyResolution[];
  appliedPolicies: string[];
  evaluationPath: EvaluationStep[];
  warnings: string[];
  recommendations: string[];
}

/**
 * Advanced conflict detection system
 */
export class PolicyConflictDetector {
  /**
   * Detect all types of policy conflicts
   */
  static async detectConflicts(
    policies: ABACPolicy[],
    roles: Role[],
    permissions: Permission[],
    context?: PolicyResolutionContext
  ): Promise<PolicyConflict[]> {
    const conflicts: PolicyConflict[] = [];

    // Detect effect conflicts
    conflicts.push(...await this.detectEffectConflicts(policies, context));

    // Detect priority overlaps
    conflicts.push(...await this.detectPriorityOverlaps(policies));

    // Detect rule contradictions
    conflicts.push(...await this.detectRuleContradictions(policies, context));

    // Detect scope ambiguities
    conflicts.push(...await this.detectScopeAmbiguities(policies, roles, permissions));

    // Detect temporal conflicts
    conflicts.push(...await this.detectTemporalConflicts(policies, roles, permissions));

    // Sort by severity
    return conflicts.sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity));
  }

  /**
   * Detect effect conflicts (allow vs deny for same conditions)
   */
  private static async detectEffectConflicts(
    policies: ABACPolicy[],
    context?: PolicyResolutionContext
  ): Promise<PolicyConflict[]> {
    const conflicts: PolicyConflict[] = [];
    const activePolicies = policies.filter(p => p.status === 'active');

    for (let i = 0; i < activePolicies.length; i++) {
      for (let j = i + 1; j < activePolicies.length; j++) {
        const policy1 = activePolicies[i];
        const policy2 = activePolicies[j];

        if (policy1.effect !== policy2.effect) {
          const overlappingRules = await this.findOverlappingRules(policy1, policy2, context);
          
          if (overlappingRules.length > 0) {
            const severity = this.calculateConflictSeverity(overlappingRules, policy1.priority, policy2.priority);
            
            conflicts.push({
              id: `effect_conflict_${policy1.id}_${policy2.id}`,
              type: 'effect_conflict',
              severity,
              description: `Policy "${policy1.name}" (${policy1.effect}) conflicts with policy "${policy2.name}" (${policy2.effect}) on overlapping conditions`,
              involvedPolicies: [policy1.id, policy2.id],
              suggestedResolution: this.suggestEffectConflictResolution(policy1, policy2),
              autoResolvable: this.isAutoResolvableEffectConflict(policy1, policy2),
              detectedAt: new Date(),
              context: {
                conflictingRules: overlappingRules
              }
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect priority overlaps
   */
  private static async detectPriorityOverlaps(policies: ABACPolicy[]): Promise<PolicyConflict[]> {
    const conflicts: PolicyConflict[] = [];
    const activePolicies = policies.filter(p => p.status === 'active');
    const priorityGroups = new Map<number, ABACPolicy[]>();

    // Group policies by priority
    activePolicies.forEach(policy => {
      const priority = policy.priority;
      if (!priorityGroups.has(priority)) {
        priorityGroups.set(priority, []);
      }
      priorityGroups.get(priority)!.push(policy);
    });

    // Check for conflicts within same priority groups
    priorityGroups.forEach((policiesInGroup, priority) => {
      if (policiesInGroup.length > 1) {
        const conflictingEffects = new Set(policiesInGroup.map(p => p.effect));
        
        if (conflictingEffects.size > 1) {
          conflicts.push({
            id: `priority_overlap_${priority}`,
            type: 'priority_overlap',
            severity: 'medium',
            description: `Multiple policies with same priority ${priority} have conflicting effects`,
            involvedPolicies: policiesInGroup.map(p => p.id),
            suggestedResolution: `Adjust priority values to create clear hierarchy or use tie-breaking rules`,
            autoResolvable: false,
            detectedAt: new Date()
          });
        }
      }
    });

    return conflicts;
  }

  /**
   * Detect rule contradictions within policies
   */
  private static async detectRuleContradictions(
    policies: ABACPolicy[],
    context?: PolicyResolutionContext
  ): Promise<PolicyConflict[]> {
    const conflicts: PolicyConflict[] = [];

    for (const policy of policies) {
      if (policy.status !== 'active') continue;

      // Check for contradictory rules within the same policy
      for (let i = 0; i < policy.rules.length; i++) {
        for (let j = i + 1; j < policy.rules.length; j++) {
          const rule1 = policy.rules[i];
          const rule2 = policy.rules[j];

          const contradiction = await this.detectRuleContradiction(rule1, rule2, context);
          
          if (contradiction) {
            conflicts.push({
              id: `rule_contradiction_${policy.id}_${i}_${j}`,
              type: 'rule_contradiction',
              severity: 'high',
              description: `Rules within policy "${policy.name}" are contradictory`,
              involvedPolicies: [policy.id],
              suggestedResolution: `Review and consolidate contradictory rules in policy "${policy.name}"`,
              autoResolvable: false,
              detectedAt: new Date(),
              context: {
                conflictingRules: [
                  { policyId: policy.id, ruleId: rule1.id || `rule_${i}`, effect: policy.effect, priority: policy.priority, conditions: rule1.subject, specificity: 0 },
                  { policyId: policy.id, ruleId: rule2.id || `rule_${j}`, effect: policy.effect, priority: policy.priority, conditions: rule2.subject, specificity: 0 }
                ]
              }
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect scope ambiguities between RBAC and ABAC
   */
  private static async detectScopeAmbiguities(
    policies: ABACPolicy[],
    roles: Role[],
    permissions: Permission[]
  ): Promise<PolicyConflict[]> {
    const conflicts: PolicyConflict[] = [];

    // Check for ambiguities between role permissions and ABAC policies
    for (const role of roles) {
      for (const permissionId of role.permissions) {
        const permission = permissions.find(p => p.id === permissionId);
        if (!permission) continue;

        // Find ABAC policies that might conflict with this permission
        const conflictingPolicies = policies.filter(policy => 
          policy.status === 'active' && 
          this.mightConflictWithPermission(policy, permission)
        );

        if (conflictingPolicies.length > 0) {
          conflicts.push({
            id: `scope_ambiguity_${role.id}_${permission.id}`,
            type: 'scope_ambiguity',
            severity: 'medium',
            description: `Role "${role.name}" permission "${permission.name}" has ambiguous scope with ABAC policies`,
            involvedPolicies: conflictingPolicies.map(p => p.id),
            involvedRoles: [role.id],
            involvedPermissions: [permission.id],
            suggestedResolution: `Clarify scope boundaries between RBAC permissions and ABAC policies`,
            autoResolvable: false,
            detectedAt: new Date()
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect temporal conflicts
   */
  private static async detectTemporalConflicts(
    policies: ABACPolicy[],
    roles: Role[],
    permissions: Permission[]
  ): Promise<PolicyConflict[]> {
    const conflicts: PolicyConflict[] = [];

    // Check for temporal conflicts in roles
    for (const role of roles) {
      if (role.validFrom && role.validUntil) {
        const validFrom = new Date(role.validFrom);
        const validUntil = new Date(role.validUntil);
        
        if (validFrom >= validUntil) {
          conflicts.push({
            id: `temporal_conflict_role_${role.id}`,
            type: 'temporal_conflict',
            severity: 'high',
            description: `Role "${role.name}" has invalid temporal constraints (validFrom >= validUntil)`,
            involvedRoles: [role.id],
            suggestedResolution: `Fix temporal constraints for role "${role.name}"`,
            autoResolvable: true,
            detectedAt: new Date()
          });
        }
      }
    }

    return conflicts;
  }

  // Helper methods
  private static async findOverlappingRules(
    policy1: ABACPolicy,
    policy2: ABACPolicy,
    context?: PolicyResolutionContext
  ): Promise<ConflictingRule[]> {
    const overlapping: ConflictingRule[] = [];

    for (const rule1 of policy1.rules) {
      for (const rule2 of policy2.rules) {
        if (await this.rulesOverlap(rule1, rule2, context)) {
          overlapping.push(
            {
              policyId: policy1.id,
              ruleId: rule1.id || 'unnamed',
              effect: policy1.effect,
              priority: policy1.priority,
              conditions: rule1.subject,
              specificity: this.calculateRuleSpecificity(rule1)
            },
            {
              policyId: policy2.id,
              ruleId: rule2.id || 'unnamed',
              effect: policy2.effect,
              priority: policy2.priority,
              conditions: rule2.subject,
              specificity: this.calculateRuleSpecificity(rule2)
            }
          );
        }
      }
    }

    return overlapping;
  }

  private static async rulesOverlap(
    rule1: PolicyRule,
    rule2: PolicyRule,
    context?: PolicyResolutionContext
  ): Promise<boolean> {
    // Check if rules have overlapping conditions
    // This is a simplified check - in production, implement more sophisticated overlap detection
    
    // Check action overlap
    const actionsOverlap = rule1.action.some(a1 => 
      rule2.action.some(a2 => a1 === a2 || a1 === '*' || a2 === '*')
    );
    
    if (!actionsOverlap) return false;

    // Check subject overlap
    const subjectOverlap = await this.conditionsOverlap(rule1.subject, rule2.subject);
    if (!subjectOverlap) return false;

    // Check resource overlap
    const resourceOverlap = await this.conditionsOverlap(rule1.resource, rule2.resource);
    return resourceOverlap;
  }

  private static async conditionsOverlap(
    conditions1: AttributeCondition[],
    conditions2: AttributeCondition[]
  ): Promise<boolean> {
    // Simplified overlap detection
    // In production, implement proper set theory-based overlap detection
    
    if (conditions1.length === 0 || conditions2.length === 0) return true;

    for (const cond1 of conditions1) {
      for (const cond2 of conditions2) {
        if (cond1.attribute === cond2.attribute) {
          if (await this.attributeConditionsOverlap(cond1, cond2)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private static async attributeConditionsOverlap(
    cond1: AttributeCondition,
    cond2: AttributeCondition
  ): Promise<boolean> {
    // Check if two attribute conditions can have overlapping values
    if (cond1.operator === 'equals' && cond2.operator === 'equals') {
      return cond1.value === cond2.value;
    }
    
    if (cond1.operator === 'in' && cond2.operator === 'in') {
      const array1 = Array.isArray(cond1.value) ? cond1.value : [cond1.value];
      const array2 = Array.isArray(cond2.value) ? cond2.value : [cond2.value];
      return array1.some(v => array2.includes(v));
    }

    // For other operators, assume potential overlap (conservative approach)
    return true;
  }

  private static calculateRuleSpecificity(rule: PolicyRule): number {
    let specificity = 0;
    
    // More conditions = higher specificity
    specificity += rule.subject.length * 10;
    specificity += rule.resource.length * 10;
    specificity += (rule.environment?.length || 0) * 5;
    
    // Specific actions vs wildcard
    if (!rule.action.includes('*')) {
      specificity += rule.action.length * 5;
    }

    return specificity;
  }

  private static calculateConflictSeverity(
    overlappingRules: ConflictingRule[],
    priority1: number,
    priority2: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    const priorityDiff = Math.abs(priority1 - priority2);
    const maxSpecificity = Math.max(...overlappingRules.map(r => r.specificity));

    if (priorityDiff === 0 && maxSpecificity > 50) return 'critical';
    if (priorityDiff === 0) return 'high';
    if (priorityDiff <= 10) return 'medium';
    return 'low';
  }

  private static suggestEffectConflictResolution(policy1: ABACPolicy, policy2: ABACPolicy): string {
    const higherPriorityPolicy = policy1.priority > policy2.priority ? policy1 : policy2;
    const lowerPriorityPolicy = policy1.priority <= policy2.priority ? policy1 : policy2;

    return `Consider adjusting priorities (currently ${policy1.name}: ${policy1.priority}, ${policy2.name}: ${policy2.priority}) or making conditions more specific. ` +
           `Current resolution: "${higherPriorityPolicy.name}" (${higherPriorityPolicy.effect}) takes precedence.`;
  }

  private static isAutoResolvableEffectConflict(policy1: ABACPolicy, policy2: ABACPolicy): boolean {
    // Auto-resolvable if priorities are different
    return policy1.priority !== policy2.priority;
  }

  private static async detectRuleContradiction(
    rule1: PolicyRule,
    rule2: PolicyRule,
    context?: PolicyResolutionContext
  ): Promise<boolean> {
    // Check if rules are mutually exclusive but both can be triggered
    // This is a simplified check
    return false; // Placeholder
  }

  private static mightConflictWithPermission(policy: ABACPolicy, permission: Permission): boolean {
    // Check if ABAC policy might conflict with RBAC permission
    return policy.rules.some(rule => 
      rule.action.includes(permission.action) || 
      rule.action.includes('*') ||
      rule.resource.some(res => res.attribute === 'type' && res.value === permission.resource)
    );
  }

  private static getSeverityWeight(severity: string): number {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[severity as keyof typeof weights] || 0;
  }
}

/**
 * Policy resolution strategies
 */
export class PolicyResolutionStrategies {
  private static strategies: Map<string, ResolutionStrategy> = new Map();

  static registerStrategy(strategy: ResolutionStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  static getStrategy(name: string): ResolutionStrategy | undefined {
    return this.strategies.get(name);
  }

  static getAllStrategies(): ResolutionStrategy[] {
    return Array.from(this.strategies.values()).sort((a, b) => b.priority - a.priority);
  }

  static registerBuiltInStrategies(): void {
    // Deny Wins Strategy
    this.registerStrategy({
      name: 'deny_wins',
      description: 'Deny takes precedence over allow in all conflicts',
      applicableConflictTypes: ['effect_conflict'],
      priority: 100,
      resolve: async (conflict, context) => {
        const denyPolicies = context.policies.filter(p => p.effect === 'deny');
        if (denyPolicies.length > 0) {
          return {
            decision: 'deny',
            reason: 'Deny policy takes precedence',
            confidence: 0.9,
            appliedStrategy: 'deny_wins',
            resolvedConflicts: [conflict.id],
            metadata: { denyPolicies: denyPolicies.map(p => p.id) }
          };
        }
        return {
          decision: 'allow',
          reason: 'No deny policies found',
          confidence: 0.8,
          appliedStrategy: 'deny_wins',
          resolvedConflicts: [conflict.id],
          metadata: {}
        };
      }
    });

    // Priority Based Strategy
    this.registerStrategy({
      name: 'priority_based',
      description: 'Higher priority policies take precedence',
      applicableConflictTypes: ['effect_conflict', 'priority_overlap'],
      priority: 90,
      resolve: async (conflict, context) => {
        const involvedPolicies = context.policies.filter(p => 
          conflict.involvedPolicies.includes(p.id)
        );
        
        const highestPriority = Math.max(...involvedPolicies.map(p => p.priority));
        const winningPolicies = involvedPolicies.filter(p => p.priority === highestPriority);
        
        if (winningPolicies.length === 1) {
          return {
            decision: winningPolicies[0].effect as 'allow' | 'deny',
            reason: `Policy "${winningPolicies[0].name}" has highest priority (${highestPriority})`,
            confidence: 0.85,
            appliedStrategy: 'priority_based',
            resolvedConflicts: [conflict.id],
            metadata: { winningPolicy: winningPolicies[0].id, priority: highestPriority }
          };
        }

        return {
          decision: 'deny',
          reason: 'Multiple policies with same highest priority - defaulting to deny',
          confidence: 0.6,
          appliedStrategy: 'priority_based',
          resolvedConflicts: [conflict.id],
          metadata: { tiedPolicies: winningPolicies.map(p => p.id) }
        };
      }
    });

    // Most Specific Strategy
    this.registerStrategy({
      name: 'most_specific',
      description: 'More specific rules take precedence over general ones',
      applicableConflictTypes: ['effect_conflict', 'scope_ambiguity'],
      priority: 80,
      resolve: async (conflict, context) => {
        if (!conflict.context?.conflictingRules) {
          return {
            decision: 'deny',
            reason: 'Cannot determine specificity without rule context',
            confidence: 0.3,
            appliedStrategy: 'most_specific',
            resolvedConflicts: [conflict.id],
            metadata: {}
          };
        }

        const rules = conflict.context.conflictingRules;
        const mostSpecific = rules.reduce((prev, current) => 
          current.specificity > prev.specificity ? current : prev
        );

        return {
          decision: mostSpecific.effect,
          reason: `Most specific rule from policy ${mostSpecific.policyId} (specificity: ${mostSpecific.specificity})`,
          confidence: 0.75,
          appliedStrategy: 'most_specific',
          resolvedConflicts: [conflict.id],
          metadata: { 
            winningRule: mostSpecific.ruleId,
            specificity: mostSpecific.specificity 
          }
        };
      }
    });

    // Context Aware Strategy
    this.registerStrategy({
      name: 'context_aware',
      description: 'Consider context factors like risk level and trust score',
      applicableConflictTypes: ['effect_conflict', 'scope_ambiguity'],
      priority: 70,
      resolve: async (conflict, context) => {
        const riskScore = context.attributeContext.computedAttributes?.risk_score || 0;
        const trustLevel = context.attributeContext.computedAttributes?.trust_level || 'low';
        
        // High risk or low trust - prefer deny
        if (riskScore > 70 || trustLevel === 'low') {
          return {
            decision: 'deny',
            reason: `High risk (${riskScore}) or low trust (${trustLevel}) - defaulting to deny`,
            confidence: 0.8,
            appliedStrategy: 'context_aware',
            resolvedConflicts: [conflict.id],
            metadata: { riskScore, trustLevel }
          };
        }

        // Low risk and high trust - allow more flexibility
        const allowPolicies = context.policies.filter(p => 
          p.effect === 'allow' && conflict.involvedPolicies.includes(p.id)
        );

        if (allowPolicies.length > 0) {
          return {
            decision: 'allow',
            reason: `Low risk (${riskScore}) and good trust (${trustLevel}) - allowing access`,
            confidence: 0.7,
            appliedStrategy: 'context_aware',
            resolvedConflicts: [conflict.id],
            metadata: { riskScore, trustLevel }
          };
        }

        return {
          decision: 'deny',
          reason: 'No allow policies found in conflict',
          confidence: 0.6,
          appliedStrategy: 'context_aware',
          resolvedConflicts: [conflict.id],
          metadata: { riskScore, trustLevel }
        };
      }
    });

    // Temporal Strategy
    this.registerStrategy({
      name: 'temporal_precedence',
      description: 'More recent policies take precedence',
      applicableConflictTypes: ['effect_conflict', 'temporal_conflict'],
      priority: 60,
      resolve: async (conflict, context) => {
        const involvedPolicies = context.policies.filter(p => 
          conflict.involvedPolicies.includes(p.id)
        );
        
        const mostRecent = involvedPolicies.reduce((prev, current) => 
          new Date(current.createdAt) > new Date(prev.createdAt) ? current : prev
        );

        return {
          decision: mostRecent.effect as 'allow' | 'deny',
          reason: `Most recent policy "${mostRecent.name}" (created: ${mostRecent.createdAt})`,
          confidence: 0.65,
          appliedStrategy: 'temporal_precedence',
          resolvedConflicts: [conflict.id],
          metadata: { 
            winningPolicy: mostRecent.id,
            createdAt: mostRecent.createdAt 
          }
        };
      }
    });
  }
}

/**
 * Enhanced policy combiner
 */
export class EnhancedPolicyCombiner {
  /**
   * Combine policies with conflict resolution
   */
  static async combinePolicies(
    context: PolicyResolutionContext
  ): Promise<PolicyCombinationResult> {
    const startTime = Date.now();
    const evaluationPath: EvaluationStep[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Step 1: Detect conflicts
    const conflicts = await PolicyConflictDetector.detectConflicts(
      context.policies,
      context.roles,
      context.permissions,
      context
    );

    evaluationPath.push({
      step: 'conflict_detection',
      component: 'abac',
      evaluation: conflicts.length > 0 ? 'failed' : 'passed',
      details: { conflictCount: conflicts.length },
      timestamp: new Date(),
      duration: Date.now() - startTime
    });

    // Step 2: Resolve conflicts
    const resolutions: PolicyResolution[] = [];
    for (const conflict of conflicts) {
      const resolution = await this.resolveConflict(conflict, context);
      resolutions.push(resolution);
      
      if (resolution.confidence < 0.7) {
        warnings.push(`Low confidence resolution for conflict: ${conflict.description}`);
      }
    }

    // Step 3: Apply combination strategy
    const combinationStrategy = context.config.conflictResolution || 'deny_wins';
    const finalDecision = await this.applyFinalCombinationStrategy(
      combinationStrategy,
      resolutions,
      context
    );

    // Step 4: Generate recommendations
    recommendations.push(...this.generateRecommendations(conflicts, resolutions));

    const result: PolicyCombinationResult = {
      finalDecision: finalDecision.decision,
      combinationStrategy,
      confidence: finalDecision.confidence,
      conflictsDetected: conflicts,
      conflictsResolved: resolutions,
      appliedPolicies: this.getAppliedPolicies(resolutions, context),
      evaluationPath,
      warnings,
      recommendations
    };

    evaluationPath.push({
      step: 'policy_combination',
      component: 'abac',
      evaluation: 'passed',
      details: { 
        finalDecision: result.finalDecision,
        confidence: result.confidence 
      },
      timestamp: new Date(),
      duration: Date.now() - startTime
    });

    return result;
  }

  private static async resolveConflict(
    conflict: PolicyConflict,
    context: PolicyResolutionContext
  ): Promise<PolicyResolution> {
    const strategies = PolicyResolutionStrategies.getAllStrategies();
    
    for (const strategy of strategies) {
      if (strategy.applicableConflictTypes.includes(conflict.type)) {
        try {
          const resolution = await strategy.resolve(conflict, context);
          return resolution;
        } catch (error) {
          console.error(`Strategy ${strategy.name} failed for conflict ${conflict.id}:`, error);
        }
      }
    }

    // Fallback resolution
    return {
      decision: 'deny',
      reason: 'No applicable resolution strategy found - defaulting to deny',
      confidence: 0.3,
      appliedStrategy: 'fallback',
      resolvedConflicts: [conflict.id],
      metadata: {}
    };
  }

  private static async applyFinalCombinationStrategy(
    strategy: string,
    resolutions: PolicyResolution[],
    context: PolicyResolutionContext
  ): Promise<{ decision: 'allow' | 'deny'; confidence: number }> {
    if (resolutions.length === 0) {
      return { decision: 'allow', confidence: 0.5 };
    }

    switch (strategy) {
      case 'deny_wins':
        const denyResolutions = resolutions.filter(r => r.decision === 'deny');
        if (denyResolutions.length > 0) {
          const avgConfidence = denyResolutions.reduce((sum, r) => sum + r.confidence, 0) / denyResolutions.length;
          return { decision: 'deny', confidence: avgConfidence };
        }
        const allowConfidence = resolutions.reduce((sum, r) => sum + r.confidence, 0) / resolutions.length;
        return { decision: 'allow', confidence: allowConfidence };

      case 'allow_wins':
        const allowResolutions = resolutions.filter(r => r.decision === 'allow');
        if (allowResolutions.length > 0) {
          const avgConfidence = allowResolutions.reduce((sum, r) => sum + r.confidence, 0) / allowResolutions.length;
          return { decision: 'allow', confidence: avgConfidence };
        }
        const denyConfidence = resolutions.reduce((sum, r) => sum + r.confidence, 0) / resolutions.length;
        return { decision: 'deny', confidence: denyConfidence };

      case 'highest_priority':
      case 'most_specific':
        const highestConfidence = resolutions.reduce((prev, current) => 
          current.confidence > prev.confidence ? current : prev
        );
        return { decision: highestConfidence.decision, confidence: highestConfidence.confidence };

      default:
        const totalConfidence = resolutions.reduce((sum, r) => sum + r.confidence, 0) / resolutions.length;
        const denyCount = resolutions.filter(r => r.decision === 'deny').length;
        return { 
          decision: denyCount > resolutions.length / 2 ? 'deny' : 'allow',
          confidence: totalConfidence 
        };
    }
  }

  private static getAppliedPolicies(
    resolutions: PolicyResolution[],
    context: PolicyResolutionContext
  ): string[] {
    const appliedPolicies = new Set<string>();
    
    resolutions.forEach(resolution => {
      Object.values(resolution.metadata).forEach(value => {
        if (typeof value === 'string' && context.policies.some(p => p.id === value)) {
          appliedPolicies.add(value);
        }
      });
    });

    return Array.from(appliedPolicies);
  }

  private static generateRecommendations(
    conflicts: PolicyConflict[],
    resolutions: PolicyResolution[]
  ): string[] {
    const recommendations: string[] = [];

    // High severity conflicts
    const criticalConflicts = conflicts.filter(c => c.severity === 'critical');
    if (criticalConflicts.length > 0) {
      recommendations.push(`${criticalConflicts.length} critical policy conflicts detected - immediate review required`);
    }

    // Low confidence resolutions
    const lowConfidenceResolutions = resolutions.filter(r => r.confidence < 0.6);
    if (lowConfidenceResolutions.length > 0) {
      recommendations.push(`${lowConfidenceResolutions.length} conflict resolutions have low confidence - consider policy refinement`);
    }

    // Auto-resolvable conflicts
    const autoResolvable = conflicts.filter(c => c.autoResolvable);
    if (autoResolvable.length > 0) {
      recommendations.push(`${autoResolvable.length} conflicts can be auto-resolved - consider enabling automatic resolution`);
    }

    return recommendations;
  }
}

// Initialize built-in strategies on module load
PolicyResolutionStrategies.registerBuiltInStrategies();
