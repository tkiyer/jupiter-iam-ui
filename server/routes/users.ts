import { RequestHandler } from "express";
import { User, CreateUserRequest } from "@shared/iam";

// Mock user database (in production, this would be a real database)
let mockUsers: User[] = [
  {
    id: "1",
    username: "john.doe",
    email: "john.doe@company.com",
    firstName: "John",
    lastName: "Doe",
    status: "active",
    roles: ["user", "manager"],
    attributes: {
      department: "Engineering",
      clearanceLevel: "medium",
      location: "New York",
      phone: "+1-555-0123",
      hireDate: "2023-01-15",
      mfaEnabled: true,
      lastPasswordChange: "2024-01-01T00:00:00Z"
    },
    createdAt: "2023-01-15T00:00:00Z",
    lastLogin: "2024-01-10T14:30:00Z"
  },
  {
    id: "2",
    username: "jane.smith",
    email: "jane.smith@company.com",
    firstName: "Jane",
    lastName: "Smith",
    status: "active",
    roles: ["admin", "user"],
    attributes: {
      department: "IT",
      clearanceLevel: "high",
      location: "San Francisco",
      phone: "+1-555-0124",
      hireDate: "2022-08-10",
      mfaEnabled: true,
      lastPasswordChange: "2024-01-01T00:00:00Z"
    },
    createdAt: "2022-08-10T00:00:00Z",
    lastLogin: "2024-01-10T09:15:00Z"
  },
  {
    id: "3",
    username: "bob.wilson",
    email: "bob.wilson@company.com",
    firstName: "Bob",
    lastName: "Wilson",
    status: "inactive",
    roles: ["user"],
    attributes: {
      department: "Sales",
      clearanceLevel: "low",
      location: "Chicago",
      phone: "+1-555-0125",
      hireDate: "2023-06-01",
      mfaEnabled: false,
      lastPasswordChange: "2023-06-01T00:00:00Z"
    },
    createdAt: "2023-06-01T00:00:00Z",
    lastLogin: "2023-12-15T16:45:00Z"
  },
  {
    id: "4",
    username: "alice.brown",
    email: "alice.brown@company.com",
    firstName: "Alice",
    lastName: "Brown",
    status: "suspended",
    roles: ["user"],
    attributes: {
      department: "HR",
      clearanceLevel: "medium",
      location: "Boston",
      phone: "+1-555-0126",
      hireDate: "2023-03-20",
      mfaEnabled: true,
      lastPasswordChange: "2023-12-01T00:00:00Z"
    },
    createdAt: "2023-03-20T00:00:00Z",
    lastLogin: "2023-12-20T11:20:00Z"
  },
  {
    id: "5",
    username: "david.garcia",
    email: "david.garcia@company.com",
    firstName: "David",
    lastName: "Garcia",
    status: "active",
    roles: ["user", "auditor"],
    attributes: {
      department: "Finance",
      clearanceLevel: "high",
      location: "Miami",
      phone: "+1-555-0127",
      hireDate: "2023-09-15",
      mfaEnabled: true,
      lastPasswordChange: "2024-01-05T00:00:00Z"
    },
    createdAt: "2023-09-15T00:00:00Z",
    lastLogin: "2024-01-09T16:20:00Z"
  }
];

