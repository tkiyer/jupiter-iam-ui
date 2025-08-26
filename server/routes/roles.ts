import { RequestHandler } from "express";
import { Role, CreateRoleRequest, RoleTemplate, RoleConflict, RoleAnalytics, Permission } from "@shared/iam";

// Mock role database
let mockRoles: Role[] = [
  {
    id: "1",
    name: "Super Administrator",
    description: "Full system access with all administrative privileges",
    permissions: ["user.create", "user.read", "user.update", "user.delete", "role.create", "role.read", "role.update", "role.delete", "system.admin"],
    isSystemRole: true,
    createdAt: "2024-01-01T00:00:00Z",
    level: 5,
    status: "active",
    isTemplate: false,
    userCount: 2
  },
  {
    id: "2",
    name: "Administrator",
    description: "Administrative access to user and role management",
    permissions: ["user.create", "user.read", "user.update", "role.read", "role.update"],
    isSystemRole: true,
    createdAt: "2024-01-01T00:00:00Z",
    level: 4,
    status: "active",
    isTemplate: false,
    parentRole: "1",
    inheritedPermissions: ["system.admin"],
    userCount: 5,
    organizationUnit: "IT"
  },
  {
    id: "3",
    name: "Manager",
    description: "Departmental management with limited administrative access",
    permissions: ["user.read", "user.update", "team.manage"],
    isSystemRole: false,
    createdAt: "2024-01-01T00:00:00Z",
    level: 3,
    status: "active",
    isTemplate: false,
    userCount: 12,
    organizationUnit: "Operations",
    lastUsed: "2024-01-09T00:00:00Z"
  },
  {
    id: "4",
    name: "User",
    description: "Standard user access with basic permissions",
    permissions: ["profile.read", "profile.update"],
    isSystemRole: true,
    createdAt: "2024-01-01T00:00:00Z",
    level: 1,
    status: "active",
    isTemplate: false,
    userCount: 150,
    lastUsed: "2024-01-10T00:00:00Z"
  },
  {
    id: "5",
    name: "Auditor",
    description: "Read-only access for compliance and auditing purposes",
    permissions: ["audit.read", "logs.read", "reports.read"],
    isSystemRole: false,
    createdAt: "2024-01-01T00:00:00Z",
    level: 2,
    status: "active",
    isTemplate: false,
    userCount: 3,
    organizationUnit: "Compliance"
  },
  {
    id: "6",
    name: "Guest",
    description: "Limited access for temporary users",
    permissions: ["profile.read"],
    isSystemRole: false,
    createdAt: "2024-01-01T00:00:00Z",
    level: 0,
    status: "inactive",
    isTemplate: false,
    userCount: 0,
    validFrom: "2024-01-01T00:00:00Z",
    validUntil: "2024-12-31T23:59:59Z"
  }
];

// Mock role templates
const mockRoleTemplates: RoleTemplate[] = [
  {
    id: "tmpl-1",
    name: "Department Manager",
    description: "Standard manager role for department heads",
    category: "Management",
    permissions: ["user.read", "user.update", "team.manage", "reports.read"],
    organizationUnit: "any",
    level: 3,
    isBuiltIn: true,
    usageCount: 8
  },
  {
    id: "tmpl-2",
    name: "Project Lead",
    description: "Project leadership with team coordination access",
    category: "Project",
    permissions: ["project.manage", "team.coordinate", "reports.create"],
    level: 2,
    isBuiltIn: true,
    usageCount: 15
  },
  {
    id: "tmpl-3",
    name: "Financial Analyst",
    description: "Financial data access and reporting",
    category: "Finance",
    permissions: ["finance.read", "reports.create", "analytics.read"],
    organizationUnit: "finance",
    level: 2,
    isBuiltIn: true,
    usageCount: 6
  }
];

// Mock role conflicts
const mockRoleConflicts: RoleConflict[] = [
  {
    id: "conflict-1",
    type: "separation_of_duties",
    severity: "high",
    roles: ["Administrator", "Auditor"],
    description: "Administrator and Auditor roles assigned to same user violates separation of duties",
    suggestion: "Remove one of the conflicting roles or create a specialized role",
    resolved: false
  },
  {
    id: "conflict-2",
    type: "permission_overlap",
    severity: "medium",
    roles: ["Manager", "Project Lead"],
    description: "Overlapping permissions between Manager and Project Lead roles",
    suggestion: "Consolidate overlapping permissions into a parent role",
    resolved: false
  }
];

