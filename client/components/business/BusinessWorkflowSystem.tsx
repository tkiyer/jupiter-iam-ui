/**
 * Business Workflow System
 * Demonstrates approval workflows with RBAC+ABAC integration
 */

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Progress } from "../ui/progress";
import {
  Workflow,
  CreditCard,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  User,
  DollarSign,
  FileText,
  Building2,
  Shield,
  Play,
  Pause,
  RotateCcw,
  MessageSquare,
  Eye,
} from "lucide-react";

interface WorkflowStep {
  id: string;
  name: string;
  type: "submit" | "approve" | "review" | "execute" | "notify";
  status: "pending" | "processing" | "completed" | "rejected" | "failed";
  assignee: string;
  assigneeRole: string;
  dueDate: string;
  rbacRequirements: string[];
  abacConditions: string[];
  completedAt?: string;
  comments?: string;
  nextSteps?: string[];
}

interface WorkflowRequest {
  id: string;
  type:
    | "expense_approval"
    | "permission_request"
    | "system_access"
    | "data_export";
  title: string;
  description: string;
  requester: string;
  requestDate: string;
  amount?: number;
  department: string;
  priority: "low" | "medium" | "high" | "urgent";
  status:
    | "draft"
    | "submitted"
    | "in_review"
    | "approved"
    | "rejected"
    | "completed";
  currentStep: number;
  steps: WorkflowStep[];
  metadata: Record<string, any>;
}

