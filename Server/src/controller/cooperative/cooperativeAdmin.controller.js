import { asyncErrorHandler } from "../../utils/asyncErrorHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";

import { registerCooperativeAdminService } from "../../services/adminCooperativeService/registerCooperativeAdminService.js";
import { loginCooperativeAdminService } from "../../services/adminCooperativeService/loginCooperativeAdminService.js";
import { logoutCooperativeAdminService } from "../../services/adminCooperativeService/logoutCooperativeAdminService.js";


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


export {
  registerCooperativeAdmin,
  loginCooperativeAdmin,
  logoutCooperativeAdmin,
};