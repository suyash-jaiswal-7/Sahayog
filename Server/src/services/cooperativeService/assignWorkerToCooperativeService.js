import { Worker } from "../../models/workers.model.js";
import { Cooperative } from "../../models/cooperative.model.js";
import { apiError } from "../../utils/apiError.js";

const assignWorkerToCooperativeService = async (workerId, cooperativeId) => {
  const worker = await Worker.findById(workerId);

  if (!worker) {
    throw new apiError(404, "Worker not found!");
  }

  if (worker.cooperativeId) {
    throw new apiError(400, "Worker is already assigned to a cooperative!");
  }

  const cooperative = await Cooperative.findById(cooperativeId);

  if (!cooperative) {
    throw new apiError(404, "Cooperative not found!");
  }

  if (!cooperative.isActive || cooperative.status !== "ACTIVE") {
    throw new apiError(400, "Cooperative is not active!");
  }

  worker.cooperativeId = cooperative._id;

  cooperative.totalWorkers += 1;

  await worker.save({
    validateBeforeSave: false,
  });

  await cooperative.save({
    validateBeforeSave: false,
  });

  const updatedWorker = await Worker.findById(worker._id).select(
    "-password -refreshToken -resetPasswordOtp -resetPasswordOtpExpiry -isResetPasswordOtpVerified"
  );

  return {
    worker: updatedWorker,
    cooperative,
  };
};

export { assignWorkerToCooperativeService };
