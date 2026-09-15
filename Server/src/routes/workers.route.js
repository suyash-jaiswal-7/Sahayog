import { Router } from "express";
import {
  getCooperatives,
  loginWorker,
  logoutWorker,
  registerWorker,
  requestToJoinCooperative,
} from "../controller/worker/worker.controller.js";
import { multerStorage } from "../middleware/multerStorage.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const workerRouter = Router();



workerRouter.post(
  "/register",
  multerStorage.fields([
    {
      name: "profilePhoto",
      maxCount: 1,
    },
    {
      name: "aadhaarCard",
      maxCount: 1,
    },
  ]),
  registerWorker
);

workerRouter.post("/login", loginWorker);

workerRouter.post("/logout", verifyJWT, logoutWorker);

// Get all active cooperatives
workerRouter.get("/cooperatives", verifyJWT, getCooperatives );

// Worker requests to join a cooperative
workerRouter.post("/cooperatives/:cooperativeId/request", verifyJWT, requestToJoinCooperative );




export default workerRouter;