const mockWorkflowRequests: WorkflowRequest[] = [
  {
    id: "WF-2024-001",
    type: "expense_approval",
    title: "设备采购申请 - 服务器硬件升级",
    description: "为提升系统性能，申请采购新的服务器硬件设备",
    requester: "张工程师",
    requestDate: "2024-01-15T09:30:00Z",
    amount: 85000,
    department: "IT",
    priority: "high",
    status: "in_review",
    currentStep: 1,
    steps: [
      {
        id: "step-1",
        name: "提交申请",
        type: "submit",
        status: "completed",
        assignee: "张工程师",
        assigneeRole: "senior_engineer",
        dueDate: "2024-01-15T18:00:00Z",
        rbacRequirements: ["员工角色", "基础提交权限"],
        abacConditions: ["工作时间", "本部门申请"],
        completedAt: "2024-01-15T09:30:00Z",
        comments: "服务器性能已接近瓶颈，需要尽快升级",
      },
      {
        id: "step-2",
        name: "部门经理审批",
        type: "approve",
        status: "processing",
        assignee: "李经理",
        assigneeRole: "department_manager",
        dueDate: "2024-01-16T18:00:00Z",
        rbacRequirements: ["部门经理角色", "费用审批权限"],
        abacConditions: ["金额在权限范围(10万以下)", "本部门费用", "工作��间"],
        nextSteps: ["财务审核", "最终审批"],
      },
      {
        id: "step-3",
        name: "财务审核",
        type: "review",
        status: "pending",
        assignee: "王会计",
        assigneeRole: "finance_specialist",
        dueDate: "2024-01-17T18:00:00Z",
        rbacRequirements: ["财务角色", "预算审核权限"],
        abacConditions: ["预算可用性", "合规性检查"],
      },
      {
        id: "step-4",
        name: "财务经理批准",
        type: "approve",
        status: "pending",
        assignee: "赵经理",
        assigneeRole: "finance_manager",
        dueDate: "2024-01-18T18:00:00Z",
        rbacRequirements: ["财务经理角色", "大额支出审批"],
        abacConditions: ["金额阈值检查", "预算充足性"],
      },
      {
        id: "step-5",
        name: "采购执行",
        type: "execute",
        status: "pending",
        assignee: "采购部",
        assigneeRole: "procurement_team",
        dueDate: "2024-01-22T18:00:00Z",
        rbacRequirements: ["采购执行权限"],
        abacConditions: ["供应商选择", "采购流程合规"],
      },
    ],
    metadata: {
      equipment_type: "server_hardware",
      vendor: "Dell Technologies",
      urgency_reason: "performance_bottleneck",
    },
  },
  {
    id: "WF-2024-002",
    type: "permission_request",
    title: "跨部门数据访问权限申请",
    description: "市场部需要访问销售部客户数据进行营销分析",
    requester: "陈分析师",
    requestDate: "2024-01-14T14:20:00Z",
    department: "marketing",
    priority: "medium",
    status: "in_review",
    currentStep: 2,
    steps: [
      {
        id: "step-1",
        name: "提交权限申请",
        type: "submit",
        status: "completed",
        assignee: "陈分析师",
        assigneeRole: "data_analyst",
        dueDate: "2024-01-14T18:00:00Z",
        rbacRequirements: ["员工角色"],
        abacConditions: ["申请原因正当性"],
        completedAt: "2024-01-14T14:20:00Z",
        comments: "需要客户数据进行Q1营销策略分析",
      },
      {
        id: "step-2",
        name: "数据拥有者审批",
        type: "approve",
        status: "completed",
        assignee: "销售部经理",
        assigneeRole: "sales_manager",
        dueDate: "2024-01-15T18:00:00Z",
        rbacRequirements: ["部门经理角色", "数据授权权限"],
        abacConditions: ["数据用途合规", "访问期限合理"],
        completedAt: "2024-01-15T11:30:00Z",
        comments: "同意提供脱敏后的客户���据",
      },
      {
        id: "step-3",
        name: "安全审核",
        type: "review",
        status: "processing",
        assignee: "安全主管",
        assigneeRole: "security_officer",
        dueDate: "2024-01-16T18:00:00Z",
        rbacRequirements: ["安全审核权限"],
        abacConditions: ["数据分类检查", "访问控制策略"],
      },
      {
        id: "step-4",
        name: "权限配置",
        type: "execute",
        status: "pending",
        assignee: "IT管理员",
        assigneeRole: "system_admin",
        dueDate: "2024-01-17T18:00:00Z",
        rbacRequirements: ["系统管理员权限"],
        abacConditions: ["临时权限设置", "访问日志启用"],
      },
    ],
    metadata: {
      data_type: "customer_analytics",
      access_duration: "30_days",
      data_classification: "confidential",
    },
  },
  {
    id: "WF-2024-003",
    type: "system_access",
    title: "生产环境紧急访问申请",
    description: "系统故障需要紧急访问生产环境进行修复",
    requester: "运维工程师",
    requestDate: "2024-01-16T02:15:00Z",
    department: "IT",
    priority: "urgent",
    status: "approved",
    currentStep: 4,
    steps: [
      {
        id: "step-1",
        name: "紧急申请",
        type: "submit",
        status: "completed",
        assignee: "运维工程师",
        assigneeRole: "devops_engineer",
        dueDate: "2024-01-16T02:30:00Z",
        rbacRequirements: ["工程师角色", "紧急申请权限"],
        abacConditions: ["紧急情况认证"],
        completedAt: "2024-01-16T02:15:00Z",
        comments: "数据库服务异常，影响核心业务",
      },
      {
        id: "step-2",
        name: "值班经理确认",
        type: "approve",
        status: "completed",
        assignee: "技术经理",
        assigneeRole: "tech_manager",
        dueDate: "2024-01-16T02:45:00Z",
        rbacRequirements: ["管理层角色", "紧急授权权限"],
        abacConditions: ["紧急级别验证", "业务影响评估"],
        completedAt: "2024-01-16T02:25:00Z",
        comments: "确认为P1级故障，立即处理",
      },
      {
        id: "step-3",
        name: "安全确认",
        type: "review",
        status: "completed",
        assignee: "安全值班",
        assigneeRole: "security_oncall",
        dueDate: "2024-01-16T02:50:00Z",
        rbacRequirements: ["安全权限"],
        abacConditions: ["访问范围限制", "操作监控启用"],
        completedAt: "2024-01-16T02:30:00Z",
        comments: "启用高级监控，限制访问范围",
      },
      {
        id: "step-4",
        name: "临时权限激活",
        type: "execute",
        status: "completed",
        assignee: "自动化系统",
        assigneeRole: "system",
        dueDate: "2024-01-16T02:55:00Z",
        rbacRequirements: ["系统执行权限"],
        abacConditions: ["时间限制(2小时)", "操作日志记录"],
        completedAt: "2024-01-16T02:35:00Z",
        comments: "临时权限已激活，2小时后自动收回",
      },
    ],
    metadata: {
      incident_id: "INC-2024-0001",
      severity: "P1",
      estimated_downtime: "30_minutes",
    },
  },
];

