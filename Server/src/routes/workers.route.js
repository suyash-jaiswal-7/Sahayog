import { Router } from "express";
import { loginWorker, logoutWorker, registerWorker } from "../controller/worker/worker.controller.js";
import { multerStorage } from "../middleware/multerStorage.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js"

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

export default workerRouter;