// Generate comprehensive mock permissions
const generateMockPermissions = (): Permission[] => {
  const permissions: Permission[] = [];

  const categories = [
    "User Management", "Role Management", "System", "Security", "Finance",
    "Analytics", "Reporting", "Project Management", "Team Management",
    "Content Management", "API Management", "Audit & Compliance",
    "Customer Management", "Inventory Management", "HR Management",
    "Marketing", "Sales", "Support", "DevOps", "Quality Assurance"
  ];

  const resources = [
    "user", "role", "system", "security", "finance", "analytics", "reports",
    "project", "team", "content", "api", "audit", "customer", "inventory",
    "employee", "campaign", "lead", "ticket", "deployment", "test", "profile",
    "organization", "billing", "notification", "workflow", "dashboard",
    "integration", "backup", "monitoring", "logs", "settings", "database",
    "file", "document", "contract", "invoice", "purchase", "vendor",
    "product", "order", "payment", "shipment", "return", "refund"
  ];

  const actions = [
    "create", "read", "update", "delete", "manage", "execute", "approve",
    "reject", "export", "import", "configure", "monitor", "audit", "backup",
    "restore", "publish", "archive", "share", "copy", "move", "assign",
    "unassign", "activate", "deactivate", "suspend", "resume", "lock", "unlock"
  ];

  const scopes = ["global", "resource", "field", "api"];
  const risks = ["low", "medium", "high", "critical"];

  // Generate base permissions
  let permissionId = 1;

  resources.forEach(resource => {
    const relevantCategory = categories.find(cat =>
      cat.toLowerCase().includes(resource) ||
      resource.includes(cat.toLowerCase().split(' ')[0])
    ) || categories[Math.floor(Math.random() * categories.length)];

    actions.forEach(action => {
      // Not all action-resource combinations make sense, so filter some out
      const validCombination = !(
        (action === "approve" && !["project", "expense", "invoice", "contract"].includes(resource)) ||
        (action === "backup" && !["database", "file", "system"].includes(resource)) ||
        (action === "publish" && !["content", "report", "document"].includes(resource))
      );

      if (validCombination) {
        const scope = scopes[Math.floor(Math.random() * scopes.length)];
        const risk = risks[Math.floor(Math.random() * risks.length)];

        permissions.push({
          id: `${resource}.${action}`,
          name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource.charAt(0).toUpperCase() + resource.slice(1)}`,
          resource,
          action,
          description: `${action.charAt(0).toUpperCase() + action.slice(1)} operations on ${resource} resource`,
          category: relevantCategory,
          scope,
          risk,
          usageCount: Math.floor(Math.random() * 1000),
          lastUsed: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        permissionId++;
      }
    });
  });

  // Add some special administrative permissions
  const adminPermissions = [
    {
      id: "system.admin.full",
      name: "Full System Administration",
      resource: "system",
      action: "admin",
      description: "Complete administrative access to all system functions",
      category: "System",
      scope: "global" as const,
      risk: "critical" as const,
      isSystemPermission: true,
      usageCount: 50,
      lastUsed: "2024-01-10"
    },
    {
      id: "security.override",
      name: "Security Override",
      resource: "security",
      action: "override",
      description: "Override security restrictions in emergency situations",
      category: "Security",
      scope: "global" as const,
      risk: "critical" as const,
      isSystemPermission: true,
      usageCount: 5,
      lastUsed: "2024-01-08"
    },
    {
      id: "data.export.bulk",
      name: "Bulk Data Export",
      resource: "data",
      action: "export",
      description: "Export large datasets including sensitive information",
      category: "Data Management",
      scope: "global" as const,
      risk: "high" as const,
      usageCount: 120,
      lastUsed: "2024-01-09"
    }
  ];

  permissions.push(...adminPermissions);

  // Add field-level permissions for sensitive data
  const sensitiveFields = ["ssn", "credit_card", "salary", "medical_info", "personal_data"];
  sensitiveFields.forEach(field => {
    ["read", "update", "export"].forEach(action => {
      permissions.push({
        id: `field.${field}.${action}`,
        name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${field.replace('_', ' ').toUpperCase()}`,
        resource: "sensitive_data",
        action,
        description: `${action.charAt(0).toUpperCase() + action.slice(1)} access to ${field.replace('_', ' ')} field`,
        category: "Data Privacy",
        scope: "field" as const,
        risk: action === "read" ? "medium" as const : "high" as const,
        usageCount: Math.floor(Math.random() * 100),
        lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    });
  });

  // Add API-specific permissions
  const apiEndpoints = [
    "/api/users", "/api/roles", "/api/analytics", "/api/reports", "/api/billing",
    "/api/payments", "/api/orders", "/api/inventory", "/api/customers", "/api/projects",
    "/api/teams", "/api/content", "/api/settings", "/api/integrations", "/api/webhooks"
  ];

  apiEndpoints.forEach(endpoint => {
    ["GET", "POST", "PUT", "DELETE", "PATCH"].forEach(method => {
      permissions.push({
        id: `api.${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}.${method.toLowerCase()}`,
        name: `${method} ${endpoint}`,
        resource: "api_endpoint",
        action: method.toLowerCase(),
        description: `${method} access to ${endpoint} endpoint`,
        category: "API Management",
        scope: "api" as const,
        risk: method === "DELETE" ? "high" as const : method === "POST" || method === "PUT" ? "medium" as const : "low" as const,
        usageCount: Math.floor(Math.random() * 500),
        lastUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    });
  });

  return permissions.sort((a, b) => a.name.localeCompare(b.name));
};

// Mock permissions - Generate comprehensive dataset
const mockPermissions: Permission[] = generateMockPermissions();

// GET /api/roles - Get all roles with filtering
export const handleGetRoles: RequestHandler = (req, res) => {
  try {
    const { search, status, level, limit, offset } = req.query;
    
    let filteredRoles = [...mockRoles];

    // Apply search filter
    if (search && typeof search === 'string') {
      const searchTerm = search.toLowerCase();
      filteredRoles = filteredRoles.filter(role =>
        role.name.toLowerCase().includes(searchTerm) ||
        role.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (status && typeof status === 'string' && status !== 'all') {
      filteredRoles = filteredRoles.filter(role => role.status === status);
    }

    // Apply level filter
    if (level && typeof level === 'string' && level !== 'all') {
      filteredRoles = filteredRoles.filter(role => role.level.toString() === level);
    }

    // Apply pagination
    const limitNum = limit ? parseInt(limit as string) : undefined;
    const offsetNum = offset ? parseInt(offset as string) : 0;
    
    if (limitNum) {
      filteredRoles = filteredRoles.slice(offsetNum, offsetNum + limitNum);
    }

    res.json({
      roles: filteredRoles,
      total: mockRoles.length,
      filtered: filteredRoles.length
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/roles/:id - Get specific role
export const handleGetRole: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const role = mockRoles.find(r => r.id === id);
    
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.json(role);
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/roles - Create new role
export const handleCreateRole: RequestHandler = (req, res) => {
  try {
    const roleData: CreateRoleRequest = req.body;

    // Validate required fields
    if (!roleData.name || !roleData.description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if role name already exists
    const existingRole = mockRoles.find(r => r.name.toLowerCase() === roleData.name.toLowerCase());
    if (existingRole) {
      return res.status(409).json({ error: "Role name already exists" });
    }

    // Determine role level based on parent role
    let level = 1;
    if (roleData.parentRole) {
      const parentRole = mockRoles.find(r => r.id === roleData.parentRole);
      if (parentRole) {
        level = parentRole.level + 1;
      }
    }

    // Create new role
    const newRole: Role = {
      id: (mockRoles.length + 1).toString(),
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions || [],
      isSystemRole: false,
      createdAt: new Date().toISOString(),
      level,
      status: "active",
      isTemplate: roleData.isTemplate || false,
      parentRole: roleData.parentRole,
      organizationUnit: roleData.organizationUnit,
      validFrom: roleData.validFrom,
      validUntil: roleData.validUntil,
      userCount: 0
    };

    // Add inherited permissions if parent role exists
    if (roleData.parentRole) {
      const parentRole = mockRoles.find(r => r.id === roleData.parentRole);
      if (parentRole) {
        newRole.inheritedPermissions = [...parentRole.permissions];
        if (parentRole.inheritedPermissions) {
          newRole.inheritedPermissions.push(...parentRole.inheritedPermissions);
        }
      }
    }

    mockRoles.push(newRole);
    res.status(201).json(newRole);
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/roles/:id - Update role
export const handleUpdateRole: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const roleIndex = mockRoles.findIndex(r => r.id === id);
    if (roleIndex === -1) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Prevent updating system roles
    if (mockRoles[roleIndex].isSystemRole && updateData.isSystemRole === false) {
      return res.status(403).json({ error: "Cannot modify system role status" });
    }

    // Update role data
    mockRoles[roleIndex] = {
      ...mockRoles[roleIndex],
      ...updateData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    res.json(mockRoles[roleIndex]);
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/roles/:id - Delete role
export const handleDeleteRole: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    if (roleIndex === -1) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Prevent deletion of system roles
    if (mockRoles[roleIndex].isSystemRole) {
      return res.status(403).json({ error: "Cannot delete system roles" });
    }

    // Check if role has assigned users
    if (mockRoles[roleIndex].userCount && mockRoles[roleIndex].userCount! > 0) {
      return res.status(409).json({ error: "Cannot delete role with assigned users" });
    }

    mockRoles.splice(roleIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/roles/templates - Get role templates
export const handleGetRoleTemplates: RequestHandler = (req, res) => {
  try {
    res.json(mockRoleTemplates);
  } catch (error) {
    console.error("Error fetching role templates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/roles/conflicts - Get role conflicts
export const handleGetRoleConflicts: RequestHandler = (req, res) => {
  try {
    res.json(mockRoleConflicts);
  } catch (error) {
    console.error("Error fetching role conflicts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/roles/:id/analytics - Get role analytics
export const handleGetRoleAnalytics: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const role = mockRoles.find(r => r.id === id);
    
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Generate mock analytics
    const analytics: RoleAnalytics = {
      roleId: id,
      userCount: role.userCount || 0,
      permissionCount: role.permissions.length,
      inheritedPermissionCount: role.inheritedPermissions?.length || 0,
      usageMetrics: {
        lastUsed: role.lastUsed || new Date().toISOString(),
        frequency: role.userCount && role.userCount > 50 ? 'high' : 
                  role.userCount && role.userCount > 10 ? 'medium' : 
                  role.userCount && role.userCount > 0 ? 'low' : 'unused',
        averageSessionDuration: Math.floor(Math.random() * 120) + 30 // 30-150 minutes
      },
      complianceScore: Math.floor(Math.random() * 20) + 80, // 80-100%
      conflicts: mockRoleConflicts.filter(c => c.roles.includes(role.name) && !c.resolved).length,
      recommendations: [
        "Consider reviewing unused permissions",
        "Monitor access patterns for optimization",
        "Review role hierarchy for efficiency"
      ]
    };

    res.json(analytics);
  } catch (error) {
    console.error("Error fetching role analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/roles/hierarchy - Get role hierarchy
export const handleGetRoleHierarchy: RequestHandler = (req, res) => {
  try {
    const hierarchy = mockRoles.map(role => ({
      id: role.id,
      name: role.name,
      level: role.level,
      parentRole: role.parentRole,
      childRoles: mockRoles.filter(r => r.parentRole === role.id).map(r => r.id),
      status: role.status
    }));

    res.json(hierarchy);
  } catch (error) {
    console.error("Error fetching role hierarchy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/roles/:id/clone - Clone existing role
export const handleCloneRole: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const sourceRole = mockRoles.find(r => r.id === id);
    if (!sourceRole) {
      return res.status(404).json({ error: "Source role not found" });
    }

    const clonedRole: Role = {
      ...sourceRole,
      id: (mockRoles.length + 1).toString(),
      name: name || `${sourceRole.name} Copy`,
      description: description || `Copy of ${sourceRole.description}`,
      isSystemRole: false,
      createdAt: new Date().toISOString(),
      userCount: 0,
      status: "pending"
    };

    mockRoles.push(clonedRole);
    res.status(201).json(clonedRole);
  } catch (error) {
    console.error("Error cloning role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/roles/conflicts/:id/resolve - Resolve role conflict
export const handleResolveConflict: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, resolvedBy } = req.body;

    const conflictIndex = mockRoleConflicts.findIndex(c => c.id === id);
    if (conflictIndex === -1) {
      return res.status(404).json({ error: "Conflict not found" });
    }

    mockRoleConflicts[conflictIndex] = {
      ...mockRoleConflicts[conflictIndex],
      resolved: true,
      resolvedAt: new Date().toISOString(),
      resolvedBy: resolvedBy
    };

    res.json(mockRoleConflicts[conflictIndex]);
  } catch (error) {
    console.error("Error resolving conflict:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/permissions - Get all available permissions
export const handleGetPermissions: RequestHandler = (req, res) => {
  try {
    res.json(mockPermissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
