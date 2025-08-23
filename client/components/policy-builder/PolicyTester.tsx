/**
 * Policy Testing Component
 * Allows testing of policies built with the visual policy builder
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import {
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Database,
  Settings,
  Clock,
  RotateCcw
} from 'lucide-react';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  subject: {
    userId: string;
    role: string;
    department: string;
    clearanceLevel: string;
    attributes: Record<string, any>;
  };
  resource: {
    type: string;
    classification: string;
    location: string;
    attributes: Record<string, any>;
  };
  action: string[];
  environment: {
    time: string;
    location: string;
    deviceType: string;
    network: string;
    attributes: Record<string, any>;
  };
  expectedResult: 'allow' | 'deny';
}

interface TestResult {
  scenario: TestScenario;
  result: 'allow' | 'deny';
  reason: string;
  appliedRules: string[];
  executionTime: number;
  passed: boolean;
}

const PREDEFINED_SCENARIOS: TestScenario[] = [
  {
    id: 'scenario-1',
    name: 'Admin Access to Financial Data',
    description: 'Administrator accessing sensitive financial data during business hours',
    subject: {
      userId: 'admin001',
      role: 'administrator',
      department: 'IT',
      clearanceLevel: 'high',
      attributes: { yearsOfService: 5, location: 'headquarters' }
    },
    resource: {
      type: 'financial_data',
      classification: 'confidential',
      location: 'secure_server',
      attributes: { sensitivity: 'high', encryption: 'enabled' }
    },
    action: ['read', 'write'],
    environment: {
      time: '10:00',
      location: '192.168.1.100',
      deviceType: 'corporate_laptop',
      network: 'internal',
      attributes: { vpn: false, mfa: true }
    },
    expectedResult: 'allow'
  },
  {
    id: 'scenario-2',
    name: 'Regular User Access to HR Data',
    description: 'Regular user trying to access HR data from external network',
    subject: {
      userId: 'user001',
      role: 'user',
      department: 'Marketing',
      clearanceLevel: 'low',
      attributes: { yearsOfService: 2, location: 'remote' }
    },
    resource: {
      type: 'hr_data',
      classification: 'confidential',
      location: 'hr_server',
      attributes: { sensitivity: 'high', encryption: 'enabled' }
    },
    action: ['read'],
    environment: {
      time: '14:00',
      location: '203.0.113.50',
      deviceType: 'personal_laptop',
      network: 'external',
      attributes: { vpn: true, mfa: false }
    },
    expectedResult: 'deny'
  },
  {
    id: 'scenario-3',
    name: 'After Hours System Access',
    description: 'Manager accessing system resources after business hours',
    subject: {
      userId: 'manager001',
      role: 'manager',
      department: 'Operations',
      clearanceLevel: 'medium',
      attributes: { yearsOfService: 8, location: 'branch_office' }
    },
    resource: {
      type: 'system_config',
      classification: 'internal',
      location: 'config_server',
      attributes: { sensitivity: 'medium', encryption: 'enabled' }
    },
    action: ['read', 'update'],
    environment: {
      time: '22:00',
      location: '192.168.2.50',
      deviceType: 'corporate_laptop',
      network: 'internal',
      attributes: { vpn: false, mfa: true }
    },
    expectedResult: 'deny'
  }
];

export const PolicyTester: React.FC<{
  policy?: any;
  onTestComplete?: (results: TestResult[]) => void;
}> = ({ policy, onTestComplete }) => {
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null);
  const [customScenario, setCustomScenario] = useState<Partial<TestScenario>>({
    subject: { userId: '', role: '', department: '', clearanceLevel: '', attributes: {} },
    resource: { type: '', classification: '', location: '', attributes: {} },
    action: [],
    environment: { time: '', location: '', deviceType: '', network: '', attributes: {} }
  });
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'predefined' | 'custom'>('predefined');

  // Mock policy evaluation function
  const evaluatePolicy = async (scenario: TestScenario): Promise<TestResult> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));

    // Simple mock evaluation logic
    let result: 'allow' | 'deny' = 'allow';
    let reason = 'Access granted by default policy';
    const appliedRules: string[] = [];

    // Business hours check
    const hour = parseInt(scenario.environment.time.split(':')[0]);
    if (hour < 9 || hour > 17) {
      if (scenario.subject.role !== 'administrator') {
        result = 'deny';
        reason = 'Access denied: outside business hours';
        appliedRules.push('business-hours-rule');
      }
    }

    // Clearance level check
    if (scenario.resource.classification === 'confidential' && scenario.subject.clearanceLevel === 'low') {
      result = 'deny';
      reason = 'Access denied: insufficient clearance level';
      appliedRules.push('clearance-level-rule');
    }

    // Network security check
    if (scenario.environment.network === 'external' && !scenario.environment.attributes.vpn) {
      result = 'deny';
      reason = 'Access denied: external access without VPN';
      appliedRules.push('network-security-rule');
    }

    // MFA requirement for sensitive data
    if (scenario.resource.attributes.sensitivity === 'high' && !scenario.environment.attributes.mfa) {
      result = 'deny';
      reason = 'Access denied: MFA required for sensitive data';
      appliedRules.push('mfa-requirement-rule');
    }

    const executionTime = Math.random() * 50 + 10; // 10-60ms
    const passed = result === scenario.expectedResult;

    return {
      scenario,
      result,
      reason,
      appliedRules,
      executionTime,
      passed
    };
  };

  const runSingleTest = async (scenario: TestScenario) => {
    setIsRunning(true);
    try {
      const result = await evaluatePolicy(scenario);
      setTestResults(prev => [...prev, result]);
      return result;
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      const results: TestResult[] = [];
      for (const scenario of PREDEFINED_SCENARIOS) {
        const result = await evaluatePolicy(scenario);
        results.push(result);
        setTestResults(prev => [...prev, result]);
      }
      
      if (onTestComplete) {
        onTestComplete(results);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getResultIcon = (result: TestResult) => {
    if (result.passed) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getResultColor = (result: TestResult) => {
    if (result.passed) {
      return 'border-green-200 bg-green-50';
    } else {
      return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Policy Testing</h3>
          <p className="text-muted-foreground">
            Test your policy with predefined or custom scenarios
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={clearResults} variant="outline" disabled={testResults.length === 0}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear Results
          </Button>
          <Button onClick={runAllTests} disabled={isRunning}>
            <Play className="h-4 w-4 mr-2" />
            Run All Tests
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Scenarios */}
        <div className="space-y-4">
          {/* Tab Selector */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('predefined')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'predefined'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Predefined Scenarios
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'custom'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Custom Scenario
            </button>
          </div>

          {activeTab === 'predefined' ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Scenarios</CardTitle>
                <CardDescription>
                  Select a predefined scenario to test your policy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {PREDEFINED_SCENARIOS.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedScenario?.id === scenario.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedScenario(scenario)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{scenario.name}</h4>
                      <Badge variant={scenario.expectedResult === 'allow' ? 'default' : 'destructive'}>
                        {scenario.expectedResult.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        {scenario.subject.role}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Database className="h-3 w-3 mr-1" />
                        {scenario.resource.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {scenario.environment.time}
                      </Badge>
                    </div>
                  </div>
                ))}

                {selectedScenario && (
                  <div className="pt-4">
                    <Button
                      onClick={() => runSingleTest(selectedScenario)}
                      disabled={isRunning}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Test Selected Scenario
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Scenario</CardTitle>
                <CardDescription>
                  Create a custom test scenario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>User ID</Label>
                    <Input
                      value={customScenario.subject?.userId || ''}
                      onChange={(e) => setCustomScenario(prev => ({
                        ...prev,
                        subject: { ...prev.subject!, userId: e.target.value }
                      }))}
                      placeholder="e.g., user123"
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select
                      value={customScenario.subject?.role || ''}
                      onValueChange={(value) => setCustomScenario(prev => ({
                        ...prev,
                        subject: { ...prev.subject!, role: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administrator">Administrator</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Resource Type</Label>
                    <Input
                      value={customScenario.resource?.type || ''}
                      onChange={(e) => setCustomScenario(prev => ({
                        ...prev,
                        resource: { ...prev.resource!, type: e.target.value }
                      }))}
                      placeholder="e.g., financial_data"
                    />
                  </div>
                  <div>
                    <Label>Classification</Label>
                    <Select
                      value={customScenario.resource?.classification || ''}
                      onValueChange={(value) => setCustomScenario(prev => ({
                        ...prev,
                        resource: { ...prev.resource!, classification: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="confidential">Confidential</SelectItem>
                        <SelectItem value="restricted">Restricted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Actions (comma-separated)</Label>
                  <Input
                    placeholder="e.g., read, write, delete"
                    onChange={(e) => setCustomScenario(prev => ({
                      ...prev,
                      action: e.target.value.split(',').map(a => a.trim()).filter(Boolean)
                    }))}
                  />
                </div>

                <div>
                  <Label>Expected Result</Label>
                  <Select
                    value={customScenario.expectedResult || 'allow'}
                    onValueChange={(value: 'allow' | 'deny') => setCustomScenario(prev => ({
                      ...prev,
                      expectedResult: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">Allow</SelectItem>
                      <SelectItem value="deny">Deny</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => {
                    if (customScenario.subject?.userId && customScenario.resource?.type) {
                      const scenario: TestScenario = {
                        id: `custom-${Date.now()}`,
                        name: 'Custom Scenario',
                        description: 'Custom test scenario',
                        subject: customScenario.subject!,
                        resource: customScenario.resource!,
                        action: customScenario.action || [],
                        environment: customScenario.environment!,
                        expectedResult: customScenario.expectedResult || 'allow'
                      };
                      runSingleTest(scenario);
                    }
                  }}
                  disabled={isRunning || !customScenario.subject?.userId || !customScenario.resource?.type}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Test Custom Scenario
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Results</CardTitle>
            <CardDescription>
              Results of policy evaluation tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No test results yet</p>
                <p className="text-sm">Run a test to see results here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${getResultColor(result)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getResultIcon(result)}
                        <h4 className="font-medium">{result.scenario.name}</h4>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={result.result === 'allow' ? 'default' : 'destructive'}>
                          {result.result.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {result.executionTime.toFixed(1)}ms
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {result.reason}
                    </p>

                    {result.appliedRules.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium">Applied Rules: </span>
                        {result.appliedRules.join(', ')}
                      </div>
                    )}

                    {!result.passed && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Expected {result.scenario.expectedResult}, but got {result.result}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}

                {/* Summary */}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Total Tests: {testResults.length}</span>
                  <span className="text-green-600">
                    Passed: {testResults.filter(r => r.passed).length}
                  </span>
                  <span className="text-red-600">
                    Failed: {testResults.filter(r => !r.passed).length}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PolicyTester;
