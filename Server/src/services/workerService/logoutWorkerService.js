import { Worker } from "../../models/workers.model.js";
import { apiError } from "../../utils/apiError.js";

const logoutWorkerService = async (workerId) => {
  const worker = await Worker.findById(workerId);

  if (!worker) {
    throw new apiError(404, "Worker not found!");
  }

  worker.refreshToken = null;

  await worker.save({
    validateBeforeSave: false,
  });

  return true;
};

export { logoutWorkerService };
