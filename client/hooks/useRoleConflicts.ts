import { useState, useEffect } from "react";
import { RoleConflict } from "@shared/iam";

export interface UseRoleConflictsReturn {
  conflicts: RoleConflict[];
  isLoading: boolean;
  error: string | null;
  resolveConflict: (conflictId: string) => Promise<void>;
  dismissConflict: (conflictId: string) => Promise<void>;
  refreshConflicts: () => Promise<void>;
}

export const useRoleConflicts = (): UseRoleConflictsReturn => {
  const [conflicts, setConflicts] = useState<RoleConflict[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConflicts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/roles/conflicts");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch conflicts");
      }

      setConflicts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching conflicts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveConflict = async (conflictId: string) => {
    try {
      const response = await fetch(
        `/api/roles/conflicts/${conflictId}/resolve`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to resolve conflict");
      }

      setConflicts((prev) =>
        prev.map((conflict) =>
          conflict.id === conflictId
            ? { ...conflict, resolved: true }
            : conflict,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resolve conflict",
      );
      throw err;
    }
  };

  const dismissConflict = async (conflictId: string) => {
    try {
      const response = await fetch(`/api/roles/conflicts/${conflictId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to dismiss conflict");
      }

      setConflicts((prev) => prev.filter((c) => c.id !== conflictId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to dismiss conflict",
      );
      throw err;
    }
  };

  const refreshConflicts = () => fetchConflicts();

  useEffect(() => {
    fetchConflicts();
  }, []);

  return {
    conflicts,
    isLoading,
    error,
    resolveConflict,
    dismissConflict,
    refreshConflicts,
  };
};
