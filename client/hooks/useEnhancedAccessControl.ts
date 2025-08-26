/**
 * Enhanced Access Control Hooks for Hybrid RBAC-ABAC Model
 * Provides comprehensive client-side access control with advanced features
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Role,
  Permission,
  ABACPolicy,
  AccessRequest,
  DetailedAccessResponse,
  AttributeResolutionContext,
  PolicyConflict,
  HybridPolicyConfig,
  SimulationReport,
  PolicyValidationResult,
  AttributeCondition
} from '../../shared/iam';

// Enhanced hook interfaces
export interface EnhancedPermissionResult {
  hasPermission: boolean;
  loading: boolean;
  reason: string;
  confidence: number;
  appliedPolicies: string[];
  appliedRules: string[];
  warnings: string[];
  recommendations: string[];
  evaluationTime: number;
  conflictsDetected: PolicyConflict[];
  refetch: () => Promise<void>;
}

export interface AttributeResolutionResult {
  value: any;
  loading: boolean;
  error: string | null;
  cached: boolean;
  resolvedAt: string | null;
  dependencies: string[];
  refetch: () => Promise<void>;
}

export interface ConflictAnalysisResult {
  conflicts: PolicyConflict[];
  conflictCount: number;
  criticalConflicts: number;
  autoResolvableConflicts: number;
  loading: boolean;
  lastAnalyzed: Date | null;
  refetch: () => Promise<void>;
}

export interface SimulationResult {
  report: SimulationReport | null;
  loading: boolean;
  error: string | null;
  runSimulation: (scenarioId: string, customScenario?: any) => Promise<void>;
}

export interface ExpressionEvaluationResult {
  value: any;
  loading: boolean;
  error: string | null;
  dependencies: string[];
  computationTime: number;
  securityViolations: string[];
  evaluate: (expression: string, context?: any) => Promise<void>;
}

export interface PolicyValidationHook {
  validationResult: PolicyValidationResult | null;
  loading: boolean;
  error: string | null;
  validate: (policy: ABACPolicy) => Promise<void>;
}

/**
 * Enhanced permission hook with detailed evaluation
 */
export function useEnhancedPermission(
  resource: string,
  action: string,
  context?: Record<string, any>,
  config?: HybridPolicyConfig
): EnhancedPermissionResult {
  const { user } = useAuth();
  const [result, setResult] = useState<Omit<EnhancedPermissionResult, 'refetch'>>({
    hasPermission: false,
    loading: true,
    reason: '',
    confidence: 0,
    appliedPolicies: [],
    appliedRules: [],
    warnings: [],
    recommendations: [],
    evaluationTime: 0,
    conflictsDetected: []
  });

  const checkPermission = useCallback(async () => {
    if (!user) {
      setResult(prev => ({
        ...prev,
        hasPermission: false,
        loading: false,
        reason: 'User not authenticated',
        confidence: 0
      }));
      return;
    }

    setResult(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch('/api/access-control-enhanced/evaluate-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          request: {
            resource,
            action,
            context
          },
          config
        })
      });

      if (!response.ok) {
        throw new Error(`Permission evaluation failed: ${response.statusText}`);
      }

      const data: DetailedAccessResponse = await response.json();

      setResult({
        hasPermission: data.allowed,
        loading: false,
        reason: data.reason,
        confidence: data.confidence || 1.0,
        appliedPolicies: data.appliedPolicies,
        appliedRules: data.appliedRules || [],
        warnings: data.warnings || [],
        recommendations: data.recommendations || [],
        evaluationTime: data.evaluationTime,
        conflictsDetected: [] // Would be populated from evaluation path
      });

    } catch (error) {
      setResult({
        hasPermission: false,
        loading: false,
        reason: `Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0,
        appliedPolicies: [],
        appliedRules: [],
        warnings: [`Permission evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Check network connection and try again'],
        evaluationTime: 0,
        conflictsDetected: []
      });
    }
  }, [user, resource, action, JSON.stringify(context), JSON.stringify(config)]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    ...result,
    refetch: checkPermission
  };
}

/**
 * Dynamic attribute resolution hook
 */
