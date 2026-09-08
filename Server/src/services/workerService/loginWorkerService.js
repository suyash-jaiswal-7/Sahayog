import { Worker } from "../../models/workers.model.js";
import { apiError } from "../../utils/apiError.js";

const loginWorkerService = async ({ email, password, phone }) => {

  if ((!email?.trim() && !phone?.toString().trim()) || !password?.trim()) {
    throw new apiError(400, "Email or phone number and password are required!");
  }

  const worker = await Worker.findOne({
    $or: [{ email: email?.trim().toLowerCase() }, { phone: phone?.toString().trim() }],
  });

  if (!worker) {
    throw new apiError(401, "Invalid email or password!");
  }

  if (!worker.isActive) {
    throw new apiError(403, "Worker account is inactive!");
  }

  const isPasswordValid = await worker.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid email or password!");
  }

  const accessToken = worker.generateAccessToken();

  const refreshToken = worker.generateRefreshToken();

  worker.refreshToken = refreshToken;

  await worker.save({
    validateBeforeSave: false,
  });

  const loggedInWorker = await Worker.findById(worker._id).select(
    "-password -refreshToken"
  );

  if (!loggedInWorker) {
    throw new apiError(500, "Failed to fetch logged-in worker!");
  }

  return {
    worker: loggedInWorker,
    accessToken,
  };
};

export { loginWorkerService };
