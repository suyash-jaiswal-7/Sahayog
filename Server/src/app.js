import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import customerRouter from "./routes/customers.route.js";
import workerRouter from "./routes/workers.route.js";
import cooperativeRouter from "./routes/cooperative.route.js";
import cooperativeAdminRouter from "./routes/cooperativeAdmin.routes.js";

const app = express();


app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8000"],
    credentials: true,
  })
);

app.use(express.json({ limit: "15kb" }));
app.use(express.urlencoded({ extended: true, limit: "15kb" }));
app.use(express.static("public"));
app.use(cookieParser());


app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Sahayog Backend API is running",
  });
});


app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/workers", workerRouter);
app.use("/api/v1/cooperatives", cooperativeRouter);
app.use("/api/v1/cooperative-admins", cooperativeAdminRouter);

export { app };