export function useAttributeResolution(
  attributeName: string,
  context?: Record<string, any>
): AttributeResolutionResult {
  const { user } = useAuth();
  const [result, setResult] = useState<Omit<AttributeResolutionResult, 'refetch'>>({
    value: null,
    loading: true,
    error: null,
    cached: false,
    resolvedAt: null,
    dependencies: []
  });

  const resolveAttribute = useCallback(async () => {
    if (!user || !attributeName) {
      setResult(prev => ({
        ...prev,
        loading: false,
        error: 'User not authenticated or attribute name not provided'
      }));
      return;
    }

    setResult(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/access-control-enhanced/resolve-attribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          attributeName,
          context: {
            computedAttributes: context?.computedAttributes || {},
            externalAttributes: context?.externalAttributes || {}
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Attribute resolution failed: ${response.statusText}`);
      }

      const data = await response.json();

      setResult({
        value: data.value,
        loading: false,
        error: null,
        cached: data.cached || false,
        resolvedAt: data.resolvedAt,
        dependencies: data.dependencies || []
      });

    } catch (error) {
      setResult({
        value: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        cached: false,
        resolvedAt: null,
        dependencies: []
      });
    }
  }, [user, attributeName, JSON.stringify(context)]);

  useEffect(() => {
    resolveAttribute();
  }, [resolveAttribute]);

  return {
    ...result,
    refetch: resolveAttribute
  };
}

/**
 * Policy conflict analysis hook
 */
export function useConflictAnalysis(): ConflictAnalysisResult {
  const { user } = useAuth();
  const [result, setResult] = useState<Omit<ConflictAnalysisResult, 'refetch'>>({
    conflicts: [],
    conflictCount: 0,
    criticalConflicts: 0,
    autoResolvableConflicts: 0,
    loading: true,
    lastAnalyzed: null
  });

  const analyzeConflicts = useCallback(async () => {
    if (!user) {
      setResult(prev => ({
        ...prev,
        loading: false,
        conflicts: [],
        conflictCount: 0
      }));
      return;
    }

    setResult(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch('/api/access-control-enhanced/conflicts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Conflict analysis failed: ${response.statusText}`);
      }

      const data = await response.json();

      const criticalConflicts = data.conflicts.filter((c: PolicyConflict) => c.severity === 'critical').length;
      const autoResolvableConflicts = data.conflicts.filter((c: PolicyConflict) => c.autoResolvable).length;

      setResult({
        conflicts: data.conflicts,
        conflictCount: data.conflictCount,
        criticalConflicts,
        autoResolvableConflicts,
        loading: false,
        lastAnalyzed: new Date()
      });

    } catch (error) {
      console.error('Conflict analysis error:', error);
      setResult(prev => ({
        ...prev,
        loading: false,
        lastAnalyzed: new Date()
      }));
    }
  }, [user]);

  useEffect(() => {
    analyzeConflicts();
  }, [analyzeConflicts]);

  return {
    ...result,
    refetch: analyzeConflicts
  };
}

/**
 * Policy simulation hook
 */
export function usePolicySimulation(): SimulationResult {
  const [result, setResult] = useState<Omit<SimulationResult, 'runSimulation'>>({
    report: null,
    loading: false,
    error: null
  });

  const runSimulation = useCallback(async (scenarioId: string, customScenario?: any) => {
    setResult(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/access-control-enhanced/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          scenarioId,
          customScenario
        })
      });

      if (!response.ok) {
        throw new Error(`Simulation failed: ${response.statusText}`);
      }

      const report: SimulationReport = await response.json();

      setResult({
        report,
        loading: false,
        error: null
      });

    } catch (error) {
      setResult({
        report: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, []);

  return {
    ...result,
    runSimulation
  };
}

/**
 * Expression evaluation hook
 */
export function useExpressionEvaluation(): ExpressionEvaluationResult {
  const [result, setResult] = useState<Omit<ExpressionEvaluationResult, 'evaluate'>>({
    value: null,
    loading: false,
    error: null,
    dependencies: [],
    computationTime: 0,
    securityViolations: []
  });

  const evaluate = useCallback(async (expression: string, context?: any) => {
    setResult(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/access-control-enhanced/evaluate-expression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          expression,
          context: context || {}
        })
      });

      if (!response.ok) {
        throw new Error(`Expression evaluation failed: ${response.statusText}`);
      }

      const data = await response.json();

      setResult({
        value: data.value,
        loading: false,
        error: null,
        dependencies: data.dependencies || [],
        computationTime: data.computationTime || 0,
        securityViolations: data.securityViolations || []
      });

    } catch (error) {
      setResult({
        value: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        dependencies: [],
        computationTime: 0,
        securityViolations: []
      });
    }
  }, []);

  return {
    ...result,
    evaluate
  };
}

