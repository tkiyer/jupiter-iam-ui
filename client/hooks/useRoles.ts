import { useState, useEffect } from "react";
import { Role, CreateRoleRequest, RoleAnalytics } from "@shared/iam";

export interface UseRolesReturn {
  roles: Role[];
  analytics: Record<string, RoleAnalytics>;
  isLoading: boolean;
  error: string | null;
  createRole: (roleData: CreateRoleRequest) => Promise<void>;
  updateRole: (role: Role) => Promise<void>;
  deleteRole: (roleId: string) => Promise<void>;
  refreshRoles: () => Promise<void>;
}

export const useRoles = (): UseRolesReturn => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, RoleAnalytics>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/roles");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch roles");
      }
      
      setRoles(data.roles || data);

      // Fetch analytics for each role
      if (data.roles) {
        const analyticsPromises = data.roles.map((role: Role) =>
          fetch(`/api/roles/${role.id}/analytics`).then((r) => r.json()),
        );
        const analyticsResults = await Promise.all(analyticsPromises);
        const analyticsMap = data.roles.reduce(
          (acc: Record<string, RoleAnalytics>, role: Role, index: number) => {
            acc[role.id] = analyticsResults[index];
            return acc;
          },
          {},
        );
        setAnalytics(analyticsMap);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching roles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createRole = async (roleData: CreateRoleRequest) => {
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create role");
      }

      const newRole = await response.json();
      setRoles((prev) => [...prev, newRole]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create role");
      throw err;
    }
  };

  const updateRole = async (role: Role) => {
    try {
      const response = await fetch(`/api/roles/${role.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(role),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update role");
      }

      const updatedRole = await response.json();
      setRoles((prev) =>
        prev.map((r) => (r.id === updatedRole.id ? updatedRole : r)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
      throw err;
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete role");
      }

      setRoles((prev) => prev.filter((r) => r.id !== roleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete role");
      throw err;
    }
  };

  const refreshRoles = () => fetchRoles();

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    analytics,
    isLoading,
    error,
    createRole,
    updateRole,
    deleteRole,
    refreshRoles,
  };
};
