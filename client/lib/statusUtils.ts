import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "deprecated":
      return "bg-red-100 text-red-800";
    case "suspended":
      return "bg-red-100 text-red-800";
    case "draft":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return CheckCircle;
    case "pending":
      return Clock;
    case "inactive":
      return XCircle;
    case "deprecated":
      return AlertTriangle;
    case "suspended":
      return XCircle;
    case "draft":
      return Clock;
    default:
      return Clock;
  }
};

export const getRiskColor = (risk: string) => {
  switch (risk) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getEffectColor = (effect: string) => {
  switch (effect) {
    case "allow":
      return "bg-green-100 text-green-800";
    case "deny":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getPriorityBadge = (priority: number) => {
  if (priority >= 150)
    return { label: "High", color: "bg-red-100 text-red-800" };
  if (priority >= 100)
    return { label: "Medium", color: "bg-yellow-100 text-yellow-800" };
  return { label: "Low", color: "bg-blue-100 text-blue-800" };
};

export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-600";
    case "high":
      return "bg-orange-600";
    case "medium":
      return "bg-yellow-600";
    case "low":
      return "bg-blue-600";
    default:
      return "bg-gray-600";
  }
};

export const getComplianceColor = (status: string) => {
  switch (status) {
    case "compliant":
      return "text-green-600 bg-green-50";
    case "warning":
      return "text-yellow-600 bg-yellow-50";
    case "non_compliant":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};