/**
 * Policy validation hook
 */
export function usePolicyValidation(): PolicyValidationHook {
  const [result, setResult] = useState<Omit<PolicyValidationHook, 'validate'>>({
    validationResult: null,
    loading: false,
    error: null
  });

  const validate = useCallback(async (policy: ABACPolicy) => {
    setResult(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/access-control-enhanced/validate-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ policy })
      });

      if (!response.ok) {
        throw new Error(`Policy validation failed: ${response.statusText}`);
      }

      const validationResult: PolicyValidationResult = await response.json();

      setResult({
        validationResult,
        loading: false,
        error: null
      });

    } catch (error) {
      setResult({
        validationResult: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, []);

  return {
    ...result,
    validate
  };
}

/**
 * Enhanced context hook with computed attributes
 */
export function useEnhancedAccessControlContext() {
  const { user } = useAuth();
  const [context, setContext] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [additionalAttributes, setAdditionalAttributes] = useState<Record<string, any>>({});

  const loadContext = useCallback(async () => {
    if (!user) {
      setContext(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/access-control-enhanced/context-enhanced', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load enhanced context');
      }

      const data = await response.json();
      setContext(data);
      setAdditionalAttributes(data.additionalAttributes || {});
    } catch (error) {
      console.error('Failed to load enhanced access control context:', error);
      setContext(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  return { 
    context, 
    loading, 
    additionalAttributes,
    refetch: loadContext 
  };
}

/**
 * Multiple enhanced permissions hook
 */
export function useEnhancedPermissions(
  permissions: Array<{ resource: string; action: string; context?: Record<string, any> }>,
  config?: HybridPolicyConfig
) {
  const { user } = useAuth();
  const [results, setResults] = useState<Record<string, EnhancedPermissionResult>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const checkPermissions = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const newResults: Record<string, EnhancedPermissionResult> = {};

    try {
      // Check permissions in parallel
      const permissionPromises = permissions.map(async (perm) => {
        const key = `${perm.resource}:${perm.action}`;
        
        try {
          const response = await fetch('/api/access-control-enhanced/evaluate-enhanced', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
              request: {
                resource: perm.resource,
                action: perm.action,
                context: perm.context
              },
              config
            })
          });

          if (!response.ok) {
            throw new Error(`Permission evaluation failed: ${response.statusText}`);
          }

          const data: DetailedAccessResponse = await response.json();

          return {
            key,
            result: {
              hasPermission: data.allowed,
              loading: false,
              reason: data.reason,
              confidence: data.confidence || 1.0,
              appliedPolicies: data.appliedPolicies,
              appliedRules: data.appliedRules || [],
              warnings: data.warnings || [],
              recommendations: data.recommendations || [],
              evaluationTime: data.evaluationTime,
              conflictsDetected: [],
              refetch: () => checkPermissions()
            } as EnhancedPermissionResult
          };
        } catch (error) {
          return {
            key,
            result: {
              hasPermission: false,
              loading: false,
              reason: `Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              confidence: 0,
              appliedPolicies: [],
              appliedRules: [],
              warnings: [`Permission evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
              recommendations: ['Check network connection and try again'],
              evaluationTime: 0,
              conflictsDetected: [],
              refetch: () => checkPermissions()
            } as EnhancedPermissionResult
          };
        }
      });

      const permissionResults = await Promise.all(permissionPromises);
      
      permissionResults.forEach(({ key, result }) => {
        newResults[key] = result;
      });

      setResults(newResults);
    } catch (error) {
      console.error('Enhanced permission check failed:', error);
    } finally {
      setLoading(false);
    }
  }, [user, JSON.stringify(permissions), JSON.stringify(config)]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const hasPermission = useCallback((resource: string, action: string) => {
    const key = `${resource}:${action}`;
    return results[key]?.hasPermission || false;
  }, [results]);

  const getPermissionDetails = useCallback((resource: string, action: string) => {
    const key = `${resource}:${action}`;
    return results[key] || null;
  }, [results]);

  return { 
    results, 
    loading, 
    hasPermission, 
    getPermissionDetails,
    refetch: checkPermissions 
  };
}

