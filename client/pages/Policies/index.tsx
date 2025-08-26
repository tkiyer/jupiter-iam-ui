import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Download, Plus, TestTube } from "lucide-react";

import { usePolicies } from "@/hooks/usePolicies";
import { PoliciesList } from "@/components/policies/PoliciesList";
import { PolicyBuilder } from "@/components/policy-builder/PolicyBuilder";
import { PolicySimulation } from "@/components/policies/PolicySimulation";
import { PolicyConflicts } from "@/components/policies/PolicyConflicts";
import { PolicyMonitoring } from "@/components/policies/PolicyMonitoring";
import { CreatePolicyDialog } from "@/components/policies/CreatePolicyDialog";
import { EditPolicyDialog } from "@/components/policies/EditPolicyDialog";
import { PolicyTestDialog } from "@/components/policies/PolicyTestDialog";

const Policies: React.FC = () => {
  const [activeTab, setActiveTab] = useState("policies");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);

  // Policy simulation state
  const [simulationRequest, setSimulationRequest] = useState({
    subject: "",
    resource: "",
    action: "",
    environment: {},
  });
  const [simulationResult, setSimulationResult] = useState(null);

  const { policies, isLoading, createPolicy, updatePolicy } = usePolicies();

  const handleCreatePolicy = async (policyData) => {
    await createPolicy(policyData);
    setIsCreateDialogOpen(false);
  };

  const handleEditPolicy = (policy) => {
    setSelectedPolicy(policy);
    setIsEditDialogOpen(true);
  };

  const handleSavePolicy = async (updatedPolicy) => {
    await updatePolicy(updatedPolicy);
    setIsEditDialogOpen(false);
    setSelectedPolicy(null);
  };

  const handleTestPolicy = async () => {
    try {
      const response = await fetch("/api/policies/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(simulationRequest),
      });
      const result = await response.json();
      setSimulationResult(result);
    } catch (error) {
      console.error("Error testing policy:", error);
      // Mock result for demo
      setSimulationResult({
        decision: "allow",
        appliedPolicies: ["pol-1"],
        evaluationTime: "2.3ms",
        explanation:
          "Access granted based on executive role and business hours condition",
        details: {
          subjectAttributes: { role: "executive", department: "finance" },
          resourceAttributes: {
            type: "financial_data",
            classification: "confidential",
          },
          environmentAttributes: { time: "14:30", location: "office" },
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ABAC Policy Management
          </h1>
          <p className="text-gray-600 mt-1">
            Attribute-based access control with dynamic policy evaluation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTestDialogOpen(true)}
          >
            <TestTube className="mr-2 h-4 w-4" />
            Test Policies
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Policy
              </Button>
            </DialogTrigger>
            <CreatePolicyDialog onCreatePolicy={handleCreatePolicy} />
          </Dialog>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="builder">Policy Builder</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          <PoliciesList policies={policies} onEditPolicy={handleEditPolicy} />
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <PolicyBuilder />
        </TabsContent>

        <TabsContent value="simulation" className="space-y-6">
          <PolicySimulation
            simulationRequest={simulationRequest}
            setSimulationRequest={setSimulationRequest}
            simulationResult={simulationResult}
            onRunSimulation={handleTestPolicy}
          />
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-6">
          <PolicyConflicts policies={policies} />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <PolicyMonitoring policies={policies} />
        </TabsContent>
      </Tabs>

      {/* Edit Policy Dialog */}
      {selectedPolicy && (
        <EditPolicyDialog
          policy={selectedPolicy}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSavePolicy}
        />
      )}

      {/* Test Policy Dialog */}
      <PolicyTestDialog
        isOpen={isTestDialogOpen}
        onOpenChange={setIsTestDialogOpen}
        simulationRequest={simulationRequest}
        setSimulationRequest={setSimulationRequest}
        simulationResult={simulationResult}
        onRunTest={handleTestPolicy}
      />
    </div>
  );
};

export default Policies;
