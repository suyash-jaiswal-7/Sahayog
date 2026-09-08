import { Router } from "express";

import {
  registerCooperative,
  assignWorkerToCooperative,
} from "../controller/cooperative/cooperative.controller.js";

const cooperativeRouter = Router();

cooperativeRouter.post("/register", registerCooperative);

cooperativeRouter.patch("/:cooperativeId/workers/:workerId", assignWorkerToCooperative);

export default cooperativeRouter;