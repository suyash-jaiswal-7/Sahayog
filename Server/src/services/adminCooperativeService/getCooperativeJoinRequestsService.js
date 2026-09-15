import { CooperativeJoinRequest } from "../../models/cooperativeJoinRequest.model.js";
import { Cooperative } from "../../models/cooperative.model.js";
import { apiError } from "../../utils/apiError.js";

const getCooperativeJoinRequestsService = async (cooperativeId) => {
  const cooperative = await Cooperative.findById(cooperativeId);

  if (!cooperative) {
    throw new apiError(404, "Cooperative not found!");
  }

  const requests = await CooperativeJoinRequest.find({
    cooperativeId,
    status: "PENDING",
  })
    .populate(
      "workerId",
      "-password -refreshToken -resetPasswordOtp -resetPasswordOtpExpiry -isResetPasswordOtpVerified"
    )
    .sort({ createdAt: -1 });

  return requests;
};

export { getCooperativeJoinRequestsService };