export default function BusinessWorkflowSystem() {
  const [selectedRequest, setSelectedRequest] = useState<WorkflowRequest>(
    mockWorkflowRequests[0],
  );
  const [newRequest, setNewRequest] = useState({
    type: "expense_approval",
    title: "",
    description: "",
    amount: 0,
    priority: "medium",
  });
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [actionComment, setActionComment] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-blue-500 text-white";
      case "low":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getWorkflowIcon = (type: string) => {
    switch (type) {
      case "expense_approval":
        return <CreditCard className="h-5 w-5" />;
      case "permission_request":
        return <Shield className="h-5 w-5" />;
      case "system_access":
        return <Building2 className="h-5 w-5" />;
      case "data_export":
        return <FileText className="h-5 w-5" />;
      default:
        return <Workflow className="h-5 w-5" />;
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case "submit":
        return <FileText className="h-4 w-4" />;
      case "approve":
        return <CheckCircle className="h-4 w-4" />;
      case "review":
        return <Eye className="h-4 w-4" />;
      case "execute":
        return <Play className="h-4 w-4" />;
      case "notify":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const calculateProgress = (steps: WorkflowStep[]) => {
    const completedSteps = steps.filter(
      (step) => step.status === "completed",
    ).length;
    return (completedSteps / steps.length) * 100;
  };

  const handleAction = (action: "approve" | "reject", stepId: string) => {
    // This would normally call an API
    console.log(`${action} step ${stepId} with comment: ${actionComment}`);
    setActionComment("");
  };

  const submitNewRequest = () => {
    // This would normally call an API to create the workflow
    console.log("Submitting new request:", newRequest);
    setShowNewRequestForm(false);
    setNewRequest({
      type: "expense_approval",
      title: "",
      description: "",
      amount: 0,
      priority: "medium",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            业务工作流系统
          </CardTitle>
          <CardDescription>
            展示RBAC+ABAC在审批流程中的协同应用，实现安全高效的业务工作流
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowNewRequestForm(true)}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              发起新申请
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              查看统计
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">进行中的工作流</TabsTrigger>
          <TabsTrigger value="details">工作流详情</TabsTrigger>
          <TabsTrigger value="approval">待我审批</TabsTrigger>
          <TabsTrigger value="analytics">工作流分析</TabsTrigger>
        </TabsList>

        {/* Active Workflows Tab */}
        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {mockWorkflowRequests.map((request) => (
              <Card
                key={request.id}
                className={`cursor-pointer transition-all ${
                  selectedRequest.id === request.id
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
                onClick={() => setSelectedRequest(request)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getWorkflowIcon(request.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{request.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {request.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status === "in_review"
                          ? "审核中"
                          : request.status === "approved"
                            ? "已批准"
                            : request.status === "rejected"
                              ? "已拒绝"
                              : "进行中"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">申请人:</span>
                      <div className="font-medium">{request.requester}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">部门:</span>
                      <div className="font-medium">{request.department}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">申请时间:</span>
                      <div className="font-medium">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </div>
                    </div>
                    {request.amount && (
                      <div>
                        <span className="text-muted-foreground">金额:</span>
                        <div className="font-medium">
                          ¥{request.amount.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        进度: {request.currentStep}/{request.steps.length}
                      </span>
                      <span>
                        {calculateProgress(request.steps).toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={calculateProgress(request.steps)} />
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    当前步骤:{" "}
                    {request.steps[request.currentStep]?.name || "已完成"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Workflow Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getWorkflowIcon(selectedRequest.type)}
                  </div>
                  <div>
                    <CardTitle>{selectedRequest.title}</CardTitle>
                    <CardDescription>
                      {selectedRequest.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(selectedRequest.priority)}>
                    {selectedRequest.priority.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                <div>
                  <span className="font-medium">工作流ID:</span>
                  <div className="text-muted-foreground">
                    {selectedRequest.id}
                  </div>
                </div>
                <div>
                  <span className="font-medium">申请人:</span>
                  <div className="text-muted-foreground">
                    {selectedRequest.requester}
                  </div>
                </div>
                <div>
                  <span className="font-medium">申请时间:</span>
                  <div className="text-muted-foreground">
                    {new Date(selectedRequest.requestDate).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="font-medium">当前步骤:</span>
                  <div className="text-muted-foreground">
                    {selectedRequest.currentStep + 1}/
                    {selectedRequest.steps.length}
                  </div>
                </div>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-4">
                <h4 className="font-semibold">工作流步骤</h4>
                <div className="relative">
                  {selectedRequest.steps.map((step, index) => (
                    <div key={step.id} className="relative">
                      {/* Step Card */}
                      <div
                        className={`p-4 border-2 rounded-lg mb-4 transition-all ${
                          step.status === "completed"
                            ? "border-green-300 bg-green-50"
                            : step.status === "processing"
                              ? "border-blue-300 bg-blue-50"
                              : step.status === "rejected" ||
                                  step.status === "failed"
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              step.status === "completed"
                                ? "bg-green-100 text-green-600"
                                : step.status === "processing"
                                  ? "bg-blue-100 text-blue-600"
                                  : step.status === "rejected" ||
                                      step.status === "failed"
                                    ? "bg-red-100 text-red-600"
                                    : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {getStepIcon(step.type)}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h5 className="font-semibold">{step.name}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {step.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                {step.status === "completed" && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                                {step.status === "processing" && (
                                  <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                )}
                                {(step.status === "rejected" ||
                                  step.status === "failed") && (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <Badge
                                  className={getStatusColor(step.status)}
                                  variant="outline"
                                >
                                  {step.status === "completed"
                                    ? "已完成"
                                    : step.status === "processing"
                                      ? "处理中"
                                      : step.status === "rejected"
                                        ? "已拒绝"
                                        : step.status === "failed"
                                          ? "失败"
                                          : "待处理"}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                              <div>
                                <span className="font-medium">负责人:</span>{" "}
                                {step.assignee}
                              </div>
                              <div>
                                <span className="font-medium">角色:</span>{" "}
                                {step.assigneeRole}
                              </div>
                              <div>
                                <span className="font-medium">截止时间:</span>
                                {new Date(step.dueDate).toLocaleString()}
                              </div>
                              {step.completedAt && (
                                <div>
                                  <span className="font-medium">完成时间:</span>
                                  {new Date(step.completedAt).toLocaleString()}
                                </div>
                              )}
                            </div>

                            {/* RBAC Requirements */}
                            <div className="mb-3">
                              <div className="text-xs font-medium text-blue-600 mb-1">
                                RBAC要求:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {step.rbacRequirements.map((req, reqIndex) => (
                                  <Badge
                                    key={reqIndex}
                                    variant="outline"
                                    className="text-xs bg-blue-50"
                                  >
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* ABAC Conditions */}
                            <div className="mb-3">
                              <div className="text-xs font-medium text-green-600 mb-1">
                                ABAC条件:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {step.abacConditions.map(
                                  (condition, condIndex) => (
                                    <Badge
                                      key={condIndex}
                                      variant="outline"
                                      className="text-xs bg-green-50"
                                    >
                                      {condition}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>

                            {step.comments && (
                              <div className="p-2 bg-white rounded border">
                                <div className="text-xs font-medium mb-1">
                                  备注:
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {step.comments}
                                </div>
                              </div>
                            )}

                            {step.nextSteps && step.nextSteps.length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs font-medium mb-1">
                                  后续步骤:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {step.nextSteps.map((nextStep, nextIndex) => (
                                    <Badge
                                      key={nextIndex}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {nextStep}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      {index < selectedRequest.steps.length - 1 && (
                        <div className="flex justify-center mb-4">
                          <ArrowRight
                            className={`h-6 w-6 rotate-90 ${
                              step.status === "completed"
                                ? "text-green-600"
                                : "text-gray-400"
                            } transition-colors duration-500`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Approvals Tab */}
        <TabsContent value="approval" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>待我审批的项目</CardTitle>
              <CardDescription>
                需要您审批的工作流步骤，基于您的角色权限和业务规则
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWorkflowRequests
                  .flatMap((request) =>
                    request.steps
                      .filter((step) => step.status === "processing")
                      .map((step) => ({
                        ...step,
                        requestId: request.id,
                        requestTitle: request.title,
                      })),
                  )
                  .map((step, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h5 className="font-semibold">{step.requestTitle}</h5>
                          <p className="text-sm text-muted-foreground">
                            当前步骤: {step.name}
                          </p>
                        </div>
                        <Badge variant="outline">
                          截止: {new Date(step.dueDate).toLocaleDateString()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <div className="font-medium text-blue-600 mb-1">
                            RBAC验证:
                          </div>
                          <div className="space-y-1">
                            {step.rbacRequirements.map((req, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="text-xs">{req}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-green-600 mb-1">
                            ABAC检查:
                          </div>
                          <div className="space-y-1">
                            {step.abacConditions.map((condition, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="text-xs">{condition}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`comment-${index}`}>审批意见</Label>
                          <Textarea
                            id={`comment-${index}`}
                            placeholder="请输入审批意见..."
                            value={actionComment}
                            onChange={(e) => setActionComment(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction("approve", step.id)}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            批准
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAction("reject", step.id)}
                            className="flex items-center gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            拒绝
                          </Button>
                          <Button variant="outline" size="sm">
                            转发
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">工作流效率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <div className="text-xs text-muted-foreground">按时���成率</div>
                <Progress value={92} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">RBAC+ABAC集成</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98%</div>
                <div className="text-xs text-muted-foreground">
                  策略匹配准确率
                </div>
                <Progress value={98} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">平均处理时间</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3</div>
                <div className="text-xs text-muted-foreground">天/工作流</div>
                <div className="mt-2 text-xs text-green-600">比上月减少15%</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>工作流类型分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>费用审批</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: "65%" }}
                      ></div>
                    </div>
                    <span className="text-sm">65%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>权限申请</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: "25%" }}
                      ></div>
                    </div>
                    <span className="text-sm">25%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>系统访问</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: "10%" }}
                      ></div>
                    </div>
                    <span className="text-sm">10%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Request Form Modal */}
      {showNewRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>发起新申请</CardTitle>
              <CardDescription>选择申请类型并填写基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="request-type">申请类型</Label>
                <Select
                  value={newRequest.type}
                  onValueChange={(value: any) =>
                    setNewRequest((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense_approval">费用审批</SelectItem>
                    <SelectItem value="permission_request">权限申请</SelectItem>
                    <SelectItem value="system_access">系统访问</SelectItem>
                    <SelectItem value="data_export">数据导出</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">申请标题</Label>
                <Input
                  id="title"
                  value={newRequest.title}
                  onChange={(e) =>
                    setNewRequest((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="简要描述您的申请"
                />
              </div>

              <div>
                <Label htmlFor="description">详细描述</Label>
                <Textarea
                  id="description"
                  value={newRequest.description}
                  onChange={(e) =>
                    setNewRequest((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="详细说明申请原因和用途"
                />
              </div>

              {newRequest.type === "expense_approval" && (
                <div>
                  <Label htmlFor="amount">金额 (元)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newRequest.amount}
                    onChange={(e) =>
                      setNewRequest((prev) => ({
                        ...prev,
                        amount: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              )}

              <div>
                <Label htmlFor="priority">优先级</Label>
                <Select
                  value={newRequest.priority}
                  onValueChange={(value: any) =>
                    setNewRequest((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="urgent">紧急</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={submitNewRequest} className="flex-1">
                  提交申请
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewRequestForm(false)}
                >
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
