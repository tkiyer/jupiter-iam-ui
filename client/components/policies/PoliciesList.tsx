import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Edit,
  Copy,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ABACPolicy } from "@shared/iam";
import {
  PaginationControl,
  usePagination,
} from "@/components/ui/pagination-control";

interface PoliciesListProps {
  policies: ABACPolicy[];
  onEditPolicy: (policy: ABACPolicy) => void;
}

export const PoliciesList: React.FC<PoliciesListProps> = ({
  policies,
  onEditPolicy,
}) => {
  const [filteredPolicies, setFilteredPolicies] = useState<ABACPolicy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [effectFilter, setEffectFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Pagination state
  const {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredPolicies.length, 10);

  // Paginated policies for display
  const paginatedPolicies = filteredPolicies.slice(startIndex, endIndex);

  useEffect(() => {
    filterPolicies();
  }, [policies, searchTerm, statusFilter, effectFilter, priorityFilter]);

  const filterPolicies = () => {
    let filtered = policies;

    if (searchTerm) {
      filtered = filtered.filter(
        (policy) =>
          policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          policy.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((policy) => policy.status === statusFilter);
    }

    if (effectFilter !== "all") {
      filtered = filtered.filter((policy) => policy.effect === effectFilter);
    }

    if (priorityFilter !== "all") {
      const priority = parseInt(priorityFilter);
      filtered = filtered.filter((policy) =>
        priorityFilter === "high"
          ? policy.priority >= 150
          : priorityFilter === "medium"
            ? policy.priority >= 100 && policy.priority < 150
            : priorityFilter === "low"
              ? policy.priority < 100
              : true,
      );
    }

    setFilteredPolicies(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEffectColor = (effect: string) => {
    switch (effect) {
      case "allow":
        return "bg-green-100 text-green-800";
      case "deny":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 150)
      return { label: "High", color: "bg-red-100 text-red-800" };
    if (priority >= 100)
      return { label: "Medium", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Low", color: "bg-blue-100 text-blue-800" };
  };

  return (
    <>
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search policies by name or description..."
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
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={effectFilter} onValueChange={setEffectFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Effect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Effects</SelectItem>
                  <SelectItem value="allow">Allow</SelectItem>
                  <SelectItem value="deny">Deny</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Policies ({filteredPolicies.length})</span>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy</TableHead>
                <TableHead>Effect</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rules</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {policy.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {policy.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "flex items-center gap-1 w-fit",
                        getEffectColor(policy.effect),
                      )}
                    >
                      {policy.effect === "allow" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {policy.effect}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={getPriorityBadge(policy.priority).color}
                      >
                        {getPriorityBadge(policy.priority).label}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        ({policy.priority})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "flex items-center gap-1 w-fit",
                        getStatusColor(policy.status),
                      )}
                    >
                      {policy.status === "active" && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      {policy.status === "inactive" && (
                        <XCircle className="h-3 w-3" />
                      )}
                      {policy.status === "draft" && (
                        <Clock className="h-3 w-3" />
                      )}
                      {policy.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {policy.rules.length} rule
                      {policy.rules.length !== 1 ? "s" : ""}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {new Date(policy.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditPolicy(policy)}
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
              totalItems={filteredPolicies.length}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};
