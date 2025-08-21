import { RequestHandler } from "express";
import { Permission, PermissionCategory, Resource, PermissionAnalytics, PermissionOptimization, PermissionCondition, FieldRestriction, ResourceEndpoint } from "@shared/iam";

// Mock permission database
let mockPermissions: Permission[] = [
  {
    id: "perm-1",
    name: "Create Users",
    resource: "user",
    action: "create",
    description: "Permission to create new user accounts",
    category: "User Management",
    scope: "resource",
    canDelegate: true,
    isSystemPermission: true,
    complianceRequired: true,
    risk: "medium",
    createdAt: "2024-01-01T00:00:00Z",
    usageCount: 45,
    lastUsed: "2024-01-10T00:00:00Z",
    apiEndpoints: ["/api/users"]
  },
  {
    id: "perm-2",
    name: "Read User Profiles",
    resource: "user",
    action: "read",
    description: "Permission to view user profile information",
    category: "User Management",
    scope: "resource",
    canDelegate: true,
    isSystemPermission: true,
    complianceRequired: false,
    risk: "low",
    createdAt: "2024-01-01T00:00:00Z",
    usageCount: 1234,
    lastUsed: "2024-01-10T14:30:00Z",
    apiEndpoints: ["/api/users/:id", "/api/users"]
  },
  {
    id: "perm-3",
    name: "Delete Users",
    resource: "user",
    action: "delete",
    description: "Permission to permanently delete user accounts",
    category: "User Management",
    scope: "resource",
    canDelegate: false,
    isSystemPermission: true,
    complianceRequired: true,
    risk: "critical",
    createdAt: "2024-01-01T00:00:00Z",
    usageCount: 8,
    lastUsed: "2024-01-08T00:00:00Z",
    apiEndpoints: ["/api/users/:id"]
  },
  {
    id: "perm-4",
    name: "Manage Roles",
    resource: "role",
    action: "manage",
    description: "Full role management including create, update, delete",
    category: "Role Management",
    scope: "resource",
    canDelegate: true,
    isSystemPermission: true,
    complianceRequired: true,
    risk: "high",
    createdAt: "2024-01-01T00:00:00Z",
    usageCount: 67,
    lastUsed: "2024-01-09T00:00:00Z",
    apiEndpoints: ["/api/roles", "/api/roles/:id"]
  },
  {
    id: "perm-5",
    name: "View Financial Data",
    resource: "finance",
    action: "read",
    description: "Permission to access financial reports and data",
    category: "Finance",
    scope: "field",
    canDelegate: false,
    isSystemPermission: false,
    complianceRequired: true,
    risk: "high",
    createdAt: "2024-01-01T00:00:00Z",
    usageCount: 234,
    lastUsed: "2024-01-10T00:00:00Z",
    fieldRestrictions: [
      {
        id: "field-1",
        field: "salary",
        access: "read",
        maskingRule: "partial"
      },
      {
        id: "field-2", 
        field: "ssn",
        access: "none",
        maskingRule: "full"
      }
    ]
  },
  {
    id: "perm-6",
    name: "System Administration",
    resource: "system",
    action: "admin",
    description: "Full system administrative access",
    category: "System",
    scope: "global",
    canDelegate: false,
    isSystemPermission: true,
    complianceRequired: true,
    risk: "critical",
    createdAt: "2024-01-01T00:00:00Z",
    usageCount: 23,
    lastUsed: "2024-01-10T00:00:00Z",
    apiEndpoints: ["/api/system/*"]
  },
  {
    id: "perm-7",
    name: "API Rate Limiting",
    resource: "api",
    action: "execute",
    description: "Permission to call rate-limited API endpoints",
    category: "API Access",
    scope: "api",
    canDelegate: true,
    isSystemPermission: false,
    complianceRequired: false,
    risk: "low",
    createdAt: "2024-01-01T00:00:00Z",
    usageCount: 5678,
    lastUsed: "2024-01-10T14:00:00Z",
    conditions: [
      {
        id: "cond-1",
        type: "time",
        operator: "greater_than",
        field: "hour",
        value: 9,
        description: "Only during business hours"
      }
    ]
  }
];

