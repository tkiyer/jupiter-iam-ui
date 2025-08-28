import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleLogin, handleVerifyToken } from "./routes/auth";
import {
  handleDashboardStats,
  handleDetailedAnalytics,
} from "./routes/dashboard";
import {
  handleGetUsers,
  handleGetUser,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
  handleResetPassword,
  handleToggleMFA,
  handleBulkImport,
  handleExportUsers,
  handleGetUserActivity,
} from "./routes/users";
import {
  handleGetRoles,
  handleGetRole,
  handleCreateRole,
  handleUpdateRole,
  handleDeleteRole,
  handleGetRoleTemplates,
  handleGetRoleConflicts,
  handleGetRoleAnalytics,
  handleGetRoleHierarchy,
  handleCloneRole,
  handleResolveConflict,
  handleGetPermissions as handleGetPermissionsFromRoles,
  handleCreateRoleTemplate,
  handleUpdateRoleTemplate,
  handleDeleteRoleTemplate,
  handleGetRoleTemplate,
  handleDuplicateRoleTemplate,
  handleGetTemplateCategories,
  handleExportTemplates,
  handleImportTemplates,
} from "./routes/roles";
import {
  handleGetPermissions,
  handleGetPermission,
  handleCreatePermission,
  handleUpdatePermission,
  handleDeletePermission,
  handleGetPermissionCategories,
  handleCreatePermissionCategory,
  handleUpdatePermissionCategory,
  handleDeletePermissionCategory,
  handleGetPermissionCategory,
  handleGetOptimizations,
  handleGetPermissionAnalytics,
  handleGetResources,
  handleApplyOptimization,
  handleDelegatePermission,
  handleCreateResource,
  handleUpdateResource,
  handleDeleteResource,
  handleGetResource,
} from "./routes/permissions";
import {
  handleGetPolicies,
  handleGetPolicy,
  handleCreatePolicy,
  handleUpdatePolicy,
  handleDeletePolicy,
  handleTestPolicy,
  handleGetPolicyVersions,
  handleRollbackPolicy,
  handleGetPolicyConflicts,
  handleGetPolicyAnalytics,
  handleActivatePolicy,
  handleDeactivatePolicy,
  handleEvaluatePolicy,
} from "./routes/policies";
import {
  handleGetBusinessPolicies,
  handleTestBusinessScenario,
  handleGetBusinessTemplates,
  handleIntegrationAnalysis,
} from "./routes/business-policies";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createNotification,
} from "./routes/notifications";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // IAM Authentication routes
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/verify", handleVerifyToken);

  // IAM Dashboard routes
  app.get("/api/dashboard/stats", handleDashboardStats);
  app.get("/api/dashboard/detailed-analytics", handleDetailedAnalytics);

  // IAM User Management routes
  app.get("/api/users", handleGetUsers);
  app.get("/api/users/export", handleExportUsers);
  app.post("/api/users", handleCreateUser);
  app.post("/api/users/bulk-import", handleBulkImport);
  app.get("/api/users/:id", handleGetUser);
  app.put("/api/users/:id", handleUpdateUser);
  app.delete("/api/users/:id", handleDeleteUser);
  app.post("/api/users/:id/reset-password", handleResetPassword);
  app.post("/api/users/:id/toggle-mfa", handleToggleMFA);
  app.get("/api/users/:id/activity", handleGetUserActivity);

  // IAM Role Management routes
  app.get("/api/roles", handleGetRoles);
  app.get("/api/roles/templates", handleGetRoleTemplates);
  app.get("/api/roles/conflicts", handleGetRoleConflicts);
  app.get("/api/roles/hierarchy", handleGetRoleHierarchy);
  app.post("/api/roles", handleCreateRole);
  app.get("/api/roles/:id", handleGetRole);
  app.put("/api/roles/:id", handleUpdateRole);
  app.delete("/api/roles/:id", handleDeleteRole);
  app.post("/api/roles/:id/clone", handleCloneRole);
  app.get("/api/roles/:id/analytics", handleGetRoleAnalytics);
  app.post("/api/roles/conflicts/:id/resolve", handleResolveConflict);

  // Role Template Management routes
  app.post("/api/role-templates", handleCreateRoleTemplate);
  app.get("/api/role-templates/categories", handleGetTemplateCategories);
  app.post("/api/role-templates/export", handleExportTemplates);
  app.post("/api/role-templates/import", handleImportTemplates);
  app.get("/api/role-templates/:id", handleGetRoleTemplate);
  app.put("/api/role-templates/:id", handleUpdateRoleTemplate);
  app.delete("/api/role-templates/:id", handleDeleteRoleTemplate);
  app.post("/api/role-templates/:id/duplicate", handleDuplicateRoleTemplate);

  // IAM Permission Management routes (detailed)
  app.get("/api/permissions", handleGetPermissions);
  app.get("/api/permissions/categories", handleGetPermissionCategories);
  app.post("/api/permissions/categories", handleCreatePermissionCategory);
  app.get("/api/permissions/categories/:id", handleGetPermissionCategory);
  app.put("/api/permissions/categories/:id", handleUpdatePermissionCategory);
  app.delete("/api/permissions/categories/:id", handleDeletePermissionCategory);
  app.get("/api/permissions/optimizations", handleGetOptimizations);
  app.post("/api/permissions", handleCreatePermission);
  app.get("/api/permissions/:id", handleGetPermission);
  app.put("/api/permissions/:id", handleUpdatePermission);
  app.delete("/api/permissions/:id", handleDeletePermission);
  app.get("/api/permissions/:id/analytics", handleGetPermissionAnalytics);
  app.post("/api/permissions/:id/delegate", handleDelegatePermission);
  app.post("/api/permissions/optimize", handleApplyOptimization);

  // Resource management routes
  app.get("/api/resources", handleGetResources);
  app.post("/api/resources", handleCreateResource);
  app.get("/api/resources/:id", handleGetResource);
  app.put("/api/resources/:id", handleUpdateResource);
  app.delete("/api/resources/:id", handleDeleteResource);

  // IAM Policy Management routes (ABAC)
  app.get("/api/policies", handleGetPolicies);
  app.get("/api/policies/conflicts", handleGetPolicyConflicts);
  app.get("/api/policies/analytics", handleGetPolicyAnalytics);
  app.post("/api/policies", handleCreatePolicy);
  app.post("/api/policies/test", handleTestPolicy);
  app.post("/api/policies/evaluate", handleEvaluatePolicy);
  app.get("/api/policies/:id", handleGetPolicy);
  app.put("/api/policies/:id", handleUpdatePolicy);
  app.delete("/api/policies/:id", handleDeletePolicy);
  app.get("/api/policies/:id/versions", handleGetPolicyVersions);
  app.post("/api/policies/:id/rollback", handleRollbackPolicy);
  app.post("/api/policies/:id/activate", handleActivatePolicy);
  app.post("/api/policies/:id/deactivate", handleDeactivatePolicy);

  // Business Policies routes (RBAC+ABAC Integration)
  app.get("/api/business-policies", handleGetBusinessPolicies);
  app.post("/api/business-policies/test-scenario", handleTestBusinessScenario);
  app.get("/api/business-policies/templates", handleGetBusinessTemplates);
  app.get(
    "/api/business-policies/integration-analysis",
    handleIntegrationAnalysis,
  );

  // Access Control routes
  const accessControlRoutes = require("./routes/access-control").default;
  app.use("/api/access-control", accessControlRoutes);

  // Enhanced Access Control routes (Hybrid RBAC-ABAC)
  const enhancedAccessControlRoutes =
    require("./routes/enhanced-access-control").default;
  app.use("/api/access-control-enhanced", enhancedAccessControlRoutes);

  return app;
}
