import { useState, useEffect } from "react";
import { ABACPolicy } from "@shared/iam";

export interface UsePoliciesReturn {
  policies: ABACPolicy[];
  isLoading: boolean;
  error: string | null;
  createPolicy: (policyData: any) => Promise<void>;
  updatePolicy: (policy: ABACPolicy) => Promise<void>;
  deletePolicy: (policyId: string) => Promise<void>;
  testPolicy: (testData: any) => Promise<any>;
  refreshPolicies: () => Promise<void>;
}

export const usePolicies = (): UsePoliciesReturn => {
  const [policies, setPolicies] = useState<ABACPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/policies");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch policies");
      }

      setPolicies(data.policies || data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching policies:", err);

      // Mock data for demo
      const mockPolicies: ABACPolicy[] = [
        {
          id: "pol-1",
          name: "Executive Financial Access",
          description:
            "Allow executives to access financial data during business hours",
          rules: [
            {
              subject: [
                { attribute: "role", operator: "equals", value: "executive" },
                {
                  attribute: "department",
                  operator: "in",
                  value: ["finance", "executive"],
                },
              ],
              resource: [
                {
                  attribute: "type",
                  operator: "equals",
                  value: "financial_data",
                },
                {
                  attribute: "classification",
                  operator: "not_equals",
                  value: "top_secret",
                },
              ],
              action: ["read", "analyze"],
              environment: [
                { attribute: "time", operator: "greater_than", value: "09:00" },
                { attribute: "time", operator: "less_than", value: "17:00" },
                { attribute: "location", operator: "equals", value: "office" },
              ],
            },
          ],
          effect: "allow",
          priority: 100,
          status: "active",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "pol-2",
          name: "Emergency System Access",
          description:
            "Allow system administrators emergency access to all systems",
          rules: [
            {
              subject: [
                { attribute: "role", operator: "equals", value: "sysadmin" },
                {
                  attribute: "emergency_clearance",
                  operator: "equals",
                  value: true,
                },
              ],
              resource: [
                { attribute: "type", operator: "equals", value: "system" },
              ],
              action: ["read", "write", "execute", "admin"],
              environment: [
                {
                  attribute: "emergency_mode",
                  operator: "equals",
                  value: true,
                },
              ],
            },
          ],
          effect: "allow",
          priority: 200,
          status: "active",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: "pol-3",
          name: "Contractor Data Restriction",
          description:
            "Prevent contractors from accessing sensitive customer data",
          rules: [
            {
              subject: [
                {
                  attribute: "employment_type",
                  operator: "equals",
                  value: "contractor",
                },
              ],
              resource: [
                {
                  attribute: "data_classification",
                  operator: "in",
                  value: ["sensitive", "confidential"],
                },
                { attribute: "contains_pii", operator: "equals", value: true },
              ],
              action: ["read", "write", "download"],
            },
          ],
          effect: "deny",
          priority: 150,
          status: "active",
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ];
      setPolicies(mockPolicies);
    } finally {
      setIsLoading(false);
    }
  };

  const createPolicy = async (policyData: any) => {
    try {
      const response = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create policy");
      }

      const newPolicy = await response.json();
      setPolicies((prev) => [...prev, newPolicy]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create policy");
      throw err;
    }
  };

  const updatePolicy = async (policy: ABACPolicy) => {
    try {
      const response = await fetch(`/api/policies/${policy.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update policy");
      }

      const updatedPolicy = await response.json();
      setPolicies((prev) =>
        prev.map((p) => (p.id === updatedPolicy.id ? updatedPolicy : p)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update policy");
      throw err;
    }
  };

  const deletePolicy = async (policyId: string) => {
    try {
      const response = await fetch(`/api/policies/${policyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete policy");
      }

      setPolicies((prev) => prev.filter((p) => p.id !== policyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete policy");
      throw err;
    }
  };

  const testPolicy = async (testData: any) => {
    try {
      const response = await fetch("/api/policies/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to test policy");
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to test policy");
      throw err;
    }
  };

  const refreshPolicies = () => fetchPolicies();

  useEffect(() => {
    fetchPolicies();
  }, []);

  return {
    policies,
    isLoading,
    error,
    createPolicy,
    updatePolicy,
    deletePolicy,
    testPolicy,
    refreshPolicies,
  };
};
