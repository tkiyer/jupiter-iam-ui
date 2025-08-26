import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Filter,
  Edit,
  Copy,
  Trash2,
  Key,
  Database,
  Globe,
  FileText,
  Code,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Permission } from "@shared/iam";
import { FilterBar } from "@/components/ui/FilterBar";
import { getRiskColor } from "@/lib/statusUtils";
import {
  PaginationControl,
  usePagination,
} from "@/components/ui/pagination-control";

interface PermissionsListProps {
  permissions: Permission[];
  onEditPermission: (permission: Permission) => void;
}

export const PermissionsList: React.FC<PermissionsListProps> = ({
  permissions,
  onEditPermission,
}) => {
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  // Pagination state
  const {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredPermissions.length, 10);

  // Paginated permissions for display
  const paginatedPermissions = filteredPermissions.slice(startIndex, endIndex);

  useEffect(() => {
    filterPermissions();
  }, [permissions, searchTerm, categoryFilter, scopeFilter, riskFilter]);

  const filterPermissions = () => {
    let filtered = permissions;

    if (searchTerm) {
      filtered = filtered.filter(
        (permission) =>
          permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          permission.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          permission.resource.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (permission) => permission.category === categoryFilter,
      );
    }

    if (scopeFilter !== "all") {
      filtered = filtered.filter(
        (permission) => permission.scope === scopeFilter,
      );
    }

    if (riskFilter !== "all") {
      filtered = filtered.filter(
        (permission) => permission.risk === riskFilter,
      );
    }

    setFilteredPermissions(filtered);
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case "global":
        return <Globe className="h-4 w-4 text-purple-600" />;
      case "resource":
        return <Database className="h-4 w-4 text-blue-600" />;
      case "field":
        return <FileText className="h-4 w-4 text-green-600" />;
      case "api":
        return <Code className="h-4 w-4 text-orange-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get unique categories for filter
  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  const filterConfigs = [
    {
      placeholder: "All Categories",
      options: [
        { label: "All Categories", value: "all" },
        ...categories.map((cat) => ({ label: cat, value: cat })),
      ],
      value: categoryFilter,
      onChange: setCategoryFilter,
      width: "w-40",
    },
    {
      placeholder: "Scope",
      options: [
        { label: "All Scopes", value: "all" },
        { label: "Global", value: "global" },
        { label: "Resource", value: "resource" },
        { label: "Field", value: "field" },
        { label: "API", value: "api" },
      ],
      value: scopeFilter,
      onChange: setScopeFilter,
      width: "w-32",
    },
    {
      placeholder: "Risk",
      options: [
        { label: "All Risk", value: "all" },
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
        { label: "Critical", value: "critical" },
      ],
      value: riskFilter,
      onChange: setRiskFilter,
      width: "w-32",
    },
  ];

  return (
    <>
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search permissions by name, resource, or description..."
            filters={filterConfigs}
          />
        </CardContent>
      </Card>

      {/* Permissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Permissions ({filteredPermissions.length})</span>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPermissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Key className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <span>{permission.name}</span>
                          {permission.isSystemPermission && (
                            <Badge variant="secondary" className="text-xs">
                              System
                            </Badge>
                          )}
                          {permission.canDelegate && (
                            <Badge variant="outline" className="text-xs">
                              Delegatable
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{permission.resource}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getScopeIcon(permission.scope)}
                      <span className="text-sm capitalize">
                        {permission.scope}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "flex items-center gap-1 w-fit",
                        getRiskColor(permission.risk),
                      )}
                    >
                      {permission.risk === "critical" && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {permission.risk === "high" && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {permission.risk === "medium" && (
                        <Clock className="h-3 w-3" />
                      )}
                      {permission.risk === "low" && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      {permission.risk}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{permission.usageCount || 0} uses</p>
                      <p className="text-gray-500">
                        {permission.lastUsed
                          ? new Date(permission.lastUsed).toLocaleDateString()
                          : "Never"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {permission.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditPermission(permission)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
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
              totalItems={filteredPermissions.length}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};
