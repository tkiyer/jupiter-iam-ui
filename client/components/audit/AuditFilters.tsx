import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { AuditLog } from "@/hooks/useAuditLogs";

interface AuditFiltersProps {
  auditLogs: AuditLog[];
  onFilteredLogsChange: (logs: AuditLog[]) => void;
}

export const AuditFilters: React.FC<AuditFiltersProps> = ({
  auditLogs,
  onFilteredLogsChange,
}) => {
  const [filters, setFilters] = useState({
    userId: "",
    action: "",
    resource: "",
    result: "all",
    category: "all",
    risk: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const filtered = auditLogs.filter((log) => {
      if (
        filters.userId &&
        !log.userId.toLowerCase().includes(filters.userId.toLowerCase())
      )
        return false;
      if (
        filters.action &&
        !log.action.toLowerCase().includes(filters.action.toLowerCase())
      )
        return false;
      if (
        filters.resource &&
        !log.resource.toLowerCase().includes(filters.resource.toLowerCase())
      )
        return false;
      if (
        filters.result &&
        filters.result !== "all" &&
        log.result !== filters.result
      )
        return false;
      if (
        filters.category &&
        filters.category !== "all" &&
        log.category !== filters.category
      )
        return false;
      if (filters.risk && filters.risk !== "all" && log.risk !== filters.risk)
        return false;
      if (
        searchTerm &&
        !log.userName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.action.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.resource.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });

    onFilteredLogsChange(filtered);
  }, [auditLogs, filters, searchTerm, onFilteredLogsChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters & Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by user, action, or resource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <Label>User ID</Label>
            <Input
              placeholder="Filter by user"
              value={filters.userId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, userId: e.target.value }))
              }
            />
          </div>

          <div>
            <Label>Result</Label>
            <Select
              value={filters.result}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, result: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All results</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="authentication">Authentication</SelectItem>
                <SelectItem value="authorization">Authorization</SelectItem>
                <SelectItem value="data_access">Data Access</SelectItem>
                <SelectItem value="configuration">Configuration</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Risk Level</Label>
            <Select
              value={filters.risk}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, risk: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Action</Label>
            <Input
              placeholder="Filter by action"
              value={filters.action}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, action: e.target.value }))
              }
            />
          </div>

          <div>
            <Label>Resource</Label>
            <Input
              placeholder="Filter by resource"
              value={filters.resource}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, resource: e.target.value }))
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
