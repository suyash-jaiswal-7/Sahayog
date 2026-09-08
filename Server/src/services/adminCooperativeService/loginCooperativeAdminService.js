import { CooperativeAdmin } from "../../models/cooperativeAdmin.model.js";
import { apiError } from "../../utils/apiError.js";

const loginCooperativeAdminService = async ({ email, password }) => {
  if (!email?.trim() || !password?.trim()) {
    throw new apiError(400, "Email and password are required!");
  }

  const cooperativeAdmin = await CooperativeAdmin.findOne({
    email: email.trim().toLowerCase(),
  });

  if (!cooperativeAdmin) {
    throw new apiError(401, "Invalid email or password!");
  }

  if (!cooperativeAdmin.isActive) {
    throw new apiError(403, "Cooperative admin account is inactive!");
  }

  const isPasswordValid =
    await cooperativeAdmin.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid email or password!");
  }

  const accessToken = cooperativeAdmin.generateAccessToken();
  const refreshToken = cooperativeAdmin.generateRefreshToken();

  cooperativeAdmin.refreshToken = refreshToken;

  await cooperativeAdmin.save({
    validateBeforeSave: false,
  });

  const loggedInAdmin = await CooperativeAdmin.findById(
    cooperativeAdmin._id
  ).select("-password -refreshToken");

  if (!loggedInAdmin) {
    throw new apiError(500, "Failed to fetch logged-in cooperative admin!");
  }

  return {
    cooperativeAdmin: loggedInAdmin,
    accessToken,
    refreshToken,
  };
};

export { loginCooperativeAdminService };