import { CooperativeJoinRequest } from "../../models/cooperativeJoinRequest.model.js";
import { apiError } from "../../utils/apiError.js";

const rejectCooperativeJoinRequestService = async (
  requestId,
  adminId,
  cooperativeId,
  rejectionReason
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

  if (!rejectionReason?.trim()) {
    throw new apiError(400, "Rejection reason is required!");
  }

  request.status = "REJECTED";
  request.reviewedBy = adminId;
  request.reviewedAt = new Date();
  request.rejectionReason = rejectionReason.trim();

  await request.save();

  const updatedRequest = await CooperativeJoinRequest.findById(request._id)
    .populate(
      "workerId",
      "-password -refreshToken -resetPasswordOtp -resetPasswordOtpExpiry -isResetPasswordOtpVerified"
    )
    .populate("cooperativeId")
    .populate("reviewedBy", "-password -refreshToken");

  if (!updatedRequest) {
    throw new apiError(500, "Failed to fetch rejected join request!");
  }

  return updatedRequest;
};

export { rejectCooperativeJoinRequestService };
