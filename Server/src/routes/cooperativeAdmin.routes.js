import { Router } from "express";

import {
  registerCooperativeAdmin,
  loginCooperativeAdmin,
  logoutCooperativeAdmin,
} from "../controller/cooperative/cooperativeAdmin.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const cooperativeAdminRouter = Router();

cooperativeAdminRouter.post(
  "/register",
  registerCooperativeAdmin
);

cooperativeAdminRouter.post(
  "/login",
  loginCooperativeAdmin
);

cooperativeAdminRouter.post(
  "/logout",
  verifyJWT,
  logoutCooperativeAdmin
);

export default cooperativeAdminRouter;