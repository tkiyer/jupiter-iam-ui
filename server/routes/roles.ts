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

// Mock permissions
const mockPermissions: Permission[] = [
  { id: "user.create", name: "Create Users", resource: "user", action: "create", description: "Create new user accounts", category: "User Management" },
  { id: "user.read", name: "Read Users", resource: "user", action: "read", description: "View user information", category: "User Management" },
  { id: "user.update", name: "Update Users", resource: "user", action: "update", description: "Modify user accounts", category: "User Management" },
  { id: "user.delete", name: "Delete Users", resource: "user", action: "delete", description: "Remove user accounts", category: "User Management" },
  { id: "role.create", name: "Create Roles", resource: "role", action: "create", description: "Create new roles", category: "Role Management" },
  { id: "role.read", name: "Read Roles", resource: "role", action: "read", description: "View role information", category: "Role Management" },
  { id: "role.update", name: "Update Roles", resource: "role", action: "update", description: "Modify roles", category: "Role Management" },
  { id: "role.delete", name: "Delete Roles", resource: "role", action: "delete", description: "Remove roles", category: "Role Management" },
  { id: "system.admin", name: "System Admin", resource: "system", action: "admin", description: "Full system administration", category: "System" },
  { id: "profile.read", name: "Read Profile", resource: "profile", action: "read", description: "View own profile", category: "Profile" },
  { id: "profile.update", name: "Update Profile", resource: "profile", action: "update", description: "Update own profile", category: "Profile" },
  { id: "team.manage", name: "Manage Team", resource: "team", action: "manage", description: "Manage team members", category: "Team" },
  { id: "audit.read", name: "Read Audit Logs", resource: "audit", action: "read", description: "View audit logs", category: "Audit" },
  { id: "logs.read", name: "Read Logs", resource: "logs", action: "read", description: "View system logs", category: "Audit" },
  { id: "reports.read", name: "Read Reports", resource: "reports", action: "read", description: "View reports", category: "Reporting" },
  { id: "reports.create", name: "Create Reports", resource: "reports", action: "create", description: "Create reports", category: "Reporting" },
  { id: "project.manage", name: "Manage Projects", resource: "project", action: "manage", description: "Manage project settings", category: "Project" },
  { id: "team.coordinate", name: "Coordinate Team", resource: "team", action: "coordinate", description: "Coordinate team activities", category: "Team" },
  { id: "finance.read", name: "Read Financial Data", resource: "finance", action: "read", description: "View financial information", category: "Finance" },
  { id: "analytics.read", name: "Read Analytics", resource: "analytics", action: "read", description: "View analytics data", category: "Analytics" }
];

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
