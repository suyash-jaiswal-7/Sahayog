import { registerWorkerService } from "./worker-registration.service.js";
import { loginWorkerService } from "./worker-auth.service.js";
import { logoutWorkerService } from "./worker-logout.service.js";
import { Worker } from "./worker.model.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import { asyncErrorHandler } from "../../shared/utils/async-handler.js";
import { getCooperatives, requestToJoin, getWorkerPendingJoinRequests } from "../cooperatives/cooperative.service.js";
import { getEligibleWorker } from "./worker-eligibility.service.js";

const registerWorker = asyncErrorHandler(async (req, res) => {
  const profilePhoto = req.files?.profilePhoto?.[0];
  const aadhaarCard = req.files?.aadhaarCard?.[0];
  const worker = await registerWorkerService({ ...req.body, profilePhoto, aadhaarCard });
  return res.status(201).json(new apiResponse(201, worker, "Worker registered successfully!"));
});

const loginWorker = asyncErrorHandler(async (req, res) => {
  const { worker, accessToken, refreshToken } = await loginWorkerService(req.body);
  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", maxAge: 15 * 60 * 1000 };
  const refreshOptions = { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 };
  return res.status(200).cookie("workerAccessToken", accessToken, options).cookie("workerRefreshToken", refreshToken, refreshOptions).json(new apiResponse(200, { worker }, "Worker logged in successfully!"));
});

const logoutWorker = asyncErrorHandler(async (req, res) => {
  await logoutWorkerService(req.worker._id);
  return res.status(200).clearCookie("workerAccessToken").clearCookie("workerRefreshToken").json(new apiResponse(200, null, "Worker logged out successfully!"));
});

const getWorkerMe = asyncErrorHandler(async (req, res) => res.json(new apiResponse(200, { worker: req.worker }, "Worker profile fetched")));
const updateWorkerStatus = asyncErrorHandler(async (req, res) => {
  const { status } = req.body;
  if (!["AVAILABLE", "BUSY", "OFFLINE"].includes(status)) return res.status(400).json({ success: false, message: "Invalid worker status" });

  if (status === "AVAILABLE") {
    const eligibleWorker = await getEligibleWorker(req.worker._id, { requireAvailable: false });
    if (!eligibleWorker) {
      return res.status(403).json({
        success: false,
        message: "Join an approved active cooperative before becoming available for customer services.",
      });
    }
  }

  const worker = await Worker.findByIdAndUpdate(req.worker._id, { $set: { status } }, { new: true }).select("-password -refreshToken");
  return res.json(new apiResponse(200, { worker }, "Worker status updated"));
});

const listCooperatives = asyncErrorHandler(async (req, res) => {
  const cooperatives = await getCooperatives();
  return res.json(new apiResponse(200, { cooperatives }, "Cooperatives fetched successfully!"));
});

const getPendingCooperativeRequests = asyncErrorHandler(async (req, res) => {
  const requests = await getWorkerPendingJoinRequests(req.worker._id);
  return res.json(new apiResponse(200, { requests }, "Pending cooperative requests fetched successfully!"));
});

const requestCooperative = asyncErrorHandler(async (req, res) => {
  const request = await requestToJoin(req.worker._id, req.params.cooperativeId, req.body?.message);
  return res.status(201).json(new apiResponse(201, { request }, "Cooperative join request sent successfully!"));
});

export { registerWorker, loginWorker, logoutWorker, getWorkerMe, updateWorkerStatus, listCooperatives, getPendingCooperativeRequests, requestCooperative };
