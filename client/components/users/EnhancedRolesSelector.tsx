import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Star,
  Code,
  TrendingUp,
  Target,
  Building,
  Users,
  Shield,
  Settings,
  UserCheck,
  Crown,
  Eye,
  Copy,
  Layers,
  CheckCircle,
  X,
  Plus,
} from "lucide-react";

// Enhanced Roles Selector Component for handling hundreds of roles
interface EnhancedRolesSelectorProps {
  selectedRoles: string[];
  onRolesChange: (roles: string[]) => void;
  variant?: "create" | "edit";
}

export const EnhancedRolesSelector: React.FC<EnhancedRolesSelectorProps> = ({
  selectedRoles,
  onRolesChange,
  variant = "create",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showSelected, setShowSelected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Mock roles data - in real implementation, this would come from API
  const allRoles = [
    // Common roles
    { id: "admin", name: "Administrator", description: "Full system access", category: "common", isCore: true },
    { id: "manager", name: "Manager", description: "Team management access", category: "common", isCore: true },
    { id: "user", name: "User", description: "Standard user access", category: "common", isCore: true },
    { id: "auditor", name: "Auditor", description: "Audit and compliance access", category: "common", isCore: true },

    // Engineering roles
    { id: "eng_lead", name: "Engineering Lead", description: "Lead engineering teams", category: "engineering" },
    { id: "senior_dev", name: "Senior Developer", description: "Senior development role", category: "engineering" },
    { id: "junior_dev", name: "Junior Developer", description: "Junior development role", category: "engineering" },
    { id: "devops", name: "DevOps Engineer", description: "Infrastructure and deployment", category: "engineering" },

    // Sales roles
    { id: "sales_dir", name: "Sales Director", description: "Sales team management", category: "sales" },
    { id: "account_exec", name: "Account Executive", description: "Client account management", category: "sales" },
    { id: "sales_rep", name: "Sales Representative", description: "Direct sales activities", category: "sales" },

    // More roles would be here in a real application...
  ];

  const categories = [
    { id: "all", name: "All Roles", icon: Layers, count: allRoles.length },
    { id: "common", name: "Common Roles", icon: Star, count: allRoles.filter((r) => r.isCore).length },
    { id: "engineering", name: "Engineering", icon: Code, count: allRoles.filter((r) => r.category === "engineering").length },
    { id: "sales", name: "Sales", icon: TrendingUp, count: allRoles.filter((r) => r.category === "sales").length },
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

  const handleClearAll = () => {
    onRolesChange([]);
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700"
            >
              <X className="mr-1 h-3 w-3" />
              Clear All
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSelected(!showSelected)}
            className={showSelected ? "bg-blue-50 text-blue-700" : ""}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {showSelected ? "Show All" : "Show Selected Only"}
          </Button>
        </div>
      </div>

      {/* Common Roles Quick Access */}
      {variant === "create" && !showSelected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Star className="mr-2 h-5 w-5 text-yellow-500" />
              Quick Select Common Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {commonRolesSuggestions.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRoleToggle(role.id)}
                >
                  <Checkbox checked={selectedRoles.includes(role.id)} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{role.name}</p>
                    <p className="text-xs text-gray-500">{role.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search roles..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center">
                          <IconComponent className="mr-2 h-4 w-4" />
                          {category.name} ({category.count})
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {filteredRoles.length > 0 && (
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredRoles.length)} of{" "}
                  {filteredRoles.length} roles
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All Visible
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Roles List */}
      <Card>
        <CardContent className="p-4">
          {filteredRoles.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or category filter.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {paginatedRoles.map((role) => (
                <div
                  key={role.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedRoles.includes(role.id) ? "bg-blue-50 border-blue-200" : ""
                  }`}
                  onClick={() => handleRoleToggle(role.id)}
                >
                  <Checkbox checked={selectedRoles.includes(role.id)} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">{role.name}</p>
                      {role.isCore && (
                        <Badge variant="secondary" className="text-xs">
                          Core
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{role.description}</p>
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {role.category}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Roles Summary */}
      {selectedRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Roles ({selectedRoles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedRoles.map((roleId) => {
                const role = allRoles.find((r) => r.id === roleId);
                return role ? (
                  <Badge
                    key={roleId}
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>{role.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleToggle(roleId);
                      }}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
