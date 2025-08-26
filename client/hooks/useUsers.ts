import { useState, useEffect } from "react";
import { User, CreateUserRequest } from "@shared/iam";

export interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  createUser: (userData: CreateUserRequest) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/users");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users || data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (userData: CreateUserRequest) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      const newUser = await response.json();
      setUsers((prev) => [...prev, newUser]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
      throw err;
    }
  };

  const updateUser = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      const updatedUser = await response.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
      throw err;
    }
  };

  const refreshUsers = () => fetchUsers();

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers,
  };
};
