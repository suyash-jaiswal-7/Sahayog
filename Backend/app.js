import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import jobRoutes from "./routes/jobRoutes.js";
import matchingRoutes from "./routes/matchingRoutes.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Worker Matching API Running",
  });
});

app.use(
  "/api/jobs",
  jobRoutes
);

app.use(
  "/api/matching",
  matchingRoutes
);

export default app;