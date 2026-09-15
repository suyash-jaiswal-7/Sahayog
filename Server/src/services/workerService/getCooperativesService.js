import { Cooperative } from "../../models/cooperative.model.js";
import { Service } from "../../models/service.model.js";
import { apiError } from "../../utils/apiError.js";

const getCooperativesService = async () => {
  const cooperatives = await Cooperative.find({
    isActive: true,
    status: "ACTIVE",
  })
    .select(
      "name registrationNumber description email phone address location serviceCategories emergencyServiceEnabled totalWorkers maxWorkers activeWorkers verifiedWorkers averageRating"
    )
    .populate("serviceCategories", "name");

  if (!cooperatives) {
    throw new apiError(500, "Failed to fetch cooperatives!");
  }

  const result = cooperatives.map((cooperative) => ({
    ...cooperative.toObject(),
    availableSlots: Math.max(
      cooperative.maxWorkers - cooperative.totalWorkers,
      0
    ),
  }));

  return result;
};

export { getCooperativesService };