import { Cooperative } from "../../models/cooperative.model.js";
import { apiError } from "../../utils/apiError.js";
import {
  isValidEmail,
  isValidIndianPhone,
  isValidIndianPincode,
} from "../../utils/validation.js";

const registerCooperativeService = async ({
  name,
  registrationNumber,
  description,
  email,
  phone,
  address,
  location,
}) => {
  if (
    !name?.trim() ||
    !registrationNumber?.trim() ||
    !email?.trim() ||
    !phone?.trim()
  ) {
    throw new apiError(
      400,
      "Name, registration number, email and phone are required!"
    );
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2 || trimmedName.length > 150) {
    throw new apiError(
      400,
      "Cooperative name must be between 2 and 150 characters!"
    );
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

  if (address?.pincode) {
    const pincode = address.pincode.trim();

    if (!isValidIndianPincode(pincode)) {
      throw new apiError(
        400,
        "Invalid Indian pincode. Pincode must be a valid 6-digit number."
      );
    }
  }

  if (location?.coordinates) {
    if (
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      throw new apiError(
        400,
        "Location coordinates must contain longitude and latitude."
      );
    }

    const [longitude, latitude] = location.coordinates;

    if (
      typeof longitude !== "number" ||
      typeof latitude !== "number" ||
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      throw new apiError(400, "Invalid location coordinates.");
    }
  }

  const existingCooperative = await Cooperative.findOne({
    $or: [
      { email: normalizedEmail },
      { phone: normalizedPhone },
      { registrationNumber: registrationNumber.trim() },
    ],
  });

  if (existingCooperative) {
    if (existingCooperative.email === normalizedEmail) {
      throw new apiError(
        409,
        "Cooperative with this email already exists!"
      );
    }

    if (existingCooperative.phone === normalizedPhone) {
      throw new apiError(
        409,
        "Cooperative with this phone number already exists!"
      );
    }

    if (
      existingCooperative.registrationNumber ===
      registrationNumber.trim()
    ) {
      throw new apiError(
        409,
        "Cooperative with this registration number already exists!"
      );
    }
  }

  const cooperative = await Cooperative.create({
    name: trimmedName,
    registrationNumber: registrationNumber.trim(),
    description: description?.trim() || null,
    email: normalizedEmail,
    phone: normalizedPhone,
    address,
    location,
  });

  const createdCooperative = await Cooperative.findById(
    cooperative._id
  );

  if (!createdCooperative) {
    throw new apiError(
      500,
      "Failed to fetch created cooperative!"
    );
  }

  return createdCooperative;
};

export { registerCooperativeService };