// Mock permission categories
const mockCategories: PermissionCategory[] = [
  {
    id: "cat-1",
    name: "User Management",
    description: "Permissions related to user account management",
    color: "#3B82F6",
    icon: "users",
    permissions: ["perm-1", "perm-2", "perm-3"],
    isSystemCategory: true
  },
  {
    id: "cat-2",
    name: "Role Management", 
    description: "Permissions for role and permission management",
    color: "#8B5CF6",
    icon: "shield",
    permissions: ["perm-4"],
    isSystemCategory: true
  },
  {
    id: "cat-3",
    name: "Finance",
    description: "Financial data and transaction permissions",
    color: "#10B981",
    icon: "dollar-sign",
    permissions: ["perm-5"],
    isSystemCategory: false
  },
  {
    id: "cat-4",
    name: "System",
    description: "System-level administrative permissions",
    color: "#EF4444",
    icon: "settings",
    permissions: ["perm-6"],
    isSystemCategory: true
  },
  {
    id: "cat-5",
    name: "API Access",
    description: "API endpoint access and rate limiting",
    color: "#F59E0B",
    icon: "code",
    permissions: ["perm-7"],
    isSystemCategory: false
  }
];

// Mock resources
const mockResources: Resource[] = [
  {
    id: "res-1",
    name: "user",
    type: "entity",
    description: "User account and profile data",
    attributes: {
      sensitive: true,
      piiContained: true
    },
    endpoints: [
      {
        id: "ep-1",
        path: "/api/users",
        method: "GET",
        description: "List all users",
        requiredPermissions: ["perm-2"],
        authRequired: true,
        rateLimit: 100
      },
      {
        id: "ep-2",
        path: "/api/users",
        method: "POST", 
        description: "Create new user",
        requiredPermissions: ["perm-1"],
        authRequired: true,
        rateLimit: 10
      },
      {
        id: "ep-3",
        path: "/api/users/:id",
        method: "DELETE",
        description: "Delete user account",
        requiredPermissions: ["perm-3"],
        authRequired: true,
        rateLimit: 5
      }
    ],
    fields: [
      {
        id: "field-1",
        name: "email",
        type: "string",
        sensitive: true,
        piiType: "email",
        defaultAccess: "read"
      },
      {
        id: "field-2",
        name: "password",
        type: "string",
        sensitive: true,
        defaultAccess: "none"
      },
      {
        id: "field-3",
        name: "firstName",
        type: "string",
        sensitive: false,
        defaultAccess: "read"
      }
    ],
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "res-2",
    name: "role",
    type: "entity",
    description: "Role definitions and assignments",
    attributes: {
      sensitive: false,
      piiContained: false
    },
    endpoints: [
      {
        id: "ep-4",
        path: "/api/roles",
        method: "GET",
        description: "List all roles",
        requiredPermissions: ["perm-4"],
        authRequired: true,
        rateLimit: 50
      }
    ],
    fields: [
      {
        id: "field-4",
        name: "name",
        type: "string", 
        sensitive: false,
        defaultAccess: "read"
      }
    ],
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "res-3",
    name: "finance",
    type: "data",
    description: "Financial records and sensitive data",
    attributes: {
      sensitive: true,
      piiContained: true,
      complianceRequired: true
    },
    fields: [
      {
        id: "field-5",
        name: "salary",
        type: "number",
        sensitive: true,
        piiType: "custom",
        defaultAccess: "none"
      },
      {
        id: "field-6",
        name: "ssn",
        type: "string",
        sensitive: true,
        piiType: "ssn",
        defaultAccess: "none"
      }
    ],
    createdAt: "2024-01-01T00:00:00Z"
  }
];

