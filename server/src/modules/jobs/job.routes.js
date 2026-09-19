import express from "express";
import {
  verifyCustomerJWT,
} from "../../shared/middleware/auth.middleware.js";
import {
  requireCustomer,
} from "../../shared/middleware/role.middleware.js";
import {
  createJob,
  listCustomerJobs,
  cancelJob,
} from "./job.controller.js";

const router = express.Router();

router.use(
  verifyCustomerJWT,
  requireCustomer
);

router.post(
  "/create",
  createJob
);

router.get(
  "/mine",
  listCustomerJobs
);

router.patch(
  "/:id/cancel",
  cancelJob
);

export default router;
