/**
 * Advanced Policy Simulation and Testing Tools
 * Provides comprehensive testing, simulation, and validation capabilities for the hybrid RBAC-ABAC model
 */

import {
  User,
  Role,
  Permission,
  ABACPolicy,
  AccessRequest,
  AccessResponse,
  DetailedAccessResponse,
  AttributeResolutionContext,
  PolicyRule,
  AttributeCondition,
  HybridPolicyConfig
} from './iam.js';

import { EnhancedAccessControlEngine, AccessControlContext } from './access-control.js';
import { DynamicAttributeResolver } from './attribute-resolver.js';
import { PolicyConflictDetector, PolicyConflict } from './policy-resolver.js';

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  category: 'permission_test' | 'role_test' | 'policy_test' | 'conflict_test' | 'performance_test' | 'security_test';
  priority: 'low' | 'medium' | 'high' | 'critical';
  testCases: TestCase[];
  expectedResults: SimulationResult[];
  metadata?: Record<string, any>;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  input: TestInput;
  expectedOutcome: 'allow' | 'deny' | 'error';
  expectedReason?: string;
  expectedPolicies?: string[];
  expectedConflicts?: string[];
  tags?: string[];
}

export interface TestInput {
  user: Partial<User>;
  request: AccessRequest;
  roles?: Role[];
  permissions?: Permission[];
  policies?: ABACPolicy[];
  environment?: Record<string, any>;
  config?: HybridPolicyConfig;
}

export interface SimulationResult {
  testCaseId: string;
  passed: boolean;
  actualOutcome: 'allow' | 'deny' | 'error';
  actualReason: string;
  actualPolicies: string[];
  actualConflicts: PolicyConflict[];
  executionTime: number;
  confidence: number;
  warnings: string[];
  recommendations: string[];
  detailedResponse?: DetailedAccessResponse;
}

export interface SimulationReport {
  scenarioId: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  errorTests: number;
  averageExecutionTime: number;
  conflictsDetected: number;
  coverageReport: CoverageReport;
  performanceMetrics: PerformanceMetrics;
  securityAssessment: SecurityAssessment;
  results: SimulationResult[];
  summary: string;
  recommendations: string[];
}

export interface CoverageReport {
  rolesCovered: string[];
  permissionsCovered: string[];
  policiesCovered: string[];
  attributesCovered: string[];
  conditionsTestedCount: number;
  totalConditionsCount: number;
  coveragePercentage: number;
}

export interface PerformanceMetrics {
  minExecutionTime: number;
  maxExecutionTime: number;
  averageExecutionTime: number;
  percentile95: number;
  percentile99: number;
  throughputPerSecond: number;
  memoryUsage?: number;
}

export interface SecurityAssessment {
  privilegeEscalationRisk: 'low' | 'medium' | 'high' | 'critical';
  unauthorizedAccessRisk: 'low' | 'medium' | 'high' | 'critical';
  dataLeakageRisk: 'low' | 'medium' | 'high' | 'critical';
  conflictVulnerabilities: PolicyConflict[];
  securityRecommendations: string[];
  complianceIssues: string[];
}

export interface BenchmarkTest {
  name: string;
  description: string;
  testFunction: (context: AccessControlContext) => Promise<number>;
  expectedPerformance: number; // operations per second
  tolerance: number; // percentage tolerance
}

export interface PolicyValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  complexity: PolicyComplexity;
}

export interface ValidationError {
  type: 'syntax' | 'logic' | 'security' | 'performance' | 'compliance';
  severity: 'error' | 'warning' | 'info';
  message: string;
  location?: string;
  suggestion?: string;
}

export interface ValidationWarning {
  type: 'best_practice' | 'performance' | 'maintainability' | 'security';
  message: string;
  suggestion: string;
}

export interface ValidationSuggestion {
  type: 'optimization' | 'simplification' | 'enhancement';
  message: string;
  impact: 'low' | 'medium' | 'high';
}

export interface PolicyComplexity {
  score: number;
  level: 'simple' | 'moderate' | 'complex' | 'very_complex';
  factors: {
    ruleCount: number;
    conditionCount: number;
    attributeCount: number;
    nestingDepth: number;
    expressionComplexity: number;
  };
}

/**
 * Policy simulation engine
 */
export class PolicySimulator {
  private static scenarios: Map<string, SimulationScenario> = new Map();
  private static benchmarks: Map<string, BenchmarkTest> = new Map();

