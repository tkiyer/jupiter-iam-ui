import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { User, CreateUserRequest } from "@shared/iam";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  MoreHorizontal,
  Shield,
  Clock,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  Users,
  Building,
  Tag,
  Star,
  ArrowRight,
  Copy,
  CheckCircle,
  Layers,
  Folder,
  FolderOpen,
  Crown,
  TrendingUp,
  Target,
  Settings,
  Code,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PaginationControl,
  usePagination,
} from "@/components/ui/pagination-control";

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Pagination state
  const {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredUsers.length, 10);

  // Paginated users for display
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Mock data - replace with API calls
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data.users || data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.roles.includes(roleFilter));
    }

    setFilteredUsers(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <UserCheck className="h-3 w-3" />;
      case "inactive":
        return <Clock className="h-3 w-3" />;
      case "suspended":
        return <UserX className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers((prev) => [...prev, newUser]);
        setIsCreateDialogOpen(false);
      } else {
        const error = await response.json();
        console.error("Error creating user:", error.error);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage users, roles, and access permissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open("/api/users/export?format=csv", "_blank")
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <CreateUserDialog onCreateUser={handleCreateUser} />
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, or username..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Users ({filteredUsers.length})</span>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "flex items-center gap-1",
                        getStatusColor(user.status),
                      )}
                    >
                      {getStatusIcon(user.status)}
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {user.attributes?.department || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "Never"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Control */}
          <div className="mt-4">
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredUsers.length}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <EditUserDialog
            user={selectedUser}
            onSave={(updatedUser) => {
              setUsers((prev) =>
                prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
              );
              setIsEditDialogOpen(false);
            }}
          />
        </Dialog>
      )}
    </div>
  );
};

