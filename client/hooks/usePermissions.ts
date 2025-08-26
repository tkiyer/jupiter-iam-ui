import { useState, useEffect } from "react";
import { Permission, PermissionAnalytics } from "@shared/iam";

export interface UsePermissionsReturn {
  permissions: Permission[];
  analytics: Record<string, PermissionAnalytics>;
  isLoading: boolean;
  error: string | null;
  createPermission: (permissionData: any) => Promise<void>;
  updatePermission: (permission: Permission) => Promise<void>;
  deletePermission: (permissionId: string) => Promise<void>;
  refreshPermissions: () => Promise<void>;
}

export const usePermissions = (): UsePermissionsReturn => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [analytics, setAnalytics] = useState<
    Record<string, PermissionAnalytics>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/permissions");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch permissions");
      }

      setPermissions(data.permissions || data || []);

      // Fetch analytics for each permission
      if (data.permissions) {
        const analyticsPromises = data.permissions.map(
          (permission: Permission) =>
            fetch(`/api/permissions/${permission.id}/analytics`).then((r) =>
              r.json(),
            ),
        );
        const analyticsResults = await Promise.all(analyticsPromises);
        const analyticsMap = data.permissions.reduce(
          (
            acc: Record<string, PermissionAnalytics>,
            permission: Permission,
            index: number,
          ) => {
            acc[permission.id] = analyticsResults[index];
            return acc;
          },
          {},
        );
        setAnalytics(analyticsMap);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching permissions:", err);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createPermission = async (permissionData: any) => {
    try {
      const response = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create permission");
      }

      const newPermission = await response.json();
      setPermissions((prev) => [...prev, newPermission]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create permission",
      );
      throw err;
    }
  };

  const updatePermission = async (permission: Permission) => {
    try {
      const response = await fetch(`/api/permissions/${permission.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permission),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update permission");
      }

      const updatedPermission = await response.json();
      setPermissions((prev) =>
        prev.map((p) =>
          p.id === updatedPermission.id ? updatedPermission : p,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update permission",
      );
      throw err;
    }
  };

  const deletePermission = async (permissionId: string) => {
    try {
      const response = await fetch(`/api/permissions/${permissionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete permission");
      }

      setPermissions((prev) => prev.filter((p) => p.id !== permissionId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete permission",
      );
      throw err;
    }
  };

  const refreshPermissions = () => fetchPermissions();

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    permissions,
    analytics,
    isLoading,
    error,
    createPermission,
    updatePermission,
    deletePermission,
    refreshPermissions,
  };
};
