import express from "express";
import {
  verifyWorkerJWT,
} from "../../shared/middleware/auth.middleware.js";
import {
  requireWorker,
} from "../../shared/middleware/role.middleware.js";
import {
  listWorkerRequests,
  listWorkerActiveJobs,
  acceptJob,
  rejectJob,
} from "./job.controller.js";

const router = express.Router();

router.use(
  verifyWorkerJWT,
  requireWorker
);

router.get(
  "/requests",
  listWorkerRequests
);

router.get(
  "/active",
  listWorkerActiveJobs
);

router.post(
  "/:id/accept",
  acceptJob
);

router.post(
  "/:id/reject",
  rejectJob
);

export default router;
