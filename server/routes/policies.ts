import { RequestHandler } from "express";
import { ABACPolicy, PolicyRule, AttributeCondition } from "@shared/iam";

// Mock policy database
let mockPolicies: ABACPolicy[] = [
  {
    id: 'pol-1',
    name: 'Executive Financial Access',
    description: 'Allow executives to access financial data during business hours',
    rules: [
      {
        subject: [
          { attribute: 'role', operator: 'equals', value: 'executive' },
          { attribute: 'department', operator: 'in', value: ['finance', 'executive'] }
        ],
        resource: [
          { attribute: 'type', operator: 'equals', value: 'financial_data' },
          { attribute: 'classification', operator: 'not_equals', value: 'top_secret' }
        ],
        action: ['read', 'analyze'],
        environment: [
          { attribute: 'time', operator: 'greater_than', value: '09:00' },
          { attribute: 'time', operator: 'less_than', value: '17:00' },
          { attribute: 'location', operator: 'equals', value: 'office' }
        ]
      }
    ],
    effect: 'allow',
    priority: 100,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pol-2',
    name: 'Emergency System Access',
    description: 'Allow system administrators emergency access to all systems',
    rules: [
      {
        subject: [
          { attribute: 'role', operator: 'equals', value: 'sysadmin' },
          { attribute: 'emergency_clearance', operator: 'equals', value: true }
        ],
        resource: [
          { attribute: 'type', operator: 'equals', value: 'system' }
        ],
        action: ['read', 'write', 'execute', 'admin'],
        environment: [
          { attribute: 'emergency_mode', operator: 'equals', value: true }
        ]
      }
    ],
    effect: 'allow',
    priority: 200,
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 'pol-3',
    name: 'Contractor Data Restriction',
    description: 'Prevent contractors from accessing sensitive customer data',
    rules: [
      {
        subject: [
          { attribute: 'employment_type', operator: 'equals', value: 'contractor' }
        ],
        resource: [
          { attribute: 'data_classification', operator: 'in', value: ['sensitive', 'confidential'] },
          { attribute: 'contains_pii', operator: 'equals', value: true }
        ],
        action: ['read', 'write', 'download']
      }
    ],
    effect: 'deny',
    priority: 150,
    status: 'active',
    createdAt: '2024-01-03T00:00:00Z'
  },
  {
    id: 'pol-4',
    name: 'Development Environment Access',
    description: 'Allow developers access to development resources',
    rules: [
      {
        subject: [
          { attribute: 'department', operator: 'equals', value: 'engineering' },
          { attribute: 'project_member', operator: 'equals', value: true }
        ],
        resource: [
          { attribute: 'environment', operator: 'equals', value: 'development' },
          { attribute: 'project_id', operator: 'equals', value: '${subject.current_project}' }
        ],
        action: ['read', 'write', 'deploy'],
        environment: [
          { attribute: 'network', operator: 'equals', value: 'internal' }
        ]
      }
    ],
    effect: 'allow',
    priority: 50,
    status: 'inactive',
    createdAt: '2024-01-04T00:00:00Z'
  },
  {
    id: 'pol-5',
    name: 'Weekend Administrative Lock',
    description: 'Restrict administrative actions during weekends',
    rules: [
      {
        subject: [
          { attribute: 'role', operator: 'in', value: ['admin', 'moderator'] }
        ],
        resource: [
          { attribute: 'requires_admin', operator: 'equals', value: true }
        ],
        action: ['delete', 'modify_permissions', 'system_config'],
        environment: [
          { attribute: 'day_of_week', operator: 'in', value: ['saturday', 'sunday'] }
        ]
      }
    ],
    effect: 'deny',
    priority: 120,
    status: 'active',
    createdAt: '2024-01-05T00:00:00Z'
  }
];

// Mock policy versions for version control
let mockPolicyVersions: Record<string, ABACPolicy[]> = {
  'pol-1': [
    { ...mockPolicies[0], version: '1.0', createdAt: '2024-01-01T00:00:00Z' },
    { ...mockPolicies[0], version: '1.1', createdAt: '2024-01-10T00:00:00Z', priority: 110 }
  ]
};

// GET /api/policies - Get all policies with filtering
export const handleGetPolicies: RequestHandler = (req, res) => {
  try {
    const { search, status, effect, priority, limit, offset } = req.query;
    
    let filteredPolicies = [...mockPolicies];

    // Apply search filter
    if (search && typeof search === 'string') {
      const searchTerm = search.toLowerCase();
      filteredPolicies = filteredPolicies.filter(policy =>
        policy.name.toLowerCase().includes(searchTerm) ||
        policy.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (status && typeof status === 'string' && status !== 'all') {
      filteredPolicies = filteredPolicies.filter(policy => policy.status === status);
    }

    // Apply effect filter
    if (effect && typeof effect === 'string' && effect !== 'all') {
      filteredPolicies = filteredPolicies.filter(policy => policy.effect === effect);
    }

    // Apply priority filter
    if (priority && typeof priority === 'string' && priority !== 'all') {
      const priorityLevel = priority;
      filteredPolicies = filteredPolicies.filter(policy => {
        if (priorityLevel === 'high') return policy.priority >= 150;
        if (priorityLevel === 'medium') return policy.priority >= 100 && policy.priority < 150;
        if (priorityLevel === 'low') return policy.priority < 100;
        return true;
      });
    }

    // Apply pagination
    const limitNum = limit ? parseInt(limit as string) : undefined;
    const offsetNum = offset ? parseInt(offset as string) : 0;
    
    if (limitNum) {
      filteredPolicies = filteredPolicies.slice(offsetNum, offsetNum + limitNum);
    }

    res.json({
      policies: filteredPolicies,
      total: mockPolicies.length,
      filtered: filteredPolicies.length
    });
  } catch (error) {
    console.error("Error fetching policies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/policies/:id - Get specific policy
export const handleGetPolicy: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const policy = mockPolicies.find(p => p.id === id);
    
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    res.json(policy);
  } catch (error) {
    console.error("Error fetching policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/policies - Create new policy
export const handleCreatePolicy: RequestHandler = (req, res) => {
  try {
    const policyData = req.body;

    // Validate required fields
    if (!policyData.name || !policyData.description || !policyData.effect) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if policy name already exists
    const existingPolicy = mockPolicies.find(p => 
      p.name.toLowerCase() === policyData.name.toLowerCase()
    );
    
    if (existingPolicy) {
      return res.status(409).json({ error: "Policy name already exists" });
    }

    // Validate priority range
    if (policyData.priority && (policyData.priority < 1 || policyData.priority > 1000)) {
      return res.status(400).json({ error: "Priority must be between 1 and 1000" });
    }

    // Create new policy
    const newPolicy: ABACPolicy = {
      id: `pol-${mockPolicies.length + 1}`,
      name: policyData.name,
      description: policyData.description,
      rules: policyData.rules || [],
      effect: policyData.effect,
      priority: policyData.priority || 100,
      status: policyData.status || 'draft',
      createdAt: new Date().toISOString()
    };

    mockPolicies.push(newPolicy);

    // Initialize version control
    mockPolicyVersions[newPolicy.id] = [{ ...newPolicy, version: '1.0' }];

    res.status(201).json(newPolicy);
  } catch (error) {
    console.error("Error creating policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/policies/:id - Update policy
export const handleUpdatePolicy: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const policyIndex = mockPolicies.findIndex(p => p.id === id);
    if (policyIndex === -1) {
      return res.status(404).json({ error: "Policy not found" });
    }

    const currentPolicy = mockPolicies[policyIndex];

    // Create new version if policy is being significantly modified
    const isSignificantChange = updateData.rules || updateData.effect || updateData.priority;
    if (isSignificantChange) {
      const currentVersions = mockPolicyVersions[id] || [];
      const newVersionNumber = (currentVersions.length + 1).toFixed(1);
      currentVersions.push({ ...currentPolicy, version: newVersionNumber });
      mockPolicyVersions[id] = currentVersions;
    }

    // Update policy data
    mockPolicies[policyIndex] = {
      ...currentPolicy,
      ...updateData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    res.json(mockPolicies[policyIndex]);
  } catch (error) {
    console.error("Error updating policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/policies/:id - Delete policy
export const handleDeletePolicy: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const policyIndex = mockPolicies.findIndex(p => p.id === id);
    if (policyIndex === -1) {
      return res.status(404).json({ error: "Policy not found" });
    }

    // Archive rather than delete for audit purposes
    mockPolicies[policyIndex].status = 'archived';
    mockPolicies[policyIndex].updatedAt = new Date().toISOString();

    res.json({ message: "Policy archived successfully" });
  } catch (error) {
    console.error("Error deleting policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/policies/test - Test policy evaluation
export const handleTestPolicy: RequestHandler = (req, res) => {
  try {
    const { subject, resource, action, environment, policyId } = req.body;

    if (!subject || !resource || !action) {
      return res.status(400).json({ error: "Missing required test parameters" });
    }

    // Mock policy evaluation engine
    const evaluatePolicy = (policy: ABACPolicy, testContext: any) => {
      let matches = true;
      const evaluationDetails = [];

      for (const rule of policy.rules) {
        // Evaluate subject conditions
        for (const condition of rule.subject) {
          const subjectValue = testContext.subjectAttributes[condition.attribute];
          const conditionMet = evaluateCondition(condition, subjectValue);
          evaluationDetails.push({
            type: 'subject',
            attribute: condition.attribute,
            operator: condition.operator,
            expected: condition.value,
            actual: subjectValue,
            result: conditionMet
          });
          if (!conditionMet) matches = false;
        }

        // Evaluate resource conditions
        for (const condition of rule.resource) {
          const resourceValue = testContext.resourceAttributes[condition.attribute];
          const conditionMet = evaluateCondition(condition, resourceValue);
          evaluationDetails.push({
            type: 'resource',
            attribute: condition.attribute,
            operator: condition.operator,
            expected: condition.value,
            actual: resourceValue,
            result: conditionMet
          });
          if (!conditionMet) matches = false;
        }

        // Evaluate action
        if (!rule.action.includes(testContext.action)) {
          matches = false;
          evaluationDetails.push({
            type: 'action',
            expected: rule.action,
            actual: testContext.action,
            result: false
          });
        }

        // Evaluate environment conditions
        if (rule.environment) {
          for (const condition of rule.environment) {
            const envValue = testContext.environmentAttributes[condition.attribute];
            const conditionMet = evaluateCondition(condition, envValue);
            evaluationDetails.push({
              type: 'environment',
              attribute: condition.attribute,
              operator: condition.operator,
              expected: condition.value,
              actual: envValue,
              result: conditionMet
            });
            if (!conditionMet) matches = false;
          }
        }
      }

      return { matches, evaluationDetails };
    };

    const evaluateCondition = (condition: AttributeCondition, actualValue: any) => {
      switch (condition.operator) {
        case 'equals':
          return actualValue === condition.value;
        case 'not_equals':
          return actualValue !== condition.value;
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(actualValue);
        case 'not_in':
          return Array.isArray(condition.value) && !condition.value.includes(actualValue);
        case 'greater_than':
          return actualValue > condition.value;
        case 'less_than':
          return actualValue < condition.value;
        case 'contains':
          return typeof actualValue === 'string' && actualValue.includes(condition.value);
        default:
          return false;
      }
    };

    // Mock test context - in real implementation, this would fetch actual attributes
    const testContext = {
      subjectAttributes: {
        role: subject.includes('executive') ? 'executive' : 'user',
        department: 'finance',
        employment_type: 'employee',
        emergency_clearance: false
      },
      resourceAttributes: {
        type: resource,
        classification: 'confidential',
        environment: 'production',
        contains_pii: true,
        data_classification: 'sensitive'
      },
      environmentAttributes: {
        time: new Date().toLocaleTimeString('en-US', { hour12: false }).substring(0, 5),
        location: 'office',
        network: 'internal',
        day_of_week: new Date().toLocaleDateString('en-US', { weekday: 'lowercase' }),
        emergency_mode: false,
        ...environment
      },
      action
    };

    // Find applicable policies
    const applicablePolicies = policyId ? 
      mockPolicies.filter(p => p.id === policyId) :
      mockPolicies.filter(p => p.status === 'active');

    // Sort by priority (higher priority first)
    applicablePolicies.sort((a, b) => b.priority - a.priority);

    let finalDecision = 'deny'; // Default deny
    const appliedPolicies = [];
    const evaluationResults = [];

    // Evaluate policies in priority order
    for (const policy of applicablePolicies) {
      const evaluation = evaluatePolicy(policy, testContext);
      evaluationResults.push({
        policyId: policy.id,
        policyName: policy.name,
        effect: policy.effect,
        priority: policy.priority,
        matches: evaluation.matches,
        details: evaluation.evaluationDetails
      });

      if (evaluation.matches) {
        appliedPolicies.push(policy.id);
        finalDecision = policy.effect;
        
        // If it's a deny policy and it matches, immediately deny
        if (policy.effect === 'deny') {
          break;
        }
      }
    }

    const result = {
      decision: finalDecision,
      appliedPolicies,
      evaluationTime: `${(Math.random() * 10).toFixed(1)}ms`,
      explanation: finalDecision === 'allow' 
        ? `Access granted based on matching allow policies`
        : `Access denied ${appliedPolicies.length > 0 ? 'due to deny policy' : 'due to no matching allow policies'}`,
      details: {
        subjectAttributes: testContext.subjectAttributes,
        resourceAttributes: testContext.resourceAttributes,
        environmentAttributes: testContext.environmentAttributes,
        action: testContext.action
      },
      evaluationResults
    };

    res.json(result);
  } catch (error) {
    console.error("Error testing policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/policies/:id/versions - Get policy versions
export const handleGetPolicyVersions: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const versions = mockPolicyVersions[id] || [];
    
    res.json(versions);
  } catch (error) {
    console.error("Error fetching policy versions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/policies/:id/rollback - Rollback to previous version
export const handleRollbackPolicy: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { version } = req.body;

    const policyIndex = mockPolicies.findIndex(p => p.id === id);
    if (policyIndex === -1) {
      return res.status(404).json({ error: "Policy not found" });
    }

    const versions = mockPolicyVersions[id] || [];
    const targetVersion = versions.find(v => v.version === version);
    
    if (!targetVersion) {
      return res.status(404).json({ error: "Policy version not found" });
    }

    // Create new version for current state before rollback
    const currentPolicy = mockPolicies[policyIndex];
    versions.push({ ...currentPolicy, version: `${versions.length + 1}.0` });

    // Rollback to target version
    mockPolicies[policyIndex] = {
      ...targetVersion,
      version: undefined, // Remove version from current policy
      updatedAt: new Date().toISOString()
    };

    res.json(mockPolicies[policyIndex]);
  } catch (error) {
    console.error("Error rolling back policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/policies/conflicts - Detect policy conflicts
export const handleGetPolicyConflicts: RequestHandler = (req, res) => {
  try {
    // Mock conflict detection - in real implementation, this would analyze policy rules
    const conflicts = [
      {
        id: 'conflict-1',
        type: 'Effect Conflict',
        severity: 'high',
        policies: ['pol-1', 'pol-3'],
        description: 'Executive Financial Access allows access while Contractor Data Restriction denies it for contractor executives',
        resolution: 'Add more specific subject conditions or adjust priority order',
        detected: new Date().toISOString()
      },
      {
        id: 'conflict-2',
        type: 'Priority Overlap',
        severity: 'medium',
        policies: ['pol-2', 'pol-3'],
        description: 'Emergency System Access and Contractor Data Restriction have overlapping priority ranges',
        resolution: 'Adjust priority values to create clear hierarchy',
        detected: new Date().toISOString()
      }
    ];

    res.json(conflicts);
  } catch (error) {
    console.error("Error detecting policy conflicts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/policies/analytics - Get policy analytics
export const handleGetPolicyAnalytics: RequestHandler = (req, res) => {
  try {
    // Mock analytics data
    const analytics = {
      totalPolicies: mockPolicies.length,
      activePolicies: mockPolicies.filter(p => p.status === 'active').length,
      allowPolicies: mockPolicies.filter(p => p.effect === 'allow').length,
      denyPolicies: mockPolicies.filter(p => p.effect === 'deny').length,
      averageEvaluationTime: 2.3,
      totalEvaluations: 15420,
      evaluationsToday: 342,
      conflictCount: 2,
      performanceMetrics: mockPolicies.map(policy => ({
        policyId: policy.id,
        policyName: policy.name,
        evaluations: Math.floor(Math.random() * 1000),
        averageTime: Math.round(Math.random() * 10 * 10) / 10,
        successRate: Math.round((Math.random() * 20 + 80) * 10) / 10
      }))
    };

    res.json(analytics);
  } catch (error) {
    console.error("Error fetching policy analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/policies/:id/activate - Activate policy
export const handleActivatePolicy: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const policyIndex = mockPolicies.findIndex(p => p.id === id);
    if (policyIndex === -1) {
      return res.status(404).json({ error: "Policy not found" });
    }

    mockPolicies[policyIndex].status = 'active';
    mockPolicies[policyIndex].updatedAt = new Date().toISOString();

    res.json(mockPolicies[policyIndex]);
  } catch (error) {
    console.error("Error activating policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/policies/:id/deactivate - Deactivate policy
export const handleDeactivatePolicy: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const policyIndex = mockPolicies.findIndex(p => p.id === id);
    if (policyIndex === -1) {
      return res.status(404).json({ error: "Policy not found" });
    }

    mockPolicies[policyIndex].status = 'inactive';
    mockPolicies[policyIndex].updatedAt = new Date().toISOString();

    res.json(mockPolicies[policyIndex]);
  } catch (error) {
    console.error("Error deactivating policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/policies/evaluate - Real-time policy evaluation
export const handleEvaluatePolicy: RequestHandler = (req, res) => {
  try {
    const { subject, resource, action, environment } = req.body;

    // This would be the main policy evaluation endpoint used by applications
    // Similar to handleTestPolicy but optimized for production use
    
    const startTime = Date.now();
    
    // Mock evaluation result
    const result = {
      decision: 'allow',
      evaluationTime: `${Date.now() - startTime}ms`,
      appliedPolicies: ['pol-1'],
      reason: 'Executive role with business hours access granted'
    };

    res.json(result);
  } catch (error) {
    console.error("Error evaluating policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