// Mock optimization suggestions
const mockOptimizations: PermissionOptimization[] = [
  {
    id: "opt-1",
    type: "cleanup",
    severity: "medium",
    permissions: ["perm-7"],
    description: "Permission 'API Rate Limiting' has very high usage but low risk - consider reviewing access patterns",
    recommendation: "Review if this permission can be made more granular or if usage patterns indicate potential abuse",
    estimatedImpact: "Improved security posture, reduced attack surface",
    autoApplicable: false
  },
  {
    id: "opt-2", 
    type: "risk_reduction",
    severity: "high",
    permissions: ["perm-3", "perm-6"],
    description: "Critical permissions are being used by multiple users - consider implementing approval workflows",
    recommendation: "Add mandatory approval workflow for critical permissions",
    estimatedImpact: "Reduced risk of unauthorized critical actions",
    autoApplicable: true
  },
  {
    id: "opt-3",
    type: "deprecation",
    severity: "low",
    permissions: ["perm-8"],
    description: "Permission has not been used in 90 days and may be obsolete",
    recommendation: "Archive or remove unused permission after stakeholder review",
    estimatedImpact: "Simplified permission management, reduced complexity",
    autoApplicable: false
  }
];

// GET /api/permissions - Get all permissions with filtering
export const handleGetPermissions: RequestHandler = (req, res) => {
  try {
    const { search, category, scope, risk, limit, offset } = req.query;
    
    let filteredPermissions = [...mockPermissions];

    // Apply search filter
    if (search && typeof search === 'string') {
      const searchTerm = search.toLowerCase();
      filteredPermissions = filteredPermissions.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm) ||
        permission.description.toLowerCase().includes(searchTerm) ||
        permission.resource.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (category && typeof category === 'string' && category !== 'all') {
      filteredPermissions = filteredPermissions.filter(permission => permission.category === category);
    }

    // Apply scope filter
    if (scope && typeof scope === 'string' && scope !== 'all') {
      filteredPermissions = filteredPermissions.filter(permission => permission.scope === scope);
    }

    // Apply risk filter
    if (risk && typeof risk === 'string' && risk !== 'all') {
      filteredPermissions = filteredPermissions.filter(permission => permission.risk === risk);
    }

    // Apply pagination
    const limitNum = limit ? parseInt(limit as string) : undefined;
    const offsetNum = offset ? parseInt(offset as string) : 0;
    
    if (limitNum) {
      filteredPermissions = filteredPermissions.slice(offsetNum, offsetNum + limitNum);
    }

    res.json({
      permissions: filteredPermissions,
      total: mockPermissions.length,
      filtered: filteredPermissions.length
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/permissions/:id - Get specific permission
export const handleGetPermission: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const permission = mockPermissions.find(p => p.id === id);
    
    if (!permission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    res.json(permission);
  } catch (error) {
    console.error("Error fetching permission:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/permissions - Create new permission
export const handleCreatePermission: RequestHandler = (req, res) => {
  try {
    const permissionData = req.body;

    // Validate required fields
    if (!permissionData.name || !permissionData.resource || !permissionData.action) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if permission already exists
    const existingPermission = mockPermissions.find(p => 
      p.name.toLowerCase() === permissionData.name.toLowerCase() &&
      p.resource === permissionData.resource &&
      p.action === permissionData.action
    );
    
    if (existingPermission) {
      return res.status(409).json({ error: "Permission already exists" });
    }

    // Create new permission
    const newPermission: Permission = {
      id: `perm-${mockPermissions.length + 1}`,
      name: permissionData.name,
      resource: permissionData.resource,
      action: permissionData.action,
      description: permissionData.description,
      category: permissionData.category || 'Custom',
      scope: permissionData.scope || 'resource',
      canDelegate: permissionData.canDelegate || false,
      isSystemPermission: false,
      complianceRequired: permissionData.complianceRequired || false,
      risk: permissionData.risk || 'low',
      createdAt: new Date().toISOString(),
      usageCount: 0,
      conditions: permissionData.conditions || [],
      fieldRestrictions: permissionData.fieldRestrictions || [],
      apiEndpoints: permissionData.apiEndpoints || []
    };

    mockPermissions.push(newPermission);
    res.status(201).json(newPermission);
  } catch (error) {
    console.error("Error creating permission:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/permissions/:id - Update permission
export const handleUpdatePermission: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const permissionIndex = mockPermissions.findIndex(p => p.id === id);
    if (permissionIndex === -1) {
      return res.status(404).json({ error: "Permission not found" });
    }

    // Prevent updating system permissions in certain ways
    if (mockPermissions[permissionIndex].isSystemPermission && updateData.isSystemPermission === false) {
      return res.status(403).json({ error: "Cannot modify system permission status" });
    }

    // Update permission data
    mockPermissions[permissionIndex] = {
      ...mockPermissions[permissionIndex],
      ...updateData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    res.json(mockPermissions[permissionIndex]);
  } catch (error) {
    console.error("Error updating permission:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/permissions/:id - Delete permission
export const handleDeletePermission: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const permissionIndex = mockPermissions.findIndex(p => p.id === id);
    if (permissionIndex === -1) {
      return res.status(404).json({ error: "Permission not found" });
    }

    // Prevent deletion of system permissions
    if (mockPermissions[permissionIndex].isSystemPermission) {
      return res.status(403).json({ error: "Cannot delete system permissions" });
    }

    mockPermissions.splice(permissionIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting permission:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/permissions/categories - Get permission categories
export const handleGetPermissionCategories: RequestHandler = (req, res) => {
  try {
    res.json(mockCategories);
  } catch (error) {
    console.error("Error fetching permission categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/permissions/optimizations - Get optimization suggestions
export const handleGetOptimizations: RequestHandler = (req, res) => {
  try {
    res.json(mockOptimizations);
  } catch (error) {
    console.error("Error fetching optimizations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/permissions/:id/analytics - Get permission analytics
export const handleGetPermissionAnalytics: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const permission = mockPermissions.find(p => p.id === id);
    
    if (!permission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    // Generate mock analytics
    const analytics: PermissionAnalytics = {
      permissionId: id,
      usageStats: {
        totalUses: permission.usageCount || 0,
        uniqueUsers: Math.floor((permission.usageCount || 0) * 0.3),
        lastUsed: permission.lastUsed || new Date().toISOString(),
        averageDaily: Math.floor((permission.usageCount || 0) / 30),
        peakUsage: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      riskMetrics: {
        riskScore: permission.risk === 'critical' ? 95 : 
                  permission.risk === 'high' ? 75 :
                  permission.risk === 'medium' ? 50 : 25,
        sensitiveDataAccess: permission.scope === 'field' || permission.complianceRequired,
        privilegeEscalation: permission.risk === 'critical' || permission.risk === 'high',
        unusualAccess: Math.random() > 0.8
      },
      complianceStatus: {
        isCompliant: permission.complianceRequired ? Math.random() > 0.2 : true,
        violations: permission.complianceRequired && Math.random() < 0.2 ? 
          ["Missing audit trail", "Insufficient approval workflow"] : [],
        auditReady: permission.complianceRequired
      },
      recommendations: [
        "Review usage patterns for anomalies",
        "Consider implementing time-based restrictions", 
        "Evaluate risk level based on current usage"
      ]
    };

    res.json(analytics);
  } catch (error) {
    console.error("Error fetching permission analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/resources - Get protected resources
export const handleGetResources: RequestHandler = (req, res) => {
  try {
    res.json(mockResources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/permissions/optimize - Apply optimization
export const handleApplyOptimization: RequestHandler = (req, res) => {
  try {
    const { optimizationId, action } = req.body;
    
    const optimization = mockOptimizations.find(o => o.id === optimizationId);
    if (!optimization) {
      return res.status(404).json({ error: "Optimization not found" });
    }

    // Simulate applying optimization
    switch (optimization.type) {
      case 'cleanup':
        // Remove or modify permissions
        break;
      case 'risk_reduction': 
        // Add approval workflows
        break;
      case 'deprecation':
        // Mark permissions as deprecated
        break;
    }

    res.json({ message: "Optimization applied successfully" });
  } catch (error) {
    console.error("Error applying optimization:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/permissions/:id/delegate - Delegate permission
export const handleDelegatePermission: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { delegateTo, expiresAt, conditions, reason } = req.body;

    const permission = mockPermissions.find(p => p.id === id);
    if (!permission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    if (!permission.canDelegate) {
      return res.status(403).json({ error: "Permission cannot be delegated" });
    }

    // Create delegation record (in real implementation, this would be stored)
    const delegation = {
      id: `del-${Date.now()}`,
      permissionId: id,
      delegatedTo,
      expiresAt,
      conditions,
      reason,
      delegatedAt: new Date().toISOString(),
      status: 'active'
    };

    res.json(delegation);
  } catch (error) {
    console.error("Error delegating permission:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