  /**
   * Register a simulation scenario
   */
  static registerScenario(scenario: SimulationScenario): void {
    this.scenarios.set(scenario.id, scenario);
  }

  /**
   * Register a benchmark test
   */
  static registerBenchmark(benchmark: BenchmarkTest): void {
    this.benchmarks.set(benchmark.name, benchmark);
  }

  /**
   * Run a specific simulation scenario
   */
  static async runSimulation(scenarioId: string): Promise<SimulationReport> {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) {
      throw new Error(`Simulation scenario not found: ${scenarioId}`);
    }

    const startTime = Date.now();
    const results: SimulationResult[] = [];
    const executionTimes: number[] = [];
    let conflictsDetected = 0;

    // Run all test cases
    for (const testCase of scenario.testCases) {
      const result = await this.runTestCase(testCase);
      results.push(result);
      executionTimes.push(result.executionTime);
      conflictsDetected += result.actualConflicts.length;
    }

    // Calculate metrics
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.filter(r => !r.passed && r.actualOutcome !== 'error').length;
    const errorTests = results.filter(r => r.actualOutcome === 'error').length;
    const averageExecutionTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;

    // Generate coverage report
    const coverageReport = this.generateCoverageReport(scenario, results);

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(executionTimes);

    // Assess security
    const securityAssessment = await this.assessSecurity(scenario, results);

    // Generate summary and recommendations
    const summary = this.generateSummary(results, performanceMetrics, securityAssessment);
    const recommendations = this.generateRecommendations(results, coverageReport, securityAssessment);

