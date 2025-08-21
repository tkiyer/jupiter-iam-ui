import { RequestHandler } from "express";
import { LoginRequest, LoginResponse, User } from "@shared/iam";

// Mock user database (in production, this would be a real database)
const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@company.com",
    firstName: "System",
    lastName: "Administrator",
    status: "active",
    roles: ["admin", "super-admin"],
    attributes: {
      department: "IT",
      clearanceLevel: "high",
      location: "headquarters"
    },
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: new Date().toISOString()
  },
  {
    id: "2", 
    username: "manager",
    email: "manager@company.com",
    firstName: "John",
    lastName: "Manager",
    status: "active",
    roles: ["manager", "user"],
    attributes: {
      department: "Operations",
      clearanceLevel: "medium",
      location: "branch-office"
    },
    createdAt: "2024-01-15T00:00:00Z",
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "3",
    username: "user", 
    email: "user@company.com",
    firstName: "Jane",
    lastName: "User",
    status: "active",
    roles: ["user"],
    attributes: {
      department: "Sales",
      clearanceLevel: "low",
      location: "remote"
    },
    createdAt: "2024-02-01T00:00:00Z",
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock password validation (in production, use proper hashing)
const mockPasswords: Record<string, string> = {
  "admin": "admin123",
  "manager": "manager123", 
  "user": "user123"
};

// Mock JWT token generation (in production, use proper JWT library)
const generateMockToken = (userId: string): string => {
  return `mock-jwt-token-${userId}-${Date.now()}`;
};

export const handleLogin: RequestHandler = (req, res) => {
  try {
    const { username, password }: LoginRequest = req.body;

    if (!username || !password) {
      const response: LoginResponse = {
        success: false,
        message: "Username and password are required"
      };
      return res.status(400).json(response);
    }

    // Find user
    const user = mockUsers.find(u => u.username === username);
    if (!user) {
      const response: LoginResponse = {
        success: false,
        message: "Invalid username or password"
      };
      return res.status(401).json(response);
    }

    // Validate password
    const validPassword = mockPasswords[username] === password;
    if (!validPassword) {
      const response: LoginResponse = {
        success: false,
        message: "Invalid username or password"
      };
      return res.status(401).json(response);
    }

    // Check if user is active
    if (user.status !== "active") {
      const response: LoginResponse = {
        success: false,
        message: "Account is inactive or suspended"
      };
      return res.status(403).json(response);
    }

    // Update last login
    user.lastLogin = new Date().toISOString();

    // Generate token
    const token = generateMockToken(user.id);

    const response: LoginResponse = {
      success: true,
      token,
      user: {
        ...user,
        // Don't send sensitive data
      }
    };

    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    const response: LoginResponse = {
      success: false,
      message: "Internal server error"
    };
    res.status(500).json(response);
  }
};

export const handleVerifyToken: RequestHandler = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token || !token.startsWith("mock-jwt-token")) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Extract user ID from mock token
    const parts = token.split("-");
    const userId = parts[3];
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user || user.status !== "active") {
      return res.status(401).json({ success: false, message: "Invalid or inactive user" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