// Create User Dialog Component
const CreateUserDialog: React.FC<{
  onCreateUser: (user: CreateUserRequest) => void;
}> = ({ onCreateUser }) => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    roles: [],
    attributes: {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateUser(formData);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New User</DialogTitle>
        <DialogDescription>
          Add a new user to the system with appropriate roles and permissions.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="roles">Roles & Access</TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-4 block">
                Assign Roles
              </Label>
              <EnhancedRolesSelector
                selectedRoles={formData.roles}
                onRolesChange={(roles) =>
                  setFormData((prev) => ({ ...prev, roles }))
                }
                variant="create"
              />
            </div>
          </TabsContent>

          <TabsContent value="attributes" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      attributes: { ...prev.attributes, department: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Clearance Level</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      attributes: { ...prev.attributes, clearanceLevel: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select clearance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Office location"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    attributes: {
                      ...prev.attributes,
                      location: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Create User
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Edit User Dialog Component
const EditUserDialog: React.FC<{
  user: User;
  onSave: (user: User) => void;
}> = ({ user, onSave }) => {
  const [formData, setFormData] = useState<User>(user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onSave(updatedUser);
      } else {
        const error = await response.json();
        console.error("Error updating user:", error.error);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          Edit User: {user.firstName} {user.lastName}
        </DialogTitle>
        <DialogDescription>
          Update user information, roles, and attributes.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive" | "suspended") =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={formData.attributes?.phone || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      attributes: { ...prev.attributes, phone: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-4 block">
                Manage Roles
              </Label>
              <EnhancedRolesSelector
                selectedRoles={formData.roles}
                onRolesChange={(roles) =>
                  setFormData((prev) => ({ ...prev, roles }))
                }
                variant="edit"
              />
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Multi-Factor Authentication</p>
                      <p className="text-sm text-gray-500">
                        Require MFA for login
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Force Password Reset</p>
                      <p className="text-sm text-gray-500">
                        Require password change on next login
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Account Locked</p>
                      <p className="text-sm text-gray-500">
                        Temporarily lock account access
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-full">
                      <UserCheck className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Successful login</p>
                      <p className="text-xs text-gray-500">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString()
                          : "Never"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Role updated</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Enhanced Roles Selector Component for handling hundreds of roles
const EnhancedRolesSelector: React.FC<{
  selectedRoles: string[];
  onRolesChange: (roles: string[]) => void;
  variant?: "create" | "edit";
}> = ({ selectedRoles, onRolesChange, variant = "create" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["common"]),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showSelected, setShowSelected] = useState(false);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const itemsPerPage = 20;

  // Mock roles data - in real implementation, this would come from API
  const allRoles = [
    // Common roles
    {
      id: "admin",
      name: "Administrator",
      description: "Full system access",
      category: "common",
      isCore: true,
    },
    {
      id: "manager",
      name: "Manager",
      description: "Team management access",
      category: "common",
      isCore: true,
    },
    {
      id: "user",
      name: "User",
      description: "Standard user access",
      category: "common",
      isCore: true,
    },
    {
      id: "auditor",
      name: "Auditor",
      description: "Audit and compliance access",
      category: "common",
      isCore: true,
    },

    // Engineering roles
    {
      id: "eng_lead",
      name: "Engineering Lead",
      description: "Lead engineering teams",
      category: "engineering",
      parent: "manager",
    },
    {
      id: "senior_dev",
      name: "Senior Developer",
      description: "Senior development role",
      category: "engineering",
    },
    {
      id: "junior_dev",
      name: "Junior Developer",
      description: "Junior development role",
      category: "engineering",
    },
    {
      id: "devops",
      name: "DevOps Engineer",
      description: "Infrastructure and deployment",
      category: "engineering",
    },
    {
      id: "qa_lead",
      name: "QA Lead",
      description: "Quality assurance leadership",
      category: "engineering",
    },
    {
      id: "qa_engineer",
      name: "QA Engineer",
      description: "Quality assurance testing",
      category: "engineering",
    },
    {
      id: "architect",
      name: "Solution Architect",
      description: "System architecture design",
      category: "engineering",
    },
    {
      id: "tech_writer",
      name: "Technical Writer",
      description: "Technical documentation",
      category: "engineering",
    },

    // Sales roles
    {
      id: "sales_dir",
      name: "Sales Director",
      description: "Sales team management",
      category: "sales",
      parent: "manager",
    },
    {
      id: "sales_mgr",
      name: "Sales Manager",
      description: "Regional sales management",
      category: "sales",
      parent: "manager",
    },
    {
      id: "account_exec",
      name: "Account Executive",
      description: "Client account management",
      category: "sales",
    },
    {
      id: "sales_rep",
      name: "Sales Representative",
      description: "Direct sales activities",
      category: "sales",
    },
    {
      id: "presales",
      name: "Pre-Sales Engineer",
      description: "Technical sales support",
      category: "sales",
    },
    {
      id: "sales_ops",
      name: "Sales Operations",
      description: "Sales process optimization",
      category: "sales",
    },

    // Marketing roles
    {
      id: "marketing_dir",
      name: "Marketing Director",
      description: "Marketing strategy and leadership",
      category: "marketing",
      parent: "manager",
    },
    {
      id: "product_marketing",
      name: "Product Marketing Manager",
      description: "Product marketing strategy",
      category: "marketing",
    },
    {
      id: "content_marketing",
      name: "Content Marketing Manager",
      description: "Content strategy and creation",
      category: "marketing",
    },
    {
      id: "digital_marketing",
      name: "Digital Marketing Specialist",
      description: "Digital marketing campaigns",
      category: "marketing",
    },
    {
      id: "seo_specialist",
      name: "SEO Specialist",
      description: "Search engine optimization",
      category: "marketing",
    },
    {
      id: "social_media",
      name: "Social Media Manager",
      description: "Social media strategy",
      category: "marketing",
    },

    // Finance roles
    {
      id: "cfo",
      name: "Chief Financial Officer",
      description: "Financial leadership",
      category: "finance",
      parent: "admin",
    },
    {
      id: "finance_mgr",
      name: "Finance Manager",
      description: "Financial operations management",
      category: "finance",
      parent: "manager",
    },
    {
      id: "accountant",
      name: "Accountant",
      description: "Accounting and bookkeeping",
      category: "finance",
    },
    {
      id: "finance_analyst",
      name: "Financial Analyst",
      description: "Financial analysis and reporting",
      category: "finance",
    },
    {
      id: "payroll",
      name: "Payroll Specialist",
      description: "Payroll processing",
      category: "finance",
    },
    {
      id: "budget_analyst",
      name: "Budget Analyst",
      description: "Budget planning and analysis",
      category: "finance",
    },

    // HR roles
    {
      id: "hr_dir",
      name: "HR Director",
      description: "Human resources leadership",
      category: "hr",
      parent: "manager",
    },
    {
      id: "hr_mgr",
      name: "HR Manager",
      description: "HR operations management",
      category: "hr",
      parent: "manager",
    },
    {
      id: "recruiter",
      name: "Recruiter",
      description: "Talent acquisition",
      category: "hr",
    },
    {
      id: "hr_generalist",
      name: "HR Generalist",
      description: "General HR support",
      category: "hr",
    },
    {
      id: "benefits_admin",
      name: "Benefits Administrator",
      description: "Employee benefits management",
      category: "hr",
    },
    {
      id: "training_spec",
      name: "Training Specialist",
      description: "Employee training and development",
      category: "hr",
    },

    // IT roles
    {
      id: "it_dir",
      name: "IT Director",
      description: "IT infrastructure leadership",
      category: "it",
      parent: "manager",
    },
    {
      id: "sysadmin",
      name: "System Administrator",
      description: "System administration",
      category: "it",
    },
    {
      id: "network_admin",
      name: "Network Administrator",
      description: "Network infrastructure",
      category: "it",
    },
    {
      id: "security_analyst",
      name: "Security Analyst",
      description: "Information security",
      category: "it",
    },
    {
      id: "helpdesk",
      name: "Helpdesk Specialist",
      description: "Technical support",
      category: "it",
    },
    {
      id: "dba",
      name: "Database Administrator",
      description: "Database management",
      category: "it",
    },

    // Operations roles
    {
      id: "ops_mgr",
      name: "Operations Manager",
      description: "Operations management",
      category: "operations",
      parent: "manager",
    },
    {
      id: "project_mgr",
      name: "Project Manager",
      description: "Project coordination",
      category: "operations",
    },
    {
      id: "business_analyst",
      name: "Business Analyst",
      description: "Business process analysis",
      category: "operations",
    },
    {
      id: "data_analyst",
      name: "Data Analyst",
      description: "Data analysis and reporting",
      category: "operations",
    },
    {
      id: "compliance",
      name: "Compliance Officer",
      description: "Regulatory compliance",
      category: "operations",
    },
    {
      id: "vendor_mgr",
      name: "Vendor Manager",
      description: "Vendor relationship management",
      category: "operations",
    },

    // Customer Support roles
    {
      id: "support_mgr",
      name: "Support Manager",
      description: "Customer support management",
      category: "support",
      parent: "manager",
    },
    {
      id: "support_lead",
      name: "Support Team Lead",
      description: "Support team leadership",
      category: "support",
    },
    {
      id: "support_agent",
      name: "Support Agent",
      description: "Customer support",
      category: "support",
    },
    {
      id: "tech_support",
      name: "Technical Support Specialist",
      description: "Technical customer support",
      category: "support",
    },
    {
      id: "customer_success",
      name: "Customer Success Manager",
      description: "Customer relationship management",
      category: "support",
    },

    // Executive roles
    {
      id: "ceo",
      name: "Chief Executive Officer",
      description: "Executive leadership",
      category: "executive",
      parent: "admin",
      isCore: true,
    },
    {
      id: "cto",
      name: "Chief Technology Officer",
      description: "Technology leadership",
      category: "executive",
      parent: "admin",
    },
    {
      id: "coo",
      name: "Chief Operating Officer",
      description: "Operations leadership",
      category: "executive",
      parent: "admin",
    },
    {
      id: "vp_eng",
      name: "VP of Engineering",
      description: "Engineering leadership",
      category: "executive",
      parent: "admin",
    },
    {
      id: "vp_sales",
      name: "VP of Sales",
      description: "Sales leadership",
      category: "executive",
      parent: "admin",
    },
    {
      id: "vp_marketing",
      name: "VP of Marketing",
      description: "Marketing leadership",
      category: "executive",
      parent: "admin",
    },

    // Contractor roles
    {
      id: "contractor",
      name: "Contractor",
      description: "External contractor access",
      category: "contractor",
    },
    {
      id: "consultant",
      name: "Consultant",
      description: "External consultant access",
      category: "contractor",
    },
    {
      id: "vendor",
      name: "Vendor",
      description: "Vendor access",
      category: "contractor",
    },
    {
      id: "intern",
      name: "Intern",
      description: "Internship access",
      category: "contractor",
    },

    // Guest/Temporary roles
    {
      id: "guest",
      name: "Guest",
      description: "Limited guest access",
      category: "guest",
    },
    {
      id: "temp",
      name: "Temporary Employee",
      description: "Temporary access",
      category: "guest",
    },
    {
      id: "readonly",
      name: "Read-only",
      description: "View-only access",
      category: "guest",
    },
    {
      id: "demo",
      name: "Demo User",
      description: "Demonstration access",
      category: "guest",
    },
  ];

  const categories = [
    { id: "all", name: "All Roles", icon: Layers, count: allRoles.length },
    {
      id: "common",
      name: "Common Roles",
      icon: Star,
      count: allRoles.filter((r) => r.isCore).length,
    },
    {
      id: "engineering",
      name: "Engineering",
      icon: Code,
      count: allRoles.filter((r) => r.category === "engineering").length,
    },
    {
      id: "sales",
      name: "Sales",
      icon: TrendingUp,
      count: allRoles.filter((r) => r.category === "sales").length,
    },
    {
      id: "marketing",
      name: "Marketing",
      icon: Target,
      count: allRoles.filter((r) => r.category === "marketing").length,
    },
    {
      id: "finance",
      name: "Finance",
      icon: Building,
      count: allRoles.filter((r) => r.category === "finance").length,
    },
    {
      id: "hr",
      name: "Human Resources",
      icon: Users,
      count: allRoles.filter((r) => r.category === "hr").length,
    },
    {
      id: "it",
      name: "IT",
      icon: Shield,
      count: allRoles.filter((r) => r.category === "it").length,
    },
    {
      id: "operations",
      name: "Operations",
      icon: Settings,
      count: allRoles.filter((r) => r.category === "operations").length,
    },
    {
      id: "support",
      name: "Support",
      icon: UserCheck,
      count: allRoles.filter((r) => r.category === "support").length,
    },
    {
      id: "executive",
      name: "Executive",
      icon: Crown,
      count: allRoles.filter((r) => r.category === "executive").length,
    },
    {
      id: "contractor",
      name: "Contractor",
      icon: Copy,
      count: allRoles.filter((r) => r.category === "contractor").length,
    },
    {
      id: "guest",
      name: "Guest",
      icon: Eye,
      count: allRoles.filter((r) => r.category === "guest").length,
    },
  ];

  // Filter roles based on search, category, and show selected filter
  const filteredRoles = allRoles.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "common" && role.isCore) ||
      role.category === selectedCategory;

    const matchesSelected = !showSelected || selectedRoles.includes(role.id);

    return matchesSearch && matchesCategory && matchesSelected;
  });

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleRoleToggle = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      onRolesChange(selectedRoles.filter((id) => id !== roleId));
    } else {
      onRolesChange([...selectedRoles, roleId]);
    }
  };

  const handleSelectAll = () => {
    const allVisibleRoleIds = filteredRoles.map((role) => role.id);
    const uniqueRoles = [...new Set([...selectedRoles, ...allVisibleRoleIds])];
    onRolesChange(uniqueRoles);
  };

  const handleDeselectAll = () => {
    const visibleRoleIds = new Set(filteredRoles.map((role) => role.id));
    onRolesChange(selectedRoles.filter((id) => !visibleRoleIds.has(id)));
  };

  const handleClearAll = () => {
    onRolesChange([]);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const commonRolesSuggestions = allRoles.filter((r) => r.isCore).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {selectedRoles.length} selected
          </Badge>
          {selectedRoles.length > 0 && (
            <div
              onClick={handleClearAll}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 text-red-600 hover:text-red-700 cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClearAll();
                }
              }}
            >
              <X className="mr-1 h-3 w-3" />
              Clear All
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div
            onClick={() => setShowSelected(!showSelected)}
            className={cn(
              "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer",
              showSelected ? "bg-blue-50 text-blue-700" : ""
            )}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowSelected(!showSelected);
              }
            }}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {showSelected ? "Show All" : "Show Selected Only"}
          </div>
          <div
            onClick={() => setBulkSelectMode(!bulkSelectMode)}
            className={cn(
              "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer",
              bulkSelectMode ? "bg-blue-50 text-blue-700" : ""
            )}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setBulkSelectMode(!bulkSelectMode);
              }
            }}
          >
            <Check className="mr-2 h-4 w-4" />
            Bulk Select
          </div>
        </div>
      </div>

      {/* Common Roles Quick Access */}
      {!showSelected && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Star className="mr-2 h-4 w-4 text-yellow-500" />
              Common Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {commonRolesSuggestions.map((role) => {
                const isSelected = selectedRoles.includes(role.id);
                return (
                  <div
                    key={role.id}
                    onClick={() => handleRoleToggle(role.id)}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 cursor-pointer",
                      isSelected
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    )}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRoleToggle(role.id);
                      }
                    }}
                  >
                    {isSelected && <Check className="mr-1 h-3 w-3" />}
                    {role.name}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.id;

                  return (
                    <div
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors cursor-pointer",
                        isSelected &&
                          "bg-blue-50 text-blue-700 border-r-2 border-blue-600",
                      )}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedCategory(category.id);
                          setCurrentPage(1);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {category.name}
                        </span>
                      </div>
                      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                        {category.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search and Bulk Actions */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search roles by name or description..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>
                {bulkSelectMode && filteredRoles.length > 0 && (
                  <div className="flex gap-2">
                    <div
                      onClick={handleSelectAll}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectAll();
                        }
                      }}
                    >
                      Select All ({filteredRoles.length})
                    </div>
                    <div
                      onClick={handleDeselectAll}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleDeselectAll();
                        }
                      }}
                    >
                      Deselect All
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Roles List */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {selectedCategory === "all"
                    ? "All Roles"
                    : categories.find((c) => c.id === selectedCategory)?.name}
                  ({filteredRoles.length})
                </CardTitle>
                {totalPages > 1 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredRoles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="mx-auto h-8 w-8 mb-2" />
                  <p>No roles found</p>
                  <p className="text-sm">
                    Try adjusting your search or category filter
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {paginatedRoles.map((role) => {
                      const isSelected = selectedRoles.includes(role.id);
                      const parentRole = role.parent
                        ? allRoles.find((r) => r.id === role.parent)
                        : null;

                      return (
                        <div
                          key={role.id}
                          className={cn(
                            "flex items-center space-x-3 p-3 rounded-lg border transition-colors hover:bg-gray-50",
                            isSelected && "bg-blue-50 border-blue-200",
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleRoleToggle(role.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900">
                                {role.name}
                              </p>
                              {role.isCore && (
                                <Badge variant="secondary" className="text-xs">
                                  Core
                                </Badge>
                              )}
                              {parentRole && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <ArrowRight className="h-3 w-3 mx-1" />
                                  {parentRole.name}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {role.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredRoles.length,
                        )}{" "}
                        of {filteredRoles.length} roles
                      </div>
                      <div className="flex space-x-1">
                        <div
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          className={cn(
                            "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3",
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          )}
                          role="button"
                          tabIndex={currentPage === 1 ? -1 : 0}
                          onKeyDown={(e) => {
                            if (currentPage > 1 && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault();
                              setCurrentPage((prev) => Math.max(1, prev - 1));
                            }
                          }}
                        >
                          Previous
                        </div>
                        <div
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1),
                            )
                          }
                          className={cn(
                            "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3",
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          )}
                          role="button"
                          tabIndex={currentPage === totalPages ? -1 : 0}
                          onKeyDown={(e) => {
                            if (currentPage < totalPages && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault();
                              setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                            }
                          }}
                        >
                          Next
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Roles Summary */}
      {selectedRoles.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Selected Roles ({selectedRoles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedRoles.map((roleId) => {
                const role = allRoles.find((r) => r.id === roleId);
                if (!role) return null;

                return (
                  <div
                    key={roleId}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                  >
                    {role.name}
                    <div
                      onClick={() => handleRoleToggle(roleId)}
                      className="ml-1 h-4 w-4 rounded-sm hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                      role="button"
                      tabIndex={0}
                      aria-label={`Remove ${role.name} role`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRoleToggle(roleId);
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Users;
