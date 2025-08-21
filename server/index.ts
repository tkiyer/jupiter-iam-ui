import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleVerifyToken } from "./routes/auth";
import { handleDashboardStats } from "./routes/dashboard";
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
  handleGetUserActivity
} from "./routes/users";

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

  app.get("/api/demo", handleDemo);

  // IAM Authentication routes
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/verify", handleVerifyToken);

  // IAM Dashboard routes
  app.get("/api/dashboard/stats", handleDashboardStats);

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

  return app;
}