/**
 * Field-level access with enhanced masking
 */
export function useEnhancedFieldAccess(
  fieldName: string,
  accessType: 'read' | 'write' = 'read',
  resource?: string
) {
  const { user } = useAuth();
  const [fieldAccess, setFieldAccess] = useState<{
    allowed: boolean;
    masked: boolean;
    maskingRule?: string;
    loading: boolean;
    confidence: number;
    reason: string;
  }>({
    allowed: false,
    masked: false,
    loading: true,
    confidence: 0,
    reason: ''
  });

  const checkFieldAccess = useCallback(async () => {
    if (!user) {
      setFieldAccess(prev => ({
        ...prev,
        loading: false,
        reason: 'User not authenticated'
      }));
      return;
    }

    setFieldAccess(prev => ({ ...prev, loading: true }));

    try {
      // Use enhanced permission check for field access
      const response = await fetch('/api/access-control-enhanced/evaluate-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          request: {
            resource: resource || 'field',
            action: `${accessType}_field`,
            context: {
              fieldName,
              accessType
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Field access evaluation failed: ${response.statusText}`);
      }

      const data: DetailedAccessResponse = await response.json();

      // Determine masking based on detailed response
      const fieldRestrictions = data.computedAttributes?.fieldRestrictions || {};
      const fieldRestriction = fieldRestrictions[fieldName];

      setFieldAccess({
        allowed: data.allowed,
        masked: fieldRestriction?.masked || false,
        maskingRule: fieldRestriction?.maskingRule,
        loading: false,
        confidence: data.confidence || 1.0,
        reason: data.reason
      });

    } catch (error) {
      setFieldAccess({
        allowed: false,
        masked: false,
        loading: false,
        confidence: 0,
        reason: `Field access check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }, [user, fieldName, accessType, resource]);

  useEffect(() => {
    checkFieldAccess();
  }, [checkFieldAccess]);

  const applyMasking = useCallback((value: any) => {
    if (!fieldAccess.masked || !fieldAccess.maskingRule) {
      return value;
    }

    const stringValue = String(value);
    
    switch (fieldAccess.maskingRule) {
      case 'partial':
        if (stringValue.length <= 4) return '*'.repeat(stringValue.length);
        return stringValue.slice(0, 2) + '*'.repeat(stringValue.length - 4) + stringValue.slice(-2);
      case 'full':
        return '*'.repeat(stringValue.length);
      case 'email':
        return stringValue.replace(/(.{2}).*(@.*)/, '$1***$2');
      case 'phone':
        return stringValue.replace(/(\d{3}).*(\d{3})/, '$1***$2');
      case 'hash':
        return `#${stringValue.length}${stringValue.charCodeAt(0)}`;
      default:
        return value;
    }
  }, [fieldAccess]);

  return { 
    ...fieldAccess, 
    applyMasking, 
    refetch: checkFieldAccess 
  };
}

/**
 * Hook for attribute benchmarking
 */
export function useAttributeBenchmark() {
  const [benchmarkResults, setBenchmarkResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const runBenchmark = useCallback(async (attributes: string[], iterations: number = 100) => {
    setLoading(true);

    try {
      const response = await fetch('/api/access-control-enhanced/benchmark-attributes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          attributes,
          iterations
        })
      });

      if (!response.ok) {
        throw new Error(`Benchmark failed: ${response.statusText}`);
      }

      const data = await response.json();
      setBenchmarkResults(data.benchmarkResults);

    } catch (error) {
      console.error('Attribute benchmark error:', error);
      setBenchmarkResults({});
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    benchmarkResults,
    loading,
    runBenchmark
  };
}

/**
 * Hook for resolution strategies
 */
export function useResolutionStrategies() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadStrategies = async () => {
      try {
        const response = await fetch('/api/access-control-enhanced/resolution-strategies', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStrategies(data.strategies);
        }
      } catch (error) {
        console.error('Failed to load resolution strategies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStrategies();
  }, []);

  return { strategies, loading };
}
