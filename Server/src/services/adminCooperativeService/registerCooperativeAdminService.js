import { CooperativeAdmin } from "../../models/cooperativeAdmin.model.js";
import { Cooperative } from "../../models/cooperative.model.js";
import { apiError } from "../../utils/apiError.js";
import {
  isValidEmail,
  isValidPassword,
  isValidIndianPhone,
} from "../../utils/validation.js";

const registerCooperativeAdminService = async ({
  fullName,
  email,
  phone,
  password,
  cooperativeId,
}) => {
  if (
    !fullName?.trim() ||
    !email?.trim() ||
    !phone?.trim() ||
    !password?.trim() ||
    !cooperativeId
  ) {
    throw new apiError(
      400,
      "Full name, email, phone, password and cooperative ID are required!"
    );
  }

  const trimmedFullName = fullName.trim();

  if (trimmedFullName.length < 2 || trimmedFullName.length > 100) {
    throw new apiError(400, "Full name must be between 2 and 100 characters!");
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    throw new apiError(400, "Invalid email format!");
  }

  const normalizedPhone = phone.trim();

  if (!isValidIndianPhone(normalizedPhone)) {
    throw new apiError(
      400,
      "Invalid Indian mobile number. Enter a valid 10-digit number starting with 6, 7, 8 or 9."
    );
  }

  if (!isValidPassword(password)) {
    throw new apiError(
      400,
      "Password must be at least 8 characters and contain uppercase, lowercase, number and special character."
    );
  }

  // Check cooperative
  const cooperative = await Cooperative.findById(cooperativeId);

  if (!cooperative) {
    throw new apiError(404, "Cooperative not found!");
  }

  if (!cooperative.isActive || cooperative.status !== "ACTIVE") {
    throw new apiError(400, "Cooperative is not active!");
  }

  // Check duplicate admin
  const existingAdmin = await CooperativeAdmin.findOne({
    $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
  });

  if (existingAdmin) {
    if (existingAdmin.email === normalizedEmail) {
      throw new apiError(
        409,
        "Cooperative admin with this email already exists!"
      );
    }

    if (existingAdmin.phone === normalizedPhone) {
      throw new apiError(
        409,
        "Cooperative admin with this phone number already exists!"
      );
    }
  }

  const cooperativeAdmin = await CooperativeAdmin.create({
    fullName: trimmedFullName,
    email: normalizedEmail,
    phone: normalizedPhone,
    password,
    cooperativeId: cooperative._id,
  });

  const createdAdmin = await CooperativeAdmin.findById(
    cooperativeAdmin._id
  ).select("-password -refreshToken");

  if (!createdAdmin) {
    throw new apiError(500, "Failed to fetch created cooperative admin!");
  }

  return createdAdmin;
};

export { registerCooperativeAdminService };