// GET /api/users - Get all users with optional filtering
export const handleGetUsers: RequestHandler = (req, res) => {
  try {
    const { search, status, role, limit, offset } = req.query;
    
    let filteredUsers = [...mockUsers];

    // Apply search filter
    if (search && typeof search === 'string') {
      const searchTerm = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (status && typeof status === 'string' && status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    // Apply role filter
    if (role && typeof role === 'string' && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.roles.includes(role));
    }

    // Apply pagination
    const limitNum = limit ? parseInt(limit as string) : undefined;
    const offsetNum = offset ? parseInt(offset as string) : 0;
    
    if (limitNum) {
      filteredUsers = filteredUsers.slice(offsetNum, offsetNum + limitNum);
    }

    res.json({
      users: filteredUsers,
      total: mockUsers.length,
      filtered: filteredUsers.length
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/users/:id - Get specific user
export const handleGetUser: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/users - Create new user
export const handleCreateUser: RequestHandler = (req, res) => {
  try {
    const userData: CreateUserRequest = req.body;

    // Validate required fields
    if (!userData.username || !userData.email || !userData.firstName || !userData.lastName || !userData.password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if username or email already exists
    const existingUser = mockUsers.find(u => 
      u.username === userData.username || u.email === userData.email
    );
    
    if (existingUser) {
      return res.status(409).json({ error: "Username or email already exists" });
    }

    // Create new user
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      status: "active",
      roles: userData.roles || ["user"],
      attributes: {
        ...userData.attributes,
        mfaEnabled: false,
        lastPasswordChange: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };

    mockUsers.push(newUser);

    // Return user without sensitive data
    const { ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/users/:id - Update user
export const handleUpdateUser: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user data
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updateData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    res.json(mockUsers[userIndex]);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/users/:id - Delete user
export const handleDeleteUser: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent deletion of admin users (safety check)
    if (mockUsers[userIndex].roles.includes("admin")) {
      return res.status(403).json({ error: "Cannot delete admin users" });
    }

    mockUsers.splice(userIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/users/:id/reset-password - Reset user password
export const handleResetPassword: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, forceReset } = req.body;

    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update password change timestamp
    mockUsers[userIndex].attributes = {
      ...mockUsers[userIndex].attributes,
      lastPasswordChange: new Date().toISOString(),
      forcePasswordReset: forceReset || false
    };

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/users/:id/toggle-mfa - Toggle MFA for user
export const handleToggleMFA: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    mockUsers[userIndex].attributes = {
      ...mockUsers[userIndex].attributes,
      mfaEnabled: enabled
    };

    res.json({ message: `MFA ${enabled ? 'enabled' : 'disabled'} successfully` });
  } catch (error) {
    console.error("Error toggling MFA:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/users/bulk-import - Bulk import users
export const handleBulkImport: RequestHandler = (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users)) {
      return res.status(400).json({ error: "Users must be an array" });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    users.forEach((userData: CreateUserRequest, index: number) => {
      try {
        // Basic validation
        if (!userData.username || !userData.email) {
          results.failed++;
          results.errors.push(`Row ${index + 1}: Missing username or email`);
          return;
        }

        // Check for duplicates
        const existing = mockUsers.find(u => 
          u.username === userData.username || u.email === userData.email
        );
        
        if (existing) {
          results.failed++;
          results.errors.push(`Row ${index + 1}: Username or email already exists`);
          return;
        }

        // Create user
        const newUser: User = {
          id: (mockUsers.length + results.success + 1).toString(),
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          status: "active",
          roles: userData.roles || ["user"],
          attributes: userData.attributes || {},
          createdAt: new Date().toISOString()
        };

        mockUsers.push(newUser);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${index + 1}: ${error}`);
      }
    });

    res.json(results);
  } catch (error) {
    console.error("Error importing users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/users/export - Export users
export const handleExportUsers: RequestHandler = (req, res) => {
  try {
    const { format = 'json' } = req.query;

    if (format === 'csv') {
      // Generate CSV format
      const csvHeaders = 'ID,Username,Email,First Name,Last Name,Status,Roles,Department,Created At\n';
      const csvData = mockUsers.map(user => 
        `${user.id},${user.username},${user.email},${user.firstName},${user.lastName},${user.status},"${user.roles.join(';')}",${user.attributes?.department || ''},${user.createdAt}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
      res.send(csvHeaders + csvData);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="users.json"');
      res.json(mockUsers);
    }
  } catch (error) {
    console.error("Error exporting users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/users/:id/activity - Get user activity log
export const handleGetUserActivity: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Mock activity data
    const activities = [
      {
        id: "1",
        action: "login",
        timestamp: user.lastLogin || new Date().toISOString(),
        details: { ip: "192.168.1.100", userAgent: "Mozilla/5.0..." },
        result: "success"
      },
      {
        id: "2",
        action: "role_assignment",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        details: { role: "manager", assignedBy: "admin" },
        result: "success"
      },
      {
        id: "3",
        action: "password_change",
        timestamp: user.attributes?.lastPasswordChange || new Date().toISOString(),
        details: { initiatedBy: "self" },
        result: "success"
      }
    ];

    res.json(activities);
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
