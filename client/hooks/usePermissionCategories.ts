import { useState, useEffect } from "react";
import { PermissionCategory } from "@shared/iam";

export interface UsePermissionCategoriesReturn {
  categories: PermissionCategory[];
  isLoading: boolean;
  error: string | null;
  createCategory: (categoryData: any) => Promise<void>;
  updateCategory: (category: PermissionCategory) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
}

export const usePermissionCategories = (): UsePermissionCategoriesReturn => {
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/permissions/categories");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch categories");
      }

      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async (categoryData: any) => {
    try {
      const response = await fetch("/api/permissions/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create category");
      }

      const newCategory = await response.json();
      setCategories((prev) => [...prev, newCategory]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create category",
      );
      throw err;
    }
  };

  const updateCategory = async (category: PermissionCategory) => {
    try {
      const response = await fetch(
        `/api/permissions/categories/${category.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(category),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update category");
      }

      const updatedCategory = await response.json();
      setCategories((prev) =>
        prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update category",
      );
      throw err;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(
        `/api/permissions/categories/${categoryId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete category");
      }

      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category",
      );
      throw err;
    }
  };

  const refreshCategories = () => fetchCategories();

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
  };
};
