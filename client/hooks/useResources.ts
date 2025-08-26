import { useState, useEffect } from "react";
import { Resource } from "@shared/iam";

export interface UseResourcesReturn {
  resources: Resource[];
  isLoading: boolean;
  error: string | null;
  createResource: (resourceData: any) => Promise<void>;
  updateResource: (resource: Resource) => Promise<void>;
  deleteResource: (resourceId: string) => Promise<void>;
  refreshResources: () => Promise<void>;
}

export const useResources = (): UseResourcesReturn => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/resources");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch resources");
      }

      setResources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching resources:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createResource = async (resourceData: any) => {
    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resourceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create resource");
      }

      const newResource = await response.json();
      setResources((prev) => [...prev, newResource]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create resource",
      );
      throw err;
    }
  };

  const updateResource = async (resource: Resource) => {
    try {
      const response = await fetch(`/api/resources/${resource.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resource),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update resource");
      }

      const updatedResource = await response.json();
      setResources((prev) =>
        prev.map((r) => (r.id === updatedResource.id ? updatedResource : r)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update resource",
      );
      throw err;
    }
  };

  const deleteResource = async (resourceId: string) => {
    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete resource");
      }

      setResources((prev) => prev.filter((r) => r.id !== resourceId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete resource",
      );
      throw err;
    }
  };

  const refreshResources = () => fetchResources();

  useEffect(() => {
    fetchResources();
  }, []);

  return {
    resources,
    isLoading,
    error,
    createResource,
    updateResource,
    deleteResource,
    refreshResources,
  };
};
