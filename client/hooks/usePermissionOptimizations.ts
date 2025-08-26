import { useState, useEffect } from "react";
import { PermissionOptimization } from "@shared/iam";

export interface UsePermissionOptimizationsReturn {
  optimizations: PermissionOptimization[];
  isLoading: boolean;
  error: string | null;
  applyOptimization: (optimizationId: string) => Promise<void>;
  dismissOptimization: (optimizationId: string) => Promise<void>;
  refreshOptimizations: () => Promise<void>;
}

export const usePermissionOptimizations =
  (): UsePermissionOptimizationsReturn => {
    const [optimizations, setOptimizations] = useState<
      PermissionOptimization[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOptimizations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/permissions/optimizations");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch optimizations");
        }

        setOptimizations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching optimizations:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const applyOptimization = async (optimizationId: string) => {
      try {
        const response = await fetch(
          `/api/permissions/optimizations/${optimizationId}/apply`,
          {
            method: "POST",
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to apply optimization");
        }

        setOptimizations((prev) => prev.filter((o) => o.id !== optimizationId));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to apply optimization",
        );
        throw err;
      }
    };

    const dismissOptimization = async (optimizationId: string) => {
      try {
        const response = await fetch(
          `/api/permissions/optimizations/${optimizationId}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to dismiss optimization");
        }

        setOptimizations((prev) => prev.filter((o) => o.id !== optimizationId));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to dismiss optimization",
        );
        throw err;
      }
    };

    const refreshOptimizations = () => fetchOptimizations();

    useEffect(() => {
      fetchOptimizations();
    }, []);

    return {
      optimizations,
      isLoading,
      error,
      applyOptimization,
      dismissOptimization,
      refreshOptimizations,
    };
  };