    return {
      scenarioId,
      totalTests: scenario.testCases.length,
      passedTests,
      failedTests,
      errorTests,
      averageExecutionTime,
      conflictsDetected,
      coverageReport,
      performanceMetrics,
      securityAssessment,
      results,
      summary,
      recommendations
    };
  }

  /**
   * Run a single test case
   */
  private static async runTestCase(testCase: TestCase): Promise<SimulationResult> {
    const startTime = Date.now();
    
    try {
      // Setup test context
      const context = await this.setupTestContext(testCase.input);
      
      // Run the access control evaluation
      const response = await EnhancedAccessControlEngine.evaluate(
        testCase.input.request,
        context
      );

      // Detect conflicts
      const conflicts = await PolicyConflictDetector.detectConflicts(
        context.policies,
        context.roles,
        context.permissions
      );

      const executionTime = Date.now() - startTime;

      // Determine if test passed
      const actualOutcome = response.allowed ? 'allow' : 'deny';
      const passed = this.evaluateTestResult(testCase, response, conflicts);

      return {
        testCaseId: testCase.id,
        passed,
        actualOutcome,
        actualReason: response.reason,
        actualPolicies: response.appliedPolicies,
        actualConflicts: conflicts,
        executionTime,
        confidence: (response as DetailedAccessResponse).confidence || 1.0,
        warnings: (response as DetailedAccessResponse).warnings || [],
        recommendations: (response as DetailedAccessResponse).recommendations || [],
        detailedResponse: response as DetailedAccessResponse
      };

    } catch (error) {
      return {
        testCaseId: testCase.id,
        passed: false,
        actualOutcome: 'error',
        actualReason: `Test execution error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        actualPolicies: [],
        actualConflicts: [],
        executionTime: Date.now() - startTime,
        confidence: 0,
        warnings: [`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Review test case setup and input data']
      };
    }
  }

  /**
   * Setup test context from test input
   */
  private static async setupTestContext(input: TestInput): Promise<AccessControlContext> {
    // Create full user object
    const user: User = {
      id: input.user.id || 'test_user',
      username: input.user.username || 'test_user',
      email: input.user.email || 'test@example.com',
      firstName: input.user.firstName || 'Test',
      lastName: input.user.lastName || 'User',
      status: input.user.status || 'active',
      roles: input.user.roles || [],
      attributes: input.user.attributes || {},
      createdAt: input.user.createdAt || new Date().toISOString()
    };

    // Setup attribute resolution context
    const attributeContext: AttributeResolutionContext = {
      userId: user.id,
      resourceId: input.request.resource,
      sessionId: `test_session_${Date.now()}`,
      requestTime: new Date(),
      clientInfo: {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      },
      computedAttributes: {
        user_id: user.id,
        user_roles: user.roles,
        user_attributes: user.attributes,
        current_time: new Date().toISOString(),
        is_test: true
      },
      externalAttributes: input.environment || {}
    };

    return {
      user,
      roles: input.roles || [],
      permissions: input.permissions || [],
      policies: input.policies || [],
      requestTime: new Date(),
      clientIp: '127.0.0.1',
      userAgent: 'Test Agent',
      environment: input.environment,
      config: input.config
    };
  }

  /**
   * Evaluate if test result matches expected outcome
   */
  private static evaluateTestResult(
    testCase: TestCase,
    response: AccessResponse | DetailedAccessResponse,
    conflicts: PolicyConflict[]
  ): boolean {
    const actualOutcome = response.allowed ? 'allow' : 'deny';
    
    // Check outcome
    if (actualOutcome !== testCase.expectedOutcome) {
      return false;
    }

    // Check reason if specified
    if (testCase.expectedReason && !response.reason.includes(testCase.expectedReason)) {
      return false;
    }

    // Check applied policies if specified
    if (testCase.expectedPolicies) {
      const hasAllExpectedPolicies = testCase.expectedPolicies.every(policy =>
        response.appliedPolicies.includes(policy)
      );
      if (!hasAllExpectedPolicies) {
        return false;
      }
    }

    // Check conflicts if specified
    if (testCase.expectedConflicts) {
      const actualConflictIds = conflicts.map(c => c.id);
      const hasAllExpectedConflicts = testCase.expectedConflicts.every(conflict =>
        actualConflictIds.some(id => id.includes(conflict))
      );
      if (!hasAllExpectedConflicts) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate coverage report
   */
  private static generateCoverageReport(
    scenario: SimulationScenario,
    results: SimulationResult[]
  ): CoverageReport {
    const rolesCovered = new Set<string>();
    const permissionsCovered = new Set<string>();
    const policiesCovered = new Set<string>();
    const attributesCovered = new Set<string>();

    results.forEach(result => {
      if (result.detailedResponse) {
        // Collect covered entities
        result.actualPolicies.forEach(policy => policiesCovered.add(policy));
        
        Object.keys(result.detailedResponse.computedAttributes || {}).forEach(attr => 
          attributesCovered.add(attr)
        );
      }
    });

    // Count total conditions across all test cases
    let conditionsTestedCount = 0;
    let totalConditionsCount = 0;

    scenario.testCases.forEach(testCase => {
      const policies = testCase.input.policies || [];
      policies.forEach(policy => {
        policy.rules.forEach(rule => {
          totalConditionsCount += rule.subject.length + rule.resource.length + (rule.environment?.length || 0);
        });
      });
    });

    // Estimate tested conditions (simplified)
    conditionsTestedCount = Math.floor(totalConditionsCount * 0.7); // Placeholder

    const coveragePercentage = totalConditionsCount > 0 ? 
      (conditionsTestedCount / totalConditionsCount) * 100 : 100;

    return {
      rolesCovered: Array.from(rolesCovered),
      permissionsCovered: Array.from(permissionsCovered),
      policiesCovered: Array.from(policiesCovered),
      attributesCovered: Array.from(attributesCovered),
      conditionsTestedCount,
      totalConditionsCount,
      coveragePercentage
    };
  }

  /**
   * Calculate performance metrics
   */
  private static calculatePerformanceMetrics(executionTimes: number[]): PerformanceMetrics {
    const sorted = executionTimes.sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const average = sum / sorted.length;

    const percentile95Index = Math.floor(sorted.length * 0.95);
    const percentile99Index = Math.floor(sorted.length * 0.99);

    return {
      minExecutionTime: sorted[0] || 0,
      maxExecutionTime: sorted[sorted.length - 1] || 0,
      averageExecutionTime: average,
      percentile95: sorted[percentile95Index] || 0,
      percentile99: sorted[percentile99Index] || 0,
      throughputPerSecond: average > 0 ? 1000 / average : 0
    };
  }

  /**
   * Assess security based on test results
   */
  private static async assessSecurity(
    scenario: SimulationScenario,
    results: SimulationResult[]
  ): Promise<SecurityAssessment> {
    const conflictVulnerabilities: PolicyConflict[] = [];
    const securityRecommendations: string[] = [];
    const complianceIssues: string[] = [];

    // Collect all conflicts
    results.forEach(result => {
      conflictVulnerabilities.push(...result.actualConflicts);
    });

    // Assess risks
    let privilegeEscalationRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let unauthorizedAccessRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let dataLeakageRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check for security patterns
    const unauthorizedAccessTests = results.filter(r => 
      r.expectedOutcome === 'deny' && r.actualOutcome === 'allow'
    );

    if (unauthorizedAccessTests.length > 0) {
      unauthorizedAccessRisk = 'high';
      securityRecommendations.push(`${unauthorizedAccessTests.length} test cases allowed unauthorized access`);
    }

    // Check for critical conflicts
    const criticalConflicts = conflictVulnerabilities.filter(c => c.severity === 'critical');
    if (criticalConflicts.length > 0) {
      privilegeEscalationRisk = 'critical';
      securityRecommendations.push(`${criticalConflicts.length} critical policy conflicts detected`);
    }

    // Check for data leakage patterns
    const dataLeakageIndicators = results.filter(r => 
      r.actualReason.includes('field') || r.actualReason.includes('sensitive')
    );

    if (dataLeakageIndicators.length > results.length * 0.1) {
      dataLeakageRisk = 'medium';
      securityRecommendations.push('Potential data leakage risks detected in field access patterns');
    }

    return {
      privilegeEscalationRisk,
      unauthorizedAccessRisk,
      dataLeakageRisk,
      conflictVulnerabilities,
      securityRecommendations,
      complianceIssues
    };
  }

  /**
   * Generate summary
   */
  private static generateSummary(
    results: SimulationResult[],
    performanceMetrics: PerformanceMetrics,
    securityAssessment: SecurityAssessment
  ): string {
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const passRate = (passed / total * 100).toFixed(1);

    const securityStatus = this.getOverallSecurityStatus(securityAssessment);
    const performanceStatus = performanceMetrics.averageExecutionTime < 100 ? 'good' : 'needs improvement';

    return `Simulation completed: ${passed}/${total} tests passed (${passRate}%). ` +
           `Performance: ${performanceStatus} (${performanceMetrics.averageExecutionTime.toFixed(1)}ms avg). ` +
           `Security: ${securityStatus}.`;
  }

  /**
   * Generate recommendations
   */
  private static generateRecommendations(
    results: SimulationResult[],
    coverageReport: CoverageReport,
    securityAssessment: SecurityAssessment
  ): string[] {
    const recommendations: string[] = [];

    // Coverage recommendations
    if (coverageReport.coveragePercentage < 80) {
      recommendations.push(`Increase test coverage (currently ${coverageReport.coveragePercentage.toFixed(1)}%)`);
    }

    // Performance recommendations
    const slowTests = results.filter(r => r.executionTime > 1000).length;
    if (slowTests > 0) {
      recommendations.push(`${slowTests} tests are slow (>1s) - consider optimization`);
    }

    // Security recommendations
    recommendations.push(...securityAssessment.securityRecommendations);

    // Test quality recommendations
    const lowConfidenceTests = results.filter(r => r.confidence < 0.7).length;
    if (lowConfidenceTests > 0) {
      recommendations.push(`${lowConfidenceTests} tests have low confidence - review test scenarios`);
    }

    return recommendations;
  }

  private static getOverallSecurityStatus(assessment: SecurityAssessment): string {
    const risks = [
      assessment.privilegeEscalationRisk,
      assessment.unauthorizedAccessRisk,
      assessment.dataLeakageRisk
    ];

    if (risks.includes('critical')) return 'critical';
    if (risks.includes('high')) return 'high risk';
    if (risks.includes('medium')) return 'medium risk';
    return 'low risk';
  }

  /**
   * Run performance benchmarks
   */
  static async runBenchmarks(context: AccessControlContext): Promise<Map<string, number>> {
    const results = new Map<string, number>();

    for (const [name, benchmark] of this.benchmarks) {
      try {
        const performance = await benchmark.testFunction(context);
        results.set(name, performance);
      } catch (error) {
        console.error(`Benchmark ${name} failed:`, error);
        results.set(name, 0);
      }
    }

    return results;
  }

  /**
   * Generate built-in simulation scenarios
   */
  static generateBuiltInScenarios(): void {
    // Basic permission test scenario
    this.registerScenario({
      id: 'basic_permission_test',
      name: 'Basic Permission Test',
      description: 'Test basic RBAC permission evaluation',
      category: 'permission_test',
      priority: 'medium',
      testCases: [
        {
          id: 'admin_full_access',
          name: 'Admin Full Access',
          description: 'Admin user should have full access',
          input: {
            user: {
              id: 'admin_user',
              roles: ['admin'],
              attributes: { department: 'IT' }
            },
            request: {
              userId: 'admin_user',
              resource: 'users',
              action: 'read'
            },
            roles: [{
              id: 'admin',
              name: 'Administrator',
              description: 'Full access',
              permissions: ['read_all'],
              isSystemRole: true,
              createdAt: new Date().toISOString(),
              level: 1,
              status: 'active',
              isTemplate: false
            }],
            permissions: [{
              id: 'read_all',
              name: 'Read All',
              resource: '*',
              action: 'read',
              description: 'Read all resources',
              category: 'system',
              scope: 'global',
              createdAt: new Date().toISOString(),
              isSystemPermission: true,
              risk: 'medium',
              complianceRequired: false
            }]
          },
          expectedOutcome: 'allow',
          expectedReason: 'RBAC permission',
          expectedPolicies: ['read_all']
        }
      ],
      expectedResults: []
    });

    // ABAC policy test scenario
    this.registerScenario({
      id: 'abac_policy_test',
      name: 'ABAC Policy Test',
      description: 'Test ABAC policy evaluation with context',
      category: 'policy_test',
      priority: 'high',
      testCases: [
        {
          id: 'business_hours_access',
          name: 'Business Hours Access',
          description: 'Access should be allowed during business hours',
          input: {
            user: {
              id: 'regular_user',
              roles: ['user'],
              attributes: { department: 'Sales' }
            },
            request: {
              userId: 'regular_user',
              resource: 'reports',
              action: 'read'
            },
            policies: [{
              id: 'business_hours_policy',
              name: 'Business Hours Only',
              description: 'Allow access only during business hours',
              rules: [{
                subject: [{ attribute: 'department', operator: 'equals', value: 'Sales' }],
                resource: [{ attribute: 'type', operator: 'equals', value: 'reports' }],
                action: ['read'],
                environment: [
                  { attribute: 'time', operator: 'greater_than', value: '09:00' },
                  { attribute: 'time', operator: 'less_than', value: '17:00' }
                ]
              }],
              effect: 'allow',
              priority: 100,
              status: 'active',
              createdAt: new Date().toISOString(),
              category: 'global',
              evaluationMode: 'strict',
              conflictResolution: 'deny_wins'
            }],
            environment: {
              time: '14:00' // Business hours
            }
          },
          expectedOutcome: 'allow',
          expectedReason: 'ABAC policy',
          expectedPolicies: ['business_hours_policy']
        }
      ],
      expectedResults: []
    });

    // Conflict detection scenario
    this.registerScenario({
      id: 'conflict_detection_test',
      name: 'Policy Conflict Detection',
      description: 'Test detection and resolution of policy conflicts',
      category: 'conflict_test',
      priority: 'critical',
      testCases: [
        {
          id: 'allow_deny_conflict',
          name: 'Allow vs Deny Conflict',
          description: 'Test conflicting allow and deny policies',
          input: {
            user: {
              id: 'test_user',
              roles: ['user'],
              attributes: { department: 'Finance' }
            },
            request: {
              userId: 'test_user',
              resource: 'financial_data',
              action: 'read'
            },
            policies: [
              {
                id: 'allow_finance_access',
                name: 'Allow Finance Access',
                description: 'Allow finance department access',
                rules: [{
                  subject: [{ attribute: 'department', operator: 'equals', value: 'Finance' }],
                  resource: [{ attribute: 'type', operator: 'equals', value: 'financial_data' }],
                  action: ['read']
                }],
                effect: 'allow',
                priority: 100,
                status: 'active',
                createdAt: new Date().toISOString(),
                category: 'global',
                evaluationMode: 'strict',
                conflictResolution: 'deny_wins'
              },
              {
                id: 'deny_sensitive_access',
                name: 'Deny Sensitive Access',
                description: 'Deny access to sensitive data',
                rules: [{
                  subject: [{ attribute: 'clearance_level', operator: 'not_equals', value: 'high' }],
                  resource: [{ attribute: 'type', operator: 'equals', value: 'financial_data' }],
                  action: ['read']
                }],
                effect: 'deny',
                priority: 100,
                status: 'active',
                createdAt: new Date().toISOString(),
                category: 'global',
                evaluationMode: 'strict',
                conflictResolution: 'deny_wins'
              }
            ]
          },
          expectedOutcome: 'deny',
          expectedConflicts: ['allow_deny_conflict'],
          tags: ['conflict', 'priority']
        }
      ],
      expectedResults: []
    });
  }

  /**
   * Register performance benchmarks
   */
  static registerBuiltInBenchmarks(): void {
    this.registerBenchmark({
      name: 'basic_rbac_evaluation',
      description: 'Basic RBAC permission evaluation performance',
      expectedPerformance: 10000, // ops/sec
      tolerance: 20, // 20% tolerance
      testFunction: async (context) => {
        const iterations = 1000;
        const request: AccessRequest = {
          userId: context.user.id,
          resource: 'test_resource',
          action: 'read'
        };

        const startTime = Date.now();
        for (let i = 0; i < iterations; i++) {
          await EnhancedAccessControlEngine.evaluate(request, context);
        }
        const endTime = Date.now();

        return iterations / ((endTime - startTime) / 1000);
      }
    });

    this.registerBenchmark({
      name: 'complex_abac_evaluation',
      description: 'Complex ABAC policy evaluation performance',
      expectedPerformance: 1000, // ops/sec
      tolerance: 30, // 30% tolerance
      testFunction: async (context) => {
        const iterations = 100;
        const request: AccessRequest = {
          userId: context.user.id,
          resource: 'complex_resource',
          action: 'write',
          context: { 
            resourceType: 'sensitive',
            department: 'finance',
            classification: 'confidential'
          }
        };

        const startTime = Date.now();
        for (let i = 0; i < iterations; i++) {
          await EnhancedAccessControlEngine.evaluate(request, context);
        }
        const endTime = Date.now();

        return iterations / ((endTime - startTime) / 1000);
      }
    });
  }
}

/**
 * Policy validator for validation and complexity analysis
 */
export class PolicyValidator {
  /**
   * Validate policy configuration
   */
  static validatePolicy(policy: ABACPolicy): PolicyValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Validate basic structure
    this.validateBasicStructure(policy, errors);

    // Validate rules
    this.validateRules(policy.rules, errors, warnings);

    // Check for logical issues
    this.checkLogicalIssues(policy, warnings);

    // Analyze complexity
    const complexity = this.analyzeComplexity(policy);

    // Generate suggestions
    this.generateSuggestions(policy, complexity, suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      complexity
    };
  }

  private static validateBasicStructure(policy: ABACPolicy, errors: ValidationError[]): void {
    if (!policy.id) {
      errors.push({
        type: 'syntax',
        severity: 'error',
        message: 'Policy must have an ID',
        location: 'policy.id'
      });
    }

    if (!policy.name || policy.name.trim() === '') {
      errors.push({
        type: 'syntax',
        severity: 'error',
        message: 'Policy must have a name',
        location: 'policy.name'
      });
    }

    if (!['allow', 'deny'].includes(policy.effect)) {
      errors.push({
        type: 'syntax',
        severity: 'error',
        message: 'Policy effect must be either "allow" or "deny"',
        location: 'policy.effect'
      });
    }

    if (policy.priority < 1 || policy.priority > 1000) {
      errors.push({
        type: 'logic',
        severity: 'error',
        message: 'Policy priority must be between 1 and 1000',
        location: 'policy.priority'
      });
    }
  }

  private static validateRules(rules: PolicyRule[], errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (rules.length === 0) {
      errors.push({
        type: 'logic',
        severity: 'error',
        message: 'Policy must have at least one rule',
        location: 'policy.rules'
      });
      return;
    }

    rules.forEach((rule, index) => {
      // Validate rule structure
      if (!rule.subject || rule.subject.length === 0) {
        warnings.push({
          type: 'best_practice',
          message: `Rule ${index + 1} has no subject conditions`,
          suggestion: 'Consider adding subject conditions for better security'
        });
      }

      if (!rule.action || rule.action.length === 0) {
        errors.push({
          type: 'logic',
          severity: 'error',
          message: `Rule ${index + 1} must specify at least one action`,
          location: `policy.rules[${index}].action`
        });
      }

      // Validate conditions
      [...rule.subject, ...rule.resource, ...(rule.environment || [])].forEach((condition, condIndex) => {
        this.validateCondition(condition, `rule[${index}].condition[${condIndex}]`, errors);
      });
    });
  }

  private static validateCondition(
    condition: AttributeCondition,
    location: string,
    errors: ValidationError[]
  ): void {
    const validOperators = [
      'equals', 'not_equals', 'contains', 'in', 'not_in',
      'greater_than', 'less_than', 'starts_with', 'ends_with',
      'matches_regex', 'exists', 'is_null', 'is_empty'
    ];

    if (!validOperators.includes(condition.operator)) {
      errors.push({
        type: 'syntax',
        severity: 'error',
        message: `Invalid operator: ${condition.operator}`,
        location: `${location}.operator`,
        suggestion: `Use one of: ${validOperators.join(', ')}`
      });
    }

    if (!condition.attribute || condition.attribute.trim() === '') {
      errors.push({
        type: 'syntax',
        severity: 'error',
        message: 'Condition must specify an attribute',
        location: `${location}.attribute`
      });
    }

    // Validate value based on operator
    if (['in', 'not_in'].includes(condition.operator) && !Array.isArray(condition.value)) {
      errors.push({
        type: 'logic',
        severity: 'error',
        message: `Operator ${condition.operator} requires an array value`,
        location: `${location}.value`
      });
    }
  }

  private static checkLogicalIssues(policy: ABACPolicy, warnings: ValidationWarning[]): void {
    // Check for overly broad permissions
    const hasWildcardActions = policy.rules.some(rule => rule.action.includes('*'));
    if (hasWildcardActions && policy.effect === 'allow') {
      warnings.push({
        type: 'security',
        message: 'Policy allows wildcard actions - this may be overly permissive',
        suggestion: 'Consider specifying specific actions instead of using wildcards'
      });
    }

    // Check for empty resource conditions
    const hasEmptyResourceConditions = policy.rules.some(rule => rule.resource.length === 0);
    if (hasEmptyResourceConditions) {
      warnings.push({
        type: 'best_practice',
        message: 'Some rules have no resource conditions',
        suggestion: 'Add resource conditions to improve specificity and security'
      });
    }
  }

  private static analyzeComplexity(policy: ABACPolicy): PolicyComplexity {
    const ruleCount = policy.rules.length;
    let conditionCount = 0;
    let attributeCount = 0;
    let maxNestingDepth = 0;
    let expressionComplexity = 0;

    const uniqueAttributes = new Set<string>();

    policy.rules.forEach(rule => {
      const ruleConditions = [...rule.subject, ...rule.resource, ...(rule.environment || [])];
      conditionCount += ruleConditions.length;

      ruleConditions.forEach(condition => {
        uniqueAttributes.add(condition.attribute);
        
        // Check for dynamic expressions
        if (condition.isDynamic && condition.expression) {
          expressionComplexity += condition.expression.length / 10;
        }

        // Estimate nesting depth (simplified)
        if (condition.attribute.includes('.')) {
          const depth = condition.attribute.split('.').length;
          maxNestingDepth = Math.max(maxNestingDepth, depth);
        }
      });
    });

    attributeCount = uniqueAttributes.size;

    // Calculate complexity score
    let score = 0;
    score += ruleCount * 10;
    score += conditionCount * 5;
    score += attributeCount * 3;
    score += maxNestingDepth * 15;
    score += expressionComplexity;

    let level: 'simple' | 'moderate' | 'complex' | 'very_complex';
    if (score < 50) level = 'simple';
    else if (score < 150) level = 'moderate';
    else if (score < 300) level = 'complex';
    else level = 'very_complex';

    return {
      score,
      level,
      factors: {
        ruleCount,
        conditionCount,
        attributeCount,
        nestingDepth: maxNestingDepth,
        expressionComplexity
      }
    };
  }

  private static generateSuggestions(
    policy: ABACPolicy,
    complexity: PolicyComplexity,
    suggestions: ValidationSuggestion[]
  ): void {
    if (complexity.level === 'very_complex') {
      suggestions.push({
        type: 'simplification',
        message: 'Policy is very complex - consider breaking it into smaller, more focused policies',
        impact: 'high'
      });
    }

    if (complexity.factors.ruleCount > 10) {
      suggestions.push({
        type: 'optimization',
        message: 'Large number of rules - consider consolidating similar rules',
        impact: 'medium'
      });
    }

    if (complexity.factors.nestingDepth > 3) {
      suggestions.push({
        type: 'simplification',
        message: 'Deep attribute nesting detected - consider flattening the attribute structure',
        impact: 'medium'
      });
    }
  }
}

// Initialize built-in scenarios and benchmarks
PolicySimulator.generateBuiltInScenarios();
PolicySimulator.registerBuiltInBenchmarks();
