import { Worker } from "./worker.model.js";
import { apiError } from "../../shared/utils/api-error.js";
import { uploadOnCloudinary } from "../../shared/utils/cloudinary.js";
import { isValidEmail, isValidPassword, isValidIndianPhone, isValidIndianPincode } from "../../shared/utils/validation.js";

const MIN_FILE_SIZE = 100 * 1024;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const parseJson = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { throw new apiError(400, "Invalid JSON field"); }
};
const validateFile = (file, fieldName) => {
  if (!file) return;
  if (file.size < MIN_FILE_SIZE) throw new apiError(400, `${fieldName} must be at least 100 KB!`);
  if (file.size > MAX_FILE_SIZE) throw new apiError(400, `${fieldName} must not exceed 5 MB!`);
};

export const registerWorkerService = async (payload) => {
  const { fullName, email, phone, password, profilePhoto, aadhaarCard } = payload;
  const address = parseJson(payload.address, {});
  const location = parseJson(payload.location, null);
  const skills = parseJson(payload.skills, []);
  if (!fullName?.trim() || !email?.trim() || !phone?.trim() || !password?.trim()) throw new apiError(400, "Full name, email, phone and password are required!");
  const name = fullName.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim();
  if (name.length < 2 || name.length > 100) throw new apiError(400, "Full name must be between 2 and 100 characters!");
  if (!isValidEmail(normalizedEmail)) throw new apiError(400, "Invalid email format!");
  if (!isValidIndianPhone(normalizedPhone)) throw new apiError(400, "Invalid Indian mobile number.");
  if (!isValidPassword(password)) throw new apiError(400, "Password must be at least 8 characters and contain uppercase, lowercase, number and special character.");
  if (!location?.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) throw new apiError(400, "Current location is required for worker matching.");
  const [lon, lat] = location.coordinates.map(Number);
  if (![lon, lat].every(Number.isFinite) || lon < -180 || lon > 180 || lat < -90 || lat > 90) throw new apiError(400, "Invalid location coordinates.");
  if (address?.pincode && !isValidIndianPincode(String(address.pincode).trim())) throw new apiError(400, "Invalid Indian pincode.");
  if (!Array.isArray(skills) || skills.length === 0) throw new apiError(400, "At least one service is required.");
  const normalizedSkills = skills.map((skill) => ({ service: String(skill.service || "").trim(), experienceYears: Number(skill.experienceYears), skillLevel: String(skill.skillLevel || "BEGINNER").toUpperCase() })).filter(s => s.service);
  if (!normalizedSkills.length || normalizedSkills.some(s => !Number.isFinite(s.experienceYears) || s.experienceYears < 0 || !["BEGINNER","INTERMEDIATE","EXPERT"].includes(s.skillLevel))) throw new apiError(400, "Invalid worker service details.");
  const exists = await Worker.findOne({ $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] }).select("email phone").lean();
  if (exists?.email === normalizedEmail) throw new apiError(409, "Worker with this email already exists!");
  if (exists?.phone === normalizedPhone) throw new apiError(409, "Worker with this phone number already exists!");
  validateFile(profilePhoto, "Profile photo");
  validateFile(aadhaarCard, "Aadhaar card");
  let profilePhotoUrl = null, aadhaarCardUrl = null;
  if (profilePhoto?.path) { const uploaded = await uploadOnCloudinary(profilePhoto.path); if (!uploaded) throw new apiError(500, "Failed to upload profile photo!"); profilePhotoUrl = uploaded.url; }
  if (aadhaarCard?.path) { const uploaded = await uploadOnCloudinary(aadhaarCard.path); if (!uploaded) throw new apiError(500, "Failed to upload Aadhaar card!"); aadhaarCardUrl = uploaded.url; }
  const worker = await Worker.create({ fullName: name, email: normalizedEmail, phone: normalizedPhone, password, address, location: { type: "Point", coordinates: [lon, lat] }, skills: normalizedSkills, profilePhoto: profilePhotoUrl, aadhaarCard: aadhaarCardUrl, service: normalizedSkills[0].service, experienceYears: Math.max(...normalizedSkills.map(s => s.experienceYears)), skillLevel: normalizedSkills[0].skillLevel, status: "OFFLINE" });
  return Worker.findById(worker._id).select("-password -refreshToken -resetPasswordOtp -resetPasswordOtpExpiry");
};
