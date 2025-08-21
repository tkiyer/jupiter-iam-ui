import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleVerifyToken } from "./routes/auth";
import { handleDashboardStats } from "./routes/dashboard";

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

  return app;
}
