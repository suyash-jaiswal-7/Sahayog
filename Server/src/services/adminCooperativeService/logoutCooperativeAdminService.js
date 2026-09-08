import { CooperativeAdmin } from "../../models/cooperativeAdmin.model.js";
import { apiError } from "../../utils/apiError.js";

const logoutCooperativeAdminService = async (adminId) => {
  const cooperativeAdmin = await CooperativeAdmin.findById(adminId);

  if (!cooperativeAdmin) {
    throw new apiError(404, "Cooperative admin not found!");
  }

  cooperativeAdmin.refreshToken = null;

  await cooperativeAdmin.save({
    validateBeforeSave: false,
  });

  return true;
};

export { logoutCooperativeAdminService };