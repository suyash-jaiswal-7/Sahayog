import { CooperativeJoinRequest } from "../../models/cooperativeJoinRequest.model.js";
import { Worker } from "../../models/workers.model.js";
import { Cooperative } from "../../models/cooperative.model.js";
import { apiError } from "../../utils/apiError.js";
import { assignWorkerToCooperativeService } from "../cooperativeService/assignWorkerToCooperativeService.js";

const acceptCooperativeJoinRequestService = async (
  requestId,
  adminId,
  cooperativeId
) => {
  const request = await CooperativeJoinRequest.findById(requestId);

  if (!request) {
    throw new apiError(404, "Join request not found!");
  }

  if (request.cooperativeId.toString() !== cooperativeId.toString()) {
    throw new apiError(403, "You are not authorized to manage this request!");
  }

  if (request.status !== "PENDING") {
    throw new apiError(
      400,
      `This request has already been ${request.status.toLowerCase()}!`
    );
  }

  const worker = await Worker.findById(request.workerId);

  if (!worker) {
    throw new apiError(404, "Worker not found!");
  }

  const cooperative = await Cooperative.findById(cooperativeId);

  if (!cooperative) {
    throw new apiError(404, "Cooperative not found!");
  }

  if (!cooperative.isActive || cooperative.status !== "ACTIVE") {
    throw new apiError(400, "Cooperative is not active!");
  }

  if (worker.cooperativeId) {
    throw new apiError(400, "Worker is already assigned to a cooperative!");
  }

  if (cooperative.totalWorkers >= cooperative.maxWorkers) {
    throw new apiError(
      400,
      "This cooperative has reached its maximum worker capacity!"
    );
  }

  // Reuse existing assignment logic
  await assignWorkerToCooperativeService(worker._id, cooperative._id);

  request.status = "ACCEPTED";
  request.reviewedBy = adminId;
  request.reviewedAt = new Date();

  await request.save();

  const updatedRequest = await CooperativeJoinRequest.findById(request._id)
    .populate(
      "workerId",
      "-password -refreshToken -resetPasswordOtp -resetPasswordOtpExpiry -isResetPasswordOtpVerified"
    )
    .populate("cooperativeId")
    .populate("reviewedBy", "-password -refreshToken");

  return updatedRequest;
};

export { acceptCooperativeJoinRequestService };
