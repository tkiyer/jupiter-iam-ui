import { useState, useEffect } from "react";
import { Permission } from "@shared/iam";

export interface UsePermissionsReturn {
  permissions: Permission[];
  isLoading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
}

export const usePermissions = (): UsePermissionsReturn => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching permissions:", err);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPermissions = () => fetchPermissions();

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    permissions,
    isLoading,
    error,
    refreshPermissions,
  };
};
