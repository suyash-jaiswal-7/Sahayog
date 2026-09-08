import { registerCooperativeService } from "../../services/cooperativeService/registerCooperativeService.js";
import { assignWorkerToCooperativeService } from "../../services/cooperativeService/assignWorkerToCooperativeService.js";
import { asyncErrorHandler } from "../../utils/asyncErrorHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";

const registerCooperative = asyncErrorHandler(async (req, res) => {
  const cooperative = await registerCooperativeService(req.body);

  return res
    .status(201)
    .json(
      new apiResponse(201, cooperative, "Cooperative registered successfully!")
    );
});




const assignWorkerToCooperative = asyncErrorHandler(async (req, res) => {
  const { cooperativeId, workerId } = req.params;

  const result = await assignWorkerToCooperativeService(
    workerId,
    cooperativeId
  );

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        result,
        "Worker assigned to cooperative successfully!"
      )
    );
});

export { registerCooperative, assignWorkerToCooperative };
