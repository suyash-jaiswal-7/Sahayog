import { asyncErrorHandler } from "../../utils/asyncErrorHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";

import { registerCooperativeAdminService } from "../../services/adminCooperativeService/registerCooperativeAdminService.js";
import { loginCooperativeAdminService } from "../../services/adminCooperativeService/loginCooperativeAdminService.js";
import { logoutCooperativeAdminService } from "../../services/adminCooperativeService/logoutCooperativeAdminService.js";


import { getCooperativeJoinRequestsService } from "../../services/adminCooperativeService/getCooperativeJoinRequestsService.js";
import { acceptCooperativeJoinRequestService } from "../../services/adminCooperativeService/acceptCooperativeJoinRequestService.js";
import { rejectCooperativeJoinRequestService } from "../../services/adminCooperativeService/rejectCooperativeJoinRequestService.js";


const registerCooperativeAdmin = asyncErrorHandler(async (req, res) => {

  const cooperativeAdmin =
    await registerCooperativeAdminService(req.body);

  return res
    .status(201)
    .json(
      new apiResponse(
        201,
        cooperativeAdmin,
        "Cooperative admin registered successfully!"
      )
    );

});


const loginCooperativeAdmin = asyncErrorHandler(async (req, res) => {

  const {
    cooperativeAdmin,
    accessToken,
    refreshToken,
  } = await loginCooperativeAdminService(req.body);

  const options = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        { cooperativeAdmin },
        "Cooperative admin logged in successfully!"
      )
    );

});


const logoutCooperativeAdmin = asyncErrorHandler(async (req, res) => {

  await logoutCooperativeAdminService(req.cooperativeAdmin._id);

  const options = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new apiResponse(
        200,
        null,
        "Cooperative admin logged out successfully!"
      )
    );

});


const getJoinRequests = asyncErrorHandler(async (req, res) => {

  const cooperativeId = req.cooperativeAdmin.cooperativeId;

  const requests =
    await getCooperativeJoinRequestsService(cooperativeId);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        requests,
        "Cooperative join requests fetched successfully!"
      )
    );
});


const acceptJoinRequest = asyncErrorHandler(async (req, res) => {

  const { requestId } = req.params;

  const adminId = req.cooperativeAdmin._id;
  const cooperativeId = req.cooperativeAdmin.cooperativeId;

  const request =
    await acceptCooperativeJoinRequestService(
      requestId,
      adminId,
      cooperativeId
    );

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        request,
        "Worker join request accepted successfully!"
      )
    );
});


const rejectJoinRequest = asyncErrorHandler(async (req, res) => {

  const { requestId } = req.params;
  const { rejectionReason } = req.body;

  const adminId = req.cooperativeAdmin._id;
  const cooperativeId = req.cooperativeAdmin.cooperativeId;

  const request =
    await rejectCooperativeJoinRequestService(
      requestId,
      adminId,
      cooperativeId,
      rejectionReason
    );

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        request,
        "Worker join request rejected successfully!"
      )
    );
});





export {
  registerCooperativeAdmin,
  loginCooperativeAdmin,
  logoutCooperativeAdmin,
  getJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest
};