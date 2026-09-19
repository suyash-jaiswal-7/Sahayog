import { Router } from "express";

import {
  loginWorker,
  registerWorker,
  logoutWorker,
  getWorkerMe,
  updateWorkerStatus,
  listCooperatives,
  getPendingCooperativeRequests,
  requestCooperative
} from "./worker.controller.js";

import { multerStorage } from "../../shared/middleware/upload.middleware.js";
import { verifyWorkerJWT } from "../../shared/middleware/auth.middleware.js";
import { requireWorker } from "../../shared/middleware/role.middleware.js";

const router = Router();

router.post(
  "/register",
  multerStorage.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "aadhaarCard", maxCount: 1 }
  ]),
  registerWorker
);

router.post("/login", loginWorker);

router.use(verifyWorkerJWT, requireWorker);

router.get("/me", getWorkerMe);

router.get("/cooperatives", listCooperatives);

router.get(
  "/cooperative-requests",
  getPendingCooperativeRequests
);

router.post(
  "/cooperatives/:cooperativeId/request",
  requestCooperative
);

router.patch("/status", updateWorkerStatus);

router.post("/logout", logoutWorker);

export default router;