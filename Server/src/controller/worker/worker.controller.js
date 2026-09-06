import { registerWorkerService } from "../../services/workerService/registerWorkerService.js";
import { loginWorkerService } from "../../services/workerService/loginWorkerService.js";
import { logoutWorkerService } from "../../services/workerService/logoutWorkerService.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncErrorHandler } from "../../utils/asyncErrorHandler.js";



const registerWorker = asyncErrorHandler(async (req, res) => {
  const profilePhoto = req.files?.profilePhoto?.[0];
  const aadhaarCard = req.files?.aadhaarCard?.[0];

  const worker = await registerWorkerService({
    ...req.body,
    profilePhoto,
    aadhaarCard,
  });

  return res
    .status(201)
    .json(new apiResponse(201, worker, "Worker registered successfully!"));
});



const loginWorker = asyncErrorHandler(async (req, res) => {
  const { worker, accessToken, refreshToken } = await loginWorkerService(
    req.body
  );

  const options = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new apiResponse(200, { worker }, "Worker logged in successfully!"));
});



const logoutWorker = asyncErrorHandler(async (req, res) => {
  await logoutWorkerService(req.worker._id);

  const options = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, null, "Worker logged out successfully!"));
});


export { registerWorker, loginWorker, logoutWorker };