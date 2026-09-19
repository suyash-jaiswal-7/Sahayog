import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import customerRouter from "./modules/customers/customer.routes.js";
import workerRouter from "./modules/workers/worker.routes.js";
import jobRouter from "./modules/jobs/job.routes.js";
import notificationRouter from "./modules/notifications/notification.routes.js";
import matchingRouter from "./modules/matching/matching.routes.js";
import workerJobRouter from "./modules/jobs/worker-job.routes.js";
import locationRouter from "./modules/location/location.routes.js";
import cooperativeRouter from "./modules/cooperatives/cooperative.routes.js";
import cooperativeAdminRouter from "./modules/cooperative-admin/cooperative-admin.routes.js";
import systemAdminRouter from "./modules/system-admin/system-admin.routes.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Sahayog Integrated Backend API is running" });
});

app.get("/health", (req, res) => {
  res.json({ success: true, service: "sahayog-backend", timestamp: new Date().toISOString() });
});

app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/workers", workerRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/worker-jobs", workerJobRouter);
app.use("/api/v1/matching", matchingRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/location", locationRouter);
app.use("/api/v1/cooperatives", cooperativeRouter);
app.use("/api/v1/cooperative-admin", cooperativeAdminRouter);
app.use("/api/v1/system-admin", systemAdminRouter);

app.use((err, req, res, next) => {
  console.error(err);
  const status = Number(err.statusCode) || 500;
  res.status(status).json({
    success: false,
    message: status >= 500 ? "Internal server error" : err.message || "Request failed",
    errors: err.errors || [],
  });
});

export { app };
