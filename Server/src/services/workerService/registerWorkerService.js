import { Worker } from "../../models/workers.model.js";
import { apiError } from "../../utils/apiError.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

import {
  isValidEmail,
  isValidPassword,
  isValidIndianPhone,
  isValidIndianPincode,
} from "../../utils/validation.js";




const MIN_FILE_SIZE = 100 * 1024; // 100 KB
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const validateFile = (file, fieldName) => {
  if (!file) return;

  if (file.size < MIN_FILE_SIZE) {
    throw new apiError(
      400,
      `${fieldName} must be at least 100 KB!`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new apiError(
      400,
      `${fieldName} must not exceed 5 MB!`
    );
  }
};

const registerWorkerService = async ({
  fullName,
  email,
  phone,
  password,
  address,
  location,
  profilePhoto,
  aadhaarCard,
}) => {
  
  if (
    !fullName?.trim() ||
    !email?.trim() ||
    !phone?.trim() ||
    !password?.trim()
  ) {
    throw new apiError(
      400,
      "Full name, email, phone and password are required!"
    );
  }

  
  const trimmedFullName = fullName.trim();

  if (
    trimmedFullName.length < 2 ||
    trimmedFullName.length > 100
  ) {
    throw new apiError(
      400,
      "Full name must be between 2 and 100 characters!"
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

  
  if (!isValidPassword(password)) {
    throw new apiError(
      400,
      "Password must be at least 8 characters and contain uppercase, lowercase, number and special character."
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
      throw new apiError(
        400,
        "Invalid location coordinates."
      );
    }
  }


  const existingWorker = await Worker.findOne({
    $or: [
      { email: normalizedEmail },
      { phone: normalizedPhone },
    ],
  });

  if (existingWorker) {
    if (existingWorker.email === normalizedEmail) {
      throw new apiError(
        409,
        "Worker with this email already exists!"
      );
    }

    if (existingWorker.phone === normalizedPhone) {
      throw new apiError(
        409,
        "Worker with this phone number already exists!"
      );
    }
  }

  validateFile(profilePhoto, "Profile photo");
  validateFile(aadhaarCard, "Aadhaar card");



  let profilePhotoUrl = null;
  if (profilePhoto?.path) {
    const uploadedProfilePhoto = await uploadOnCloudinary(
      profilePhoto.path
    );

    if (!uploadedProfilePhoto) {
      throw new apiError(
        500,
        "Failed to upload profile photo!"
      );
    }

    profilePhotoUrl = uploadedProfilePhoto.url;
  }

  

  let aadhaarCardUrl = null;
  if (aadhaarCard?.path) {
    const uploadedAadhaar = await uploadOnCloudinary(
      aadhaarCard.path
    );

    if (!uploadedAadhaar) {
      throw new apiError(
        500,
        "Failed to upload Aadhaar card!"
      );
    }

    aadhaarCardUrl = uploadedAadhaar.url;
  }

  const worker = await Worker.create({
    fullName: trimmedFullName,
    email: normalizedEmail,
    phone: normalizedPhone,
    password,
    address,
    location,
    profilePhoto: profilePhotoUrl,
    aadhaarCard: aadhaarCardUrl,
  });

  
  const createdWorker = await Worker.findById(
    worker._id
  ).select("-password -refreshToken");

  if (!createdWorker) {
    throw new apiError(
      500,
      "Failed to fetch created worker!"
    );
  }

  return createdWorker;
};



export { registerWorkerService };