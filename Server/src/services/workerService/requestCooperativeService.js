import { Worker } from "../../models/workers.model.js";
import { Cooperative } from "../../models/cooperative.model.js";
import { CooperativeJoinRequest } from "../../models/cooperativeJoinRequest.model.js";
import { apiError } from "../../utils/apiError.js";

const requestCooperativeService = async (
  workerId,
  cooperativeId,
  message
) => {
  // Check worker
  const worker = await Worker.findById(workerId);

  if (!worker) {
    throw new apiError(404, "Worker not found!");
  }

  if (!worker.isActive) {
    throw new apiError(403, "Worker account is inactive!");
  }

  // Worker already belongs to a cooperative
  if (worker.cooperativeId) {
    throw new apiError(
      400,
      "You are already assigned to a cooperative!"
    );
  }

  // Check cooperative
  const cooperative = await Cooperative.findById(cooperativeId);

  if (!cooperative) {
    throw new apiError(404, "Cooperative not found!");
  }

  if (!cooperative.isActive || cooperative.status !== "ACTIVE") {
    throw new apiError(400, "Cooperative is not active!");
  }

  // Check available capacity
  if (cooperative.totalWorkers >= cooperative.maxWorkers) {
    throw new apiError(
      400,
      "This cooperative currently has no available positions!"
    );
  }

  // Check existing pending request
  const existingRequest = await CooperativeJoinRequest.findOne({
    workerId,
    cooperativeId,
    status: "PENDING",
  });

  if (existingRequest) {
    throw new apiError(
      400,
      "You already have a pending request for this cooperative!"
    );
  }

  // Create join request
  const joinRequest = await CooperativeJoinRequest.create({
    workerId,
    cooperativeId,
    message: message?.trim() || null,
  });

  const createdRequest = await CooperativeJoinRequest.findById(
    joinRequest._id
  )
    .populate(
      "workerId",
      "-password -refreshToken -resetPasswordOtp -resetPasswordOtpExpiry -isResetPasswordOtpVerified"
    )
    .populate("cooperativeId");

  if (!createdRequest) {
    throw new apiError(
      500,
      "Failed to create cooperative join request!"
    );
  }

  return createdRequest;
};

export { requestCooperativeService };