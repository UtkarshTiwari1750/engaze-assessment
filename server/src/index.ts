import express from "express";
import cors from "cors";
import { DEFAULT_PORT } from "./constants/global.constants";
import { env } from "./config/env";
import prisma from "./config/prisma";
import { errorHandler } from "./middleware/error.middleware";

// Import routes
import authRoutes from "./modules/auth/auth.routes";
import resumeRoutes from "./modules/resume/resume.routes";
import templateRoutes from "./modules/template/template.routes";
import sharingRoutes from "./modules/sharing/sharing.routes";
import pdfRoutes from "./modules/pdf/pdf.routes";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging in development
if (env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Resume Builder API", status: "healthy" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api", resumeRoutes);
app.use("/api", templateRoutes);
app.use("/api", sharingRoutes);
app.use("/api", pdfRoutes);

// Global error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

const port = env.PORT || DEFAULT_PORT;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
