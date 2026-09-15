import { Router } from "express";

import {
  registerCooperativeAdmin,
  loginCooperativeAdmin,
  logoutCooperativeAdmin,
  getJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
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


// Get pending worker join requests
cooperativeAdminRouter.get(
  "/join-requests",
  verifyJWT,
  getJoinRequests
);

// Accept worker join request
cooperativeAdminRouter.patch(
  "/join-requests/:requestId/accept",
  verifyJWT,
  acceptJoinRequest
);

// Reject worker join request
cooperativeAdminRouter.patch(
  "/join-requests/:requestId/reject",
  verifyJWT,
  rejectJoinRequest
);


export default cooperativeAdminRouter;