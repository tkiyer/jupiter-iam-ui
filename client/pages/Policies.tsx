import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ABACPolicy,
  PolicyRule,
  AttributeCondition,
  User,
  Resource,
} from "@shared/iam";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  MoreHorizontal,
  Shield,
  Clock,
  Users,
  AlertTriangle,
  TrendingUp,
  Eye,
  Copy,
  Settings,
  Play,
  Pause,
  RotateCcw,
  GitBranch,
  TestTube,
  Activity,
  BarChart3,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  FileText,
  Cpu,
  RefreshCw,
  Database,
  Globe,
  Code,
  Layers,
  ArrowRight,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  Monitor,
  Wrench,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PolicyBuilder } from "@/components/policy-builder/PolicyBuilder";
import {
  PaginationControl,
  usePagination,
} from "@/components/ui/pagination-control";

const Policies: React.FC = () => {
  const [policies, setPolicies] = useState<ABACPolicy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<ABACPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [effectFilter, setEffectFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<ABACPolicy | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("policies");

  // Policy simulation state
  const [simulationRequest, setSimulationRequest] = useState({
    subject: "",
    resource: "",
    action: "",
    environment: {},
  });
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Pagination state
  const {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredPolicies.length, 10);

  // Paginated policies for display
  const paginatedPolicies = filteredPolicies.slice(startIndex, endIndex);

  useEffect(() => {
    fetchPolicies();
  }, []);

  useEffect(() => {
    filterPolicies();
  }, [policies, searchTerm, statusFilter, effectFilter, priorityFilter]);

  const fetchPolicies = async () => {
    try {
      const response = await fetch("/api/policies");
      const data = await response.json();
      setPolicies(data.policies || data || []);
    } catch (error) {
      console.error("Error fetching policies:", error);
      // Mock data for demo
      setPolicies([
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
          createdAt: "2024-01-01T00:00:00Z",
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
          createdAt: "2024-01-02T00:00:00Z",
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
          createdAt: "2024-01-03T00:00:00Z",
        },
        {
          id: "pol-4",
          name: "Development Environment Access",
          description: "Allow developers access to development resources",
          rules: [
            {
              subject: [
                {
                  attribute: "department",
                  operator: "equals",
                  value: "engineering",
                },
                {
                  attribute: "project_member",
                  operator: "equals",
                  value: true,
                },
              ],
              resource: [
                {
                  attribute: "environment",
                  operator: "equals",
                  value: "development",
                },
                {
                  attribute: "project_id",
                  operator: "equals",
                  value: "${subject.current_project}",
                },
              ],
              action: ["read", "write", "deploy"],
              environment: [
                { attribute: "network", operator: "equals", value: "internal" },
              ],
            },
          ],
          effect: "allow",
          priority: 50,
          status: "inactive",
          createdAt: "2024-01-04T00:00:00Z",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPolicies = () => {
    let filtered = policies;

    if (searchTerm) {
      filtered = filtered.filter(
        (policy) =>
          policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          policy.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((policy) => policy.status === statusFilter);
    }

    if (effectFilter !== "all") {
      filtered = filtered.filter((policy) => policy.effect === effectFilter);
    }

    if (priorityFilter !== "all") {
      const priority = parseInt(priorityFilter);
      filtered = filtered.filter((policy) =>
        priorityFilter === "high"
          ? policy.priority >= 150
          : priorityFilter === "medium"
            ? policy.priority >= 100 && policy.priority < 150
            : priorityFilter === "low"
              ? policy.priority < 100
              : true,
      );
    }

    setFilteredPolicies(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEffectColor = (effect: string) => {
    switch (effect) {
      case "allow":
        return "bg-green-100 text-green-800";
      case "deny":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 150)
      return { label: "High", color: "bg-red-100 text-red-800" };
    if (priority >= 100)
      return { label: "Medium", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Low", color: "bg-blue-100 text-blue-800" };
  };

  const handleCreatePolicy = async (policyData: any) => {
    try {
      const response = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policyData),
      });

      if (response.ok) {
        const newPolicy = await response.json();
        setPolicies((prev) => [...prev, newPolicy]);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating policy:", error);
    }
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
      // Mock result
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

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search policies by name or description..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={effectFilter} onValueChange={setEffectFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Effect" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Effects</SelectItem>
                      <SelectItem value="allow">Allow</SelectItem>
                      <SelectItem value="deny">Deny</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={priorityFilter}
                    onValueChange={setPriorityFilter}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policies Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Policies ({filteredPolicies.length})</span>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Effect</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rules</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {policy.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {policy.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "flex items-center gap-1 w-fit",
                            getEffectColor(policy.effect),
                          )}
                        >
                          {policy.effect === "allow" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {policy.effect}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={getPriorityBadge(policy.priority).color}
                          >
                            {getPriorityBadge(policy.priority).label}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            ({policy.priority})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "flex items-center gap-1 w-fit",
                            getStatusColor(policy.status),
                          )}
                        >
                          {policy.status === "active" && (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          {policy.status === "inactive" && (
                            <XCircle className="h-3 w-3" />
                          )}
                          {policy.status === "draft" && (
                            <Clock className="h-3 w-3" />
                          )}
                          {policy.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {policy.rules.length} rule
                          {policy.rules.length !== 1 ? "s" : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {new Date(policy.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPolicy(policy);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Control */}
              <div className="mt-4">
                <PaginationControl
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredPolicies.length}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policy Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <PolicyBuilder />
        </TabsContent>

        {/* Simulation Tab */}
        <TabsContent value="simulation" className="space-y-6">
          <PolicySimulationView
            simulationRequest={simulationRequest}
            setSimulationRequest={setSimulationRequest}
            simulationResult={simulationResult}
            onRunSimulation={handleTestPolicy}
          />
        </TabsContent>

        {/* Conflicts Tab */}
        <TabsContent value="conflicts" className="space-y-6">
          <PolicyConflictsView policies={filteredPolicies} />
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <PolicyMonitoringView policies={filteredPolicies} />
        </TabsContent>
      </Tabs>

      {/* Edit Policy Dialog */}
      {selectedPolicy && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <EditPolicyDialog
            policy={selectedPolicy}
            onSave={(updatedPolicy) => {
              setPolicies((prev) =>
                prev.map((p) =>
                  p.id === updatedPolicy.id ? updatedPolicy : p,
                ),
              );
              setIsEditDialogOpen(false);
            }}
          />
        </Dialog>
      )}

      {/* Test Policy Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <PolicyTestDialog
          simulationRequest={simulationRequest}
          setSimulationRequest={setSimulationRequest}
          simulationResult={simulationResult}
          onRunTest={handleTestPolicy}
        />
      </Dialog>
    </div>
  );
};

// Create Policy Dialog Component
const CreatePolicyDialog: React.FC<{
  onCreatePolicy: (policy: any) => void;
}> = ({ onCreatePolicy }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    effect: "allow" as "allow" | "deny",
    priority: 100,
    status: "draft" as "active" | "inactive" | "draft",
    rules: [] as PolicyRule[],
    tags: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Policy name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.priority < 1 || formData.priority > 1000) {
      newErrors.priority = "Priority must be between 1 and 1000";
    }
    if (formData.rules.length === 0) {
      newErrors.rules = "At least one rule is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onCreatePolicy({
        ...formData,
        id: `pol-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      // Reset form on success
      setFormData({
        name: "",
        description: "",
        effect: "allow",
        priority: 100,
        status: "draft",
        rules: [],
        tags: [],
      });
      setErrors({});
    } catch (error) {
      console.error("Error creating policy:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addRule = () => {
    const newRule: PolicyRule = {
      subject: [],
      resource: [],
      action: [],
      environment: [],
    };
    setFormData((prev) => ({ ...prev, rules: [...prev.rules, newRule] }));
  };

  const updateRule = (index: number, rule: PolicyRule) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.map((r, i) => (i === index ? rule : r)),
    }));
  };

  const removeRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  return (
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New ABAC Policy</DialogTitle>
        <DialogDescription>
          Define comprehensive attribute-based access control rules
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="rules">Rules ({formData.rules.length})</TabsTrigger>
            <TabsTrigger value="conditions">Advanced</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Policy Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="e.g., Executive Financial Access"
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label>Policy Effect *</Label>
                <Select
                  value={formData.effect}
                  onValueChange={(value: "allow" | "deny") =>
                    setFormData((prev) => ({ ...prev, effect: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allow">
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Allow Access
                      </div>
                    </SelectItem>
                    <SelectItem value="deny">
                      <div className="flex items-center">
                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                        Deny Access
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={errors.description ? "border-red-500" : ""}
                placeholder="Describe what this policy controls and when it applies"
                rows={3}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: parseInt(e.target.value) || 100,
                    }))
                  }
                  className={errors.priority ? "border-red-500" : ""}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher numbers = higher priority (1-1000)
                </p>
                {errors.priority && <p className="text-sm text-red-500 mt-1">{errors.priority}</p>}
              </div>
              <div>
                <Label>Initial Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive" | "draft") =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                        Draft
                      </div>
                    </SelectItem>
                    <SelectItem value="active">
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center">
                        <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Tags (Optional)</Label>
              <Input
                placeholder="Enter tags separated by commas (e.g., finance, executive, sensitive)"
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                  setFormData((prev) => ({ ...prev, tags }));
                }}
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-lg font-medium">Policy Rules</Label>
                <p className="text-sm text-gray-500">
                  Define who can access what under which conditions
                </p>
              </div>
              <Button type="button" onClick={addRule} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Rule
              </Button>
            </div>

            {errors.rules && <p className="text-sm text-red-500">{errors.rules}</p>}

            {formData.rules.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No rules defined</h3>
                  <p className="text-gray-500 mb-4 text-center">
                    Add at least one rule to define access conditions
                  </p>
                  <Button type="button" onClick={addRule}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Rule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {formData.rules.map((rule, index) => (
                  <RuleEditor
                    key={index}
                    rule={rule}
                    index={index}
                    onChange={(updatedRule) => updateRule(index, updatedRule)}
                    onRemove={() => removeRule(index)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="conditions" className="space-y-4">
            <div className="text-center py-12">
              <Wrench className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Conditions</h3>
              <p className="text-gray-500 mb-4">
                Advanced condition builders and dynamic attributes coming soon
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Time-based conditions</p>
                <p>• Location-based restrictions</p>
                <p>• Dynamic attribute evaluation</p>
                <p>• Custom condition expressions</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <PolicyValidationView
              policy={formData}
              onValidate={() => validateForm()}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Policy
              </>
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Edit Policy Dialog Component
const EditPolicyDialog: React.FC<{
  policy: ABACPolicy;
  onSave: (policy: ABACPolicy) => void;
}> = ({ policy, onSave }) => {
  const [formData, setFormData] = useState<ABACPolicy>({
    ...policy,
    tags: (policy as any).tags || [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Track changes
  useEffect(() => {
    setHasChanges(JSON.stringify(formData) !== JSON.stringify(policy));
  }, [formData, policy]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Policy name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.priority < 1 || formData.priority > 1000) {
      newErrors.priority = "Priority must be between 1 and 1000";
    }
    if (formData.rules.length === 0) {
      newErrors.rules = "At least one rule is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      setErrors({});
    } catch (error) {
      console.error("Error updating policy:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addRule = () => {
    const newRule: PolicyRule = {
      subject: [],
      resource: [],
      action: [],
      environment: [],
    };
    setFormData((prev) => ({ ...prev, rules: [...prev.rules, newRule] }));
  };

  const updateRule = (index: number, rule: PolicyRule) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.map((r, i) => (i === index ? rule : r)),
    }));
  };

  const removeRule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const duplicatePolicy = () => {
    const duplicatedPolicy = {
      ...formData,
      id: `pol-${Date.now()}`,
      name: `${formData.name} (Copy)`,
      status: "draft" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(duplicatedPolicy);
  };

  return (
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="flex items-center">
              Edit Policy: {policy.name}
              {hasChanges && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Unsaved Changes
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Update policy configuration, rules, and validation settings
            </DialogDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={duplicatePolicy}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="rules">Rules ({formData.rules.length})</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editName">Policy Name *</Label>
                <Input
                  id="editName"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive" | "draft") =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                        Draft
                      </div>
                    </SelectItem>
                    <SelectItem value="active">
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center">
                        <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="editDescription">Description *</Label>
              <Textarea
                id="editDescription"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className={errors.description ? "border-red-500" : ""}
                rows={3}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Policy Effect *</Label>
                <Select
                  value={formData.effect}
                  onValueChange={(value: "allow" | "deny") =>
                    setFormData((prev) => ({ ...prev, effect: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allow">
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Allow Access
                      </div>
                    </SelectItem>
                    <SelectItem value="deny">
                      <div className="flex items-center">
                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                        Deny Access
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editPriority">Priority *</Label>
                <Input
                  id="editPriority"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: parseInt(e.target.value) || 100,
                    }))
                  }
                  className={errors.priority ? "border-red-500" : ""}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher numbers = higher priority (1-1000)
                </p>
                {errors.priority && <p className="text-sm text-red-500 mt-1">{errors.priority}</p>}
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <Input
                placeholder="Enter tags separated by commas"
                value={(formData as any).tags?.join(', ') || ''}
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                  setFormData((prev) => ({ ...prev, tags } as any));
                }}
              />
              {(formData as any).tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(formData as any).tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Policy Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Created</p>
                  <p>{new Date(policy.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Last Modified</p>
                  <p>{formData.updatedAt ? new Date(formData.updatedAt).toLocaleString() : 'Never'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Policy ID</p>
                  <p className="font-mono text-xs">{policy.id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Rules Count</p>
                  <p>{formData.rules.length} rule{formData.rules.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-lg font-medium">Policy Rules</Label>
                <p className="text-sm text-gray-500">
                  Define access conditions for subjects, resources, and environment
                </p>
              </div>
              <Button type="button" onClick={addRule} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Rule
              </Button>
            </div>

            {errors.rules && <p className="text-sm text-red-500">{errors.rules}</p>}

            {formData.rules.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No rules defined</h3>
                  <p className="text-gray-500 mb-4 text-center">
                    Add rules to define access conditions for this policy
                  </p>
                  <Button type="button" onClick={addRule}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Rule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {formData.rules.map((rule, index) => (
                  <RuleEditor
                    key={index}
                    rule={rule}
                    index={index}
                    onChange={(updatedRule) => updateRule(index, updatedRule)}
                    onRemove={() => removeRule(index)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="testing" className="space-y-4">
            <PolicyTestingView policy={formData} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <PolicyHistoryView policy={policy} />
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <PolicyValidationView
              policy={formData}
              onValidate={() => validateForm()}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <div className="flex items-center text-sm text-orange-600">
                <AlertTriangle className="mr-1 h-4 w-4" />
                You have unsaved changes
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || !hasChanges}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </DialogContent>
  );
};

// Policy Simulation View Component
const PolicySimulationView: React.FC<{
  simulationRequest: any;
  setSimulationRequest: (req: any) => void;
  simulationResult: any;
  onRunSimulation: () => void;
}> = ({
  simulationRequest,
  setSimulationRequest,
  simulationResult,
  onRunSimulation,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulation Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FlaskConical className="mr-2 h-5 w-5" />
              Policy Simulation
            </CardTitle>
            <CardDescription>
              Test your policies with specific scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject (User ID or Role)</Label>
              <Input
                id="subject"
                placeholder="e.g., user123 or executive"
                value={simulationRequest.subject}
                onChange={(e) =>
                  setSimulationRequest((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="resource">Resource</Label>
              <Input
                id="resource"
                placeholder="e.g., financial_data"
                value={simulationRequest.resource}
                onChange={(e) =>
                  setSimulationRequest((prev) => ({
                    ...prev,
                    resource: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="action">Action</Label>
              <Select
                onValueChange={(value) =>
                  setSimulationRequest((prev) => ({ ...prev, action: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="write">Write</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="execute">Execute</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Environment Context</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input placeholder="time: 14:30" />
                <Input placeholder="location: office" />
                <Input placeholder="network: internal" />
                <Input placeholder="device: laptop" />
              </div>
            </div>

            <Button
              onClick={onRunSimulation}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Play className="mr-2 h-4 w-4" />
              Run Simulation
            </Button>
          </CardContent>
        </Card>

        {/* Simulation Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Simulation Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {simulationResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {simulationResult.decision === "allow" ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-lg capitalize">
                        {simulationResult.decision}
                      </p>
                      <p className="text-sm text-gray-500">
                        Evaluation time: {simulationResult.evaluationTime}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {simulationResult.appliedPolicies.length} policies
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Explanation</h4>
                  <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                    {simulationResult.explanation}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Applied Policies</h4>
                  <div className="space-y-2">
                    {simulationResult.appliedPolicies.map(
                      (policyId: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <span className="text-sm font-medium">
                            {policyId}
                          </span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Attribute Details</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="p-2 bg-blue-50 rounded">
                      <span className="font-medium">Subject:</span>{" "}
                      {JSON.stringify(
                        simulationResult.details.subjectAttributes,
                      )}
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <span className="font-medium">Resource:</span>{" "}
                      {JSON.stringify(
                        simulationResult.details.resourceAttributes,
                      )}
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <span className="font-medium">Environment:</span>{" "}
                      {JSON.stringify(
                        simulationResult.details.environmentAttributes,
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <TestTube className="mx-auto h-12 w-12 mb-4" />
                <p>Run a simulation to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Policy Conflicts View Component
const PolicyConflictsView: React.FC<{ policies: ABACPolicy[] }> = ({
  policies,
}) => {
  const conflicts = [
    {
      id: "conflict-1",
      type: "Effect Conflict",
      severity: "high",
      policies: ["pol-1", "pol-3"],
      description:
        "Executive Financial Access allows access while Contractor Data Restriction denies it for contractor executives",
      resolution:
        "Add more specific subject conditions or adjust priority order",
    },
    {
      id: "conflict-2",
      type: "Priority Overlap",
      severity: "medium",
      policies: ["pol-2", "pol-3"],
      description:
        "Emergency System Access and Contractor Data Restriction have overlapping priority ranges",
      resolution: "Adjust priority values to create clear hierarchy",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Policy Conflicts
          </CardTitle>
          <CardDescription>
            Detected conflicts and resolution recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conflicts.map((conflict) => (
              <Card key={conflict.id} className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge
                          className={
                            conflict.severity === "high"
                              ? "bg-red-100 text-red-800"
                              : conflict.severity === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                          }
                        >
                          {conflict.severity}
                        </Badge>
                        <span className="font-medium">{conflict.type}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {conflict.description}
                      </p>
                      <p className="text-sm font-medium">
                        Affected policies: {conflict.policies.join(", ")}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Resolution: {conflict.resolution}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Resolve
                      </Button>
                      <Button variant="ghost" size="sm">
                        Ignore
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Policy Monitoring View Component
const PolicyMonitoringView: React.FC<{ policies: ABACPolicy[] }> = ({
  policies,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Policies
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {policies.length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Policies
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {policies.filter((p) => p.status === "active").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Allow Policies
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {policies.filter((p) => p.effect === "allow").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Deny Policies
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {policies.filter((p) => p.effect === "deny").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Policy Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {policies.slice(0, 5).map((policy, index) => (
              <div
                key={policy.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{policy.name}</p>
                  <p className="text-sm text-gray-500">
                    Priority: {policy.priority} • Status: {policy.status}
                  </p>
                </div>
                <div className="flex-1 mx-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Usage</span>
                    <span>{Math.floor(Math.random() * 100)}%</span>
                  </div>
                  <Progress
                    value={Math.floor(Math.random() * 100)}
                    className="h-2"
                  />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {Math.floor(Math.random() * 1000)} evaluations
                  </p>
                  <p className="text-xs text-gray-500">
                    {(Math.random() * 10).toFixed(1)}ms avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Policy Rules Editor Component
const PolicyRulesEditor: React.FC<{
  rules: PolicyRule[];
  onChange: (rules: PolicyRule[]) => void;
}> = ({ rules, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Policy Rules</h3>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <FileText className="mx-auto h-12 w-12 mb-4" />
          <p>No rules defined yet</p>
          <p className="text-sm">Add rules to define policy conditions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule, index) => (
            <Card key={index} className="border">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Rule {index + 1}</h4>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 mb-2">
                        Subject Conditions
                      </p>
                      <div className="space-y-1">
                        {rule.subject.map((condition, i) => (
                          <div
                            key={i}
                            className="p-2 bg-blue-50 rounded text-xs"
                          >
                            {condition.attribute} {condition.operator}{" "}
                            {JSON.stringify(condition.value)}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-gray-700 mb-2">
                        Resource Conditions
                      </p>
                      <div className="space-y-1">
                        {rule.resource.map((condition, i) => (
                          <div
                            key={i}
                            className="p-2 bg-green-50 rounded text-xs"
                          >
                            {condition.attribute} {condition.operator}{" "}
                            {JSON.stringify(condition.value)}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-gray-700 mb-2">
                        Actions & Environment
                      </p>
                      <div className="space-y-1">
                        <div className="p-2 bg-purple-50 rounded text-xs">
                          Actions: {rule.action.join(", ")}
                        </div>
                        {rule.environment?.map((condition, i) => (
                          <div
                            key={i}
                            className="p-2 bg-orange-50 rounded text-xs"
                          >
                            {condition.attribute} {condition.operator}{" "}
                            {JSON.stringify(condition.value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Policy Test Dialog Component
const PolicyTestDialog: React.FC<{
  simulationRequest: any;
  setSimulationRequest: (req: any) => void;
  simulationResult: any;
  onRunTest: () => void;
}> = ({
  simulationRequest,
  setSimulationRequest,
  simulationResult,
  onRunTest,
}) => {
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Policy Testing</DialogTitle>
        <DialogDescription>
          Test policies against specific scenarios to validate behavior
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <PolicySimulationView
          simulationRequest={simulationRequest}
          setSimulationRequest={setSimulationRequest}
          simulationResult={simulationResult}
          onRunSimulation={onRunTest}
        />
      </div>
    </DialogContent>
  );
};

// Rule Editor Component
const RuleEditor: React.FC<{
  rule: PolicyRule;
  index: number;
  onChange: (rule: PolicyRule) => void;
  onRemove: () => void;
}> = ({ rule, index, onChange, onRemove }) => {
  const [activeSection, setActiveSection] = useState("subject");

  const addCondition = (section: keyof PolicyRule) => {
    const newCondition: AttributeCondition = {
      attribute: "",
      operator: "equals",
      value: "",
    };

    onChange({
      ...rule,
      [section]: Array.isArray(rule[section])
        ? [...(rule[section] as AttributeCondition[]), newCondition]
        : rule[section],
    });
  };

  const updateCondition = (
    section: keyof PolicyRule,
    conditionIndex: number,
    condition: AttributeCondition
  ) => {
    const currentConditions = rule[section] as AttributeCondition[];
    const updatedConditions = currentConditions.map((c, i) =>
      i === conditionIndex ? condition : c
    );

    onChange({
      ...rule,
      [section]: updatedConditions,
    });
  };

  const removeCondition = (section: keyof PolicyRule, conditionIndex: number) => {
    const currentConditions = rule[section] as AttributeCondition[];
    const updatedConditions = currentConditions.filter((_, i) => i !== conditionIndex);

    onChange({
      ...rule,
      [section]: updatedConditions,
    });
  };

  const updateActions = (actions: string[]) => {
    onChange({
      ...rule,
      action: actions,
    });
  };

  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Rule {index + 1}</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Define conditions for subjects, resources, actions, and environment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="subject" className="relative">
              Subject
              {rule.subject.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {rule.subject.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="resource" className="relative">
              Resource
              {rule.resource.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {rule.resource.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="action" className="relative">
              Actions
              {rule.action.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {rule.action.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="environment" className="relative">
              Environment
              {rule.environment && rule.environment.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {rule.environment.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subject" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Subject Conditions</Label>
                <p className="text-xs text-gray-500">Who is requesting access</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addCondition("subject")}
              >
                <Plus className="mr-2 h-3 w-3" />
                Add Condition
              </Button>
            </div>
            <ConditionsList
              conditions={rule.subject}
              onUpdate={(index, condition) => updateCondition("subject", index, condition)}
              onRemove={(index) => removeCondition("subject", index)}
              placeholder="e.g., role = 'executive', department in ['finance', 'accounting']"
            />
          </TabsContent>

          <TabsContent value="resource" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Resource Conditions</Label>
                <p className="text-xs text-gray-500">What is being accessed</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addCondition("resource")}
              >
                <Plus className="mr-2 h-3 w-3" />
                Add Condition
              </Button>
            </div>
            <ConditionsList
              conditions={rule.resource}
              onUpdate={(index, condition) => updateCondition("resource", index, condition)}
              onRemove={(index) => removeCondition("resource", index)}
              placeholder="e.g., type = 'financial_data', classification != 'top_secret'"
            />
          </TabsContent>

          <TabsContent value="action" className="space-y-3 mt-4">
            <div>
              <Label className="font-medium">Allowed Actions</Label>
              <p className="text-xs text-gray-500">What operations can be performed</p>
            </div>
            <ActionSelector
              actions={rule.action}
              onChange={updateActions}
            />
          </TabsContent>

          <TabsContent value="environment" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Environment Conditions</Label>
                <p className="text-xs text-gray-500">Contextual conditions like time, location</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addCondition("environment")}
              >
                <Plus className="mr-2 h-3 w-3" />
                Add Condition
              </Button>
            </div>
            <ConditionsList
              conditions={rule.environment || []}
              onUpdate={(index, condition) => updateCondition("environment", index, condition)}
              onRemove={(index) => removeCondition("environment", index)}
              placeholder="e.g., time > '09:00', location = 'office', network = 'internal'"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Conditions List Component
const ConditionsList: React.FC<{
  conditions: AttributeCondition[];
  onUpdate: (index: number, condition: AttributeCondition) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}> = ({ conditions, onUpdate, onRemove, placeholder }) => {
  const operators = [
    { value: "equals", label: "equals (=)" },
    { value: "not_equals", label: "not equals (≠)" },
    { value: "in", label: "in array" },
    { value: "not_in", label: "not in array" },
    { value: "greater_than", label: "greater than (>)" },
    { value: "less_than", label: "less than (<)" },
    { value: "greater_than_or_equal", label: "greater than or equal (≥)" },
    { value: "less_than_or_equal", label: "less than or equal (≤)" },
    { value: "contains", label: "contains" },
    { value: "regex", label: "regex match" },
  ];

  if (conditions.length === 0) {
    return (
      <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
        <p className="text-sm text-gray-500 mb-1">No conditions defined</p>
        <p className="text-xs text-gray-400">{placeholder}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conditions.map((condition, index) => (
        <div key={index} className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-4">
            <Label className="text-xs">Attribute</Label>
            <Input
              placeholder="e.g., role, department"
              value={condition.attribute}
              onChange={(e) =>
                onUpdate(index, { ...condition, attribute: e.target.value })
              }
              className="text-sm"
            />
          </div>
          <div className="col-span-3">
            <Label className="text-xs">Operator</Label>
            <Select
              value={condition.operator}
              onValueChange={(value) =>
                onUpdate(index, { ...condition, operator: value as any })
              }
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-4">
            <Label className="text-xs">Value</Label>
            <Input
              placeholder="e.g., 'executive', ['finance', 'accounting']"
              value={typeof condition.value === 'string' ? condition.value : JSON.stringify(condition.value)}
              onChange={(e) => {
                let value: any = e.target.value;
                // Try to parse as JSON for arrays/objects
                if (value.startsWith('[') || value.startsWith('{')) {
                  try {
                    value = JSON.parse(value);
                  } catch {
                    // Keep as string if JSON parsing fails
                  }
                }
                onUpdate(index, { ...condition, value });
              }}
              className="text-sm"
            />
          </div>
          <div className="col-span-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Action Selector Component
const ActionSelector: React.FC<{
  actions: string[];
  onChange: (actions: string[]) => void;
}> = ({ actions, onChange }) => {
  const availableActions = [
    { value: "read", label: "Read", icon: Eye },
    { value: "write", label: "Write", icon: Edit },
    { value: "delete", label: "Delete", icon: Trash2 },
    { value: "execute", label: "Execute", icon: Play },
    { value: "admin", label: "Admin", icon: Settings },
    { value: "create", label: "Create", icon: Plus },
    { value: "update", label: "Update", icon: RefreshCw },
    { value: "download", label: "Download", icon: Download },
    { value: "upload", label: "Upload", icon: Upload },
    { value: "share", label: "Share", icon: Users },
  ];

  const toggleAction = (action: string) => {
    if (actions.includes(action)) {
      onChange(actions.filter(a => a !== action));
    } else {
      onChange([...actions, action]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {availableActions.map((action) => {
          const Icon = action.icon;
          const isSelected = actions.includes(action.value);

          return (
            <Button
              key={action.value}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => toggleAction(action.value)}
              className={cn(
                "flex items-center justify-start text-xs h-8",
                isSelected && "bg-blue-600 hover:bg-blue-700"
              )}
            >
              <Icon className="mr-2 h-3 w-3" />
              {action.label}
            </Button>
          );
        })}
      </div>

      <div>
        <Label className="text-xs">Custom Actions</Label>
        <Input
          placeholder="Enter custom actions separated by commas"
          onChange={(e) => {
            const customActions = e.target.value.split(',').map(a => a.trim()).filter(Boolean);
            const baseActions = actions.filter(a => availableActions.find(aa => aa.value === a));
            onChange([...baseActions, ...customActions]);
          }}
          className="text-sm"
        />
      </div>

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {actions.map((action) => (
            <Badge key={action} variant="secondary" className="text-xs">
              {action}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => toggleAction(action)}
                className="ml-1 h-3 w-3 p-0 hover:bg-red-100"
              >
                <XCircle className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

// Policy Validation View Component
const PolicyValidationView: React.FC<{
  policy: any;
  onValidate: () => boolean;
}> = ({ policy, onValidate }) => {
  const [validationResults, setValidationResults] = useState<any>(null);

  const runValidation = () => {
    const results = {
      isValid: onValidate(),
      warnings: [] as string[],
      suggestions: [] as string[],
      score: 0,
    };

    // Check for common issues
    if (policy.rules.length === 0) {
      results.warnings.push("No rules defined - policy will not have any effect");
    }

    if (policy.priority < 50) {
      results.suggestions.push("Consider increasing priority for better policy evaluation order");
    }

    if (policy.effect === "deny" && policy.priority < 100) {
      results.suggestions.push("Deny policies typically should have higher priority than allow policies");
    }

    policy.rules.forEach((rule: PolicyRule, index: number) => {
      if (rule.subject.length === 0) {
        results.warnings.push(`Rule ${index + 1}: No subject conditions defined`);
      }
      if (rule.resource.length === 0) {
        results.warnings.push(`Rule ${index + 1}: No resource conditions defined`);
      }
      if (rule.action.length === 0) {
        results.warnings.push(`Rule ${index + 1}: No actions specified`);
      }
    });

    // Calculate score
    results.score = Math.max(0, 100 - (results.warnings.length * 20) - (results.suggestions.length * 5));

    setValidationResults(results);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Policy Validation</h3>
          <p className="text-sm text-gray-500">
            Validate policy structure and check for potential issues
          </p>
        </div>
        <Button onClick={runValidation} variant="outline">
          <CheckCircle className="mr-2 h-4 w-4" />
          Run Validation
        </Button>
      </div>

      {validationResults ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {validationResults.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {validationResults.isValid ? "Valid Policy" : "Invalid Policy"}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Quality Score</p>
                  <p className={cn("text-2xl font-bold", getScoreColor(validationResults.score))}>
                    {validationResults.score}/100
                  </p>
                </div>
              </div>

              <Progress value={validationResults.score} className="h-2" />
            </CardContent>
          </Card>

          {validationResults.warnings.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center text-orange-800">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Warnings ({validationResults.warnings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validationResults.warnings.map((warning: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-orange-700">{warning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {validationResults.suggestions.length > 0 && (
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center text-blue-800">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Suggestions ({validationResults.suggestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validationResults.suggestions.map((suggestion: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-700">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {validationResults.isValid && validationResults.warnings.length === 0 && (
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Policy looks good!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  No issues found. This policy is ready to be created.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Validate</h3>
          <p className="text-gray-500 mb-4">
            Click "Run Validation" to check your policy for issues and get quality score
          </p>
        </div>
      )}
    </div>
  );
};

export default Policies;
