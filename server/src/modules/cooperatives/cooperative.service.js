import mongoose from "mongoose";
import Cooperative from "./cooperative.model.js";
import { Worker } from "../workers/worker.model.js";
import Job from "../jobs/job.model.js";
import { CooperativeJoinRequest } from "./cooperative-join-request.model.js";
import { apiError } from "../../shared/utils/api-error.js";
import { isValidEmail, isValidIndianPhone, isValidIndianPincode } from "../../shared/utils/validation.js";

const SAFE_WORKER_FIELDS = "fullName email phone address location profilePhoto cooperativeId status skills service skillLevel experienceYears totalJobsCompleted averageRating isActive createdAt updatedAt";
const ALLOWED_STATUSES = ["AVAILABLE", "BUSY", "OFFLINE", "SUSPENDED"];

const validateCooperativePayload = ({ name, registrationNumber, email, phone, address, location }) => {
  if (!name?.trim() || !registrationNumber?.trim() || !email?.trim() || !phone?.trim()) {
    throw new apiError(400, "Name, registration number, email and phone are required!");
  }
  if (name.trim().length < 2 || name.trim().length > 150) throw new apiError(400, "Cooperative name must be between 2 and 150 characters!");
  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) throw new apiError(400, "Invalid email format!");
  const normalizedPhone = phone.trim();
  if (!isValidIndianPhone(normalizedPhone)) throw new apiError(400, "Invalid Indian mobile number.");
  if (address?.pincode && !isValidIndianPincode(String(address.pincode).trim())) throw new apiError(400, "Invalid Indian pincode.");
  if (!Array.isArray(location?.coordinates) || location.coordinates.length !== 2) throw new apiError(400, "Cooperative location coordinates are required.");
  const [lon, lat] = location.coordinates.map(Number);
  if (!Number.isFinite(lon) || !Number.isFinite(lat) || lon < -180 || lon > 180 || lat < -90 || lat > 90) throw new apiError(400, "Invalid cooperative location coordinates.");
  return { normalizedEmail, normalizedPhone, normalizedRegistrationNumber: registrationNumber.trim(), coordinates: [lon, lat] };
};

export const registerCooperative = async (payload) => {
  const { normalizedEmail, normalizedPhone, normalizedRegistrationNumber, coordinates } = validateCooperativePayload(payload);
  const existing = await Cooperative.findOne({ $or: [{ email: normalizedEmail }, { "contact.email": normalizedEmail }, { phone: normalizedPhone }, { "contact.phone": normalizedPhone }, { registrationNumber: normalizedRegistrationNumber }] }).select("name registrationNumber contact email phone").lean();
  if (existing) throw new apiError(409, "A cooperative with the same registration details already exists!");

  const cooperative = await Cooperative.create({
    name: payload.name.trim(),
    registrationNumber: normalizedRegistrationNumber,
    type: payload.type || "LABOUR_COOPERATIVE",
    description: payload.description?.trim() || null,
    contact: { phone: normalizedPhone, email: normalizedEmail },
    address: payload.address || {},
    location: { type: "Point", coordinates },
    // New cooperatives must be verified by the System Admin before they can log in
    // or appear in the worker cooperative directory.
    status: "PENDING",
    isActive: false,
    maxWorkers: Math.max(Number(payload.maxWorkers) || 50, 1),
  });
  return Cooperative.findById(cooperative._id).lean();
};

export const getCooperatives = async () => {
  const cooperatives = await Cooperative.find({ isActive: true, status: "ACTIVE" })
    .select("name registrationNumber type description contact address location services serviceCategories totalWorkers maxWorkers activeWorkers averageRating")
    
    .sort({ name: 1 })
    .lean();
  return cooperatives.map((cooperative) => ({
    ...cooperative,
    availableSlots: Math.max((cooperative.maxWorkers || 0) - (cooperative.totalWorkers || 0), 0),
  }));
};

export const requestToJoin = async (workerId, cooperativeId, message) => {
  if (!mongoose.isValidObjectId(cooperativeId)) throw new apiError(400, "Invalid cooperative id!");
  const worker = await Worker.findById(workerId).select("_id cooperativeId isActive");
  if (!worker) throw new apiError(404, "Worker not found!");
  if (!worker.isActive) throw new apiError(403, "Worker account is inactive!");
  if (worker.cooperativeId) throw new apiError(400, "You are already assigned to a cooperative!");

  const cooperative = await Cooperative.findOne({ _id: cooperativeId, isActive: true, status: "ACTIVE" }).select("_id totalWorkers maxWorkers");
  if (!cooperative) throw new apiError(404, "Cooperative not found or inactive!");
  if (cooperative.totalWorkers >= cooperative.maxWorkers) throw new apiError(400, "This cooperative currently has no available positions!");

  try {
    const request = await CooperativeJoinRequest.create({ workerId, cooperativeId, message: message?.trim() || null });
    return await CooperativeJoinRequest.findById(request._id)
      .populate("workerId", SAFE_WORKER_FIELDS)
      .populate("cooperativeId", "name registrationNumber type status maxWorkers totalWorkers")
      .lean();
  } catch (error) {
    if (error?.code === 11000) throw new apiError(409, "You already have a pending request for this cooperative!");
    throw error;
  }
};

export const getWorkerPendingJoinRequests = async (workerId) => {
  return CooperativeJoinRequest.find({
    workerId,
    status: "PENDING",
  })
    .select("_id workerId cooperativeId message status createdAt")
    .populate("cooperativeId", "name registrationNumber type status maxWorkers totalWorkers")
    .sort({ createdAt: -1 })
    .lean();
};

export const getDashboard = async (cooperativeId) => {
  const cooperative = await Cooperative.findById(cooperativeId).select("name registrationNumber type description contact address location services serviceCategories emergencyServiceEnabled status totalWorkers maxWorkers activeWorkers verifiedWorkers totalJobsCompleted averageRating welfareFund demandForecastEnabled isActive createdAt updatedAt").lean();
  if (!cooperative) throw new apiError(404, "Cooperative not found!");

  const workerIds = await Worker.find({ cooperativeId }).distinct("_id");
  const [workerStats, pendingJoinRequests, activeRequests, completedJobs] = await Promise.all([
    Worker.aggregate([
      { $match: { cooperativeId: new mongoose.Types.ObjectId(cooperativeId), isActive: true } },
      { $group: {
        _id: null,
        totalWorkers: { $sum: 1 },
        availableWorkers: { $sum: { $cond: [{ $eq: ["$status", "AVAILABLE"] }, 1, 0] } },
        busyWorkers: { $sum: { $cond: [{ $eq: ["$status", "BUSY"] }, 1, 0] } },
        offlineWorkers: { $sum: { $cond: [{ $eq: ["$status", "OFFLINE"] }, 1, 0] } },
        suspendedWorkers: { $sum: { $cond: [{ $eq: ["$status", "SUSPENDED"] }, 1, 0] } },
        totalJobsCompleted: { $sum: "$totalJobsCompleted" },
        ratingSum: { $sum: "$averageRating" },
        ratedWorkers: { $sum: { $cond: [{ $gt: ["$averageRating", 0] }, 1, 0] } },
      } },
    ]),
    (await import("./cooperative-join-request.model.js")).CooperativeJoinRequest.countDocuments({ cooperativeId, status: "PENDING" }),
    Job.countDocuments({ assignedWorkerId: { $in: workerIds }, status: { $in: ["ASSIGNED", "IN_PROGRESS"] } }),
    Job.countDocuments({ assignedWorkerId: { $in: workerIds }, status: "COMPLETED" }),
  ]);

  const stats = workerStats[0] || { totalWorkers: 0, availableWorkers: 0, busyWorkers: 0, offlineWorkers: 0, suspendedWorkers: 0, totalJobsCompleted: 0, ratingSum: 0, ratedWorkers: 0 };
  const averageRating = stats.ratedWorkers ? Number((stats.ratingSum / stats.ratedWorkers).toFixed(2)) : 0;
  await Cooperative.updateOne({ _id: cooperativeId }, { $set: { totalWorkers: stats.totalWorkers, activeWorkers: stats.availableWorkers + stats.busyWorkers, verifiedWorkers: 0, totalJobsCompleted: stats.totalJobsCompleted, averageRating } });

  return {
    cooperative: { ...cooperative, totalWorkers: stats.totalWorkers, activeWorkers: stats.availableWorkers + stats.busyWorkers, verifiedWorkers: 0, totalJobsCompleted: stats.totalJobsCompleted, averageRating },
    stats: {
      totalWorkers: stats.totalWorkers,
      availableWorkers: stats.availableWorkers,
      busyWorkers: stats.busyWorkers,
      offlineWorkers: stats.offlineWorkers,
      suspendedWorkers: stats.suspendedWorkers,
      activeWorkers: stats.availableWorkers + stats.busyWorkers,
      pendingJoinRequests,
      activeRequests,
      completedJobs,
      totalJobsCompleted: stats.totalJobsCompleted,
      averageRating,
      availableSlots: Math.max((cooperative.maxWorkers || 0) - stats.totalWorkers, 0),
    },
  };
};

export const getWorkers = async (cooperativeId) => {
  const cooperative = await Cooperative.findById(cooperativeId).select("name registrationNumber status maxWorkers totalWorkers").lean();
  if (!cooperative) throw new apiError(404, "Cooperative not found!");
  const workers = await Worker.find({ cooperativeId, isActive: true }).select(SAFE_WORKER_FIELDS).sort({ createdAt: -1 }).lean();
  return { cooperative, workers };
};

export const getWorker = async (cooperativeId, workerId) => {
  if (!mongoose.isValidObjectId(workerId)) throw new apiError(400, "Invalid worker id!");
  const worker = await Worker.findOne({ _id: workerId, cooperativeId }).select(SAFE_WORKER_FIELDS).lean();
  if (!worker) throw new apiError(404, "Worker not found in your cooperative!");
  return worker;
};

export const updateWorkerStatus = async (cooperativeId, workerId, status) => {
  if (!ALLOWED_STATUSES.includes(status)) throw new apiError(400, `Invalid worker status. Allowed values: ${ALLOWED_STATUSES.join(", ")}`);
  const worker = await Worker.findOneAndUpdate({ _id: workerId, cooperativeId, isActive: true }, { $set: { status } }, { new: true, runValidators: true }).select(SAFE_WORKER_FIELDS).lean();
  if (!worker) throw new apiError(404, "Worker not found in your cooperative!");
  return worker;
};

export const acceptJoinRequest = async (requestId, adminId, cooperativeId) => {
  const request = await CooperativeJoinRequest.findOne({ _id: requestId, cooperativeId, status: "PENDING" });
  if (!request) throw new apiError(404, "Pending join request not found in your cooperative!");
  const cooperative = await Cooperative.findOne({ _id: cooperativeId, isActive: true, status: "ACTIVE" }).select("_id totalWorkers maxWorkers");
  if (!cooperative) throw new apiError(404, "Cooperative not found or inactive!");
  if (cooperative.totalWorkers >= cooperative.maxWorkers) throw new apiError(409, "This cooperative has reached its maximum worker capacity!");

  const worker = await Worker.findOneAndUpdate({ _id: request.workerId, isActive: true, cooperativeId: null }, { $set: { cooperativeId } }, { new: true, runValidators: true }).select(SAFE_WORKER_FIELDS);
  if (!worker) throw new apiError(409, "Worker is no longer available for cooperative assignment!");

  const counter = await Cooperative.findOneAndUpdate({ _id: cooperativeId, isActive: true, status: "ACTIVE", $expr: { $lt: ["$totalWorkers", "$maxWorkers"] } }, { $inc: { totalWorkers: 1 } }, { new: true });
  if (!counter) {
    await Worker.updateOne({ _id: worker._id, cooperativeId }, { $set: { cooperativeId: null } });
    throw new apiError(409, "This cooperative has reached its maximum worker capacity!");
  }

  const updatedRequest = await CooperativeJoinRequest.findOneAndUpdate(
    { _id: request._id, cooperativeId, status: "PENDING" },
    { $set: { status: "APPROVED", reviewedBy: adminId, reviewedAt: new Date() } },
    { new: true }
  ).populate("workerId", SAFE_WORKER_FIELDS).populate("cooperativeId").populate("reviewedBy", "fullName email");

  if (!updatedRequest) {
    await Worker.updateOne({ _id: worker._id, cooperativeId }, { $set: { cooperativeId: null } });
    await Cooperative.updateOne({ _id: cooperativeId, totalWorkers: { $gt: 0 } }, { $inc: { totalWorkers: -1 } });
    throw new apiError(409, "The join request was already processed.");
  }
  return updatedRequest;
};

export const rejectJoinRequest = async (requestId, adminId, cooperativeId, rejectionReason) => {
  if (!rejectionReason?.trim()) throw new apiError(400, "Rejection reason is required!");
  const updated = await CooperativeJoinRequest.findOneAndUpdate(
    { _id: requestId, cooperativeId, status: "PENDING" },
    { $set: { status: "REJECTED", reviewedBy: adminId, reviewedAt: new Date(), rejectionReason: rejectionReason.trim() } },
    { new: true }
  ).populate("workerId", SAFE_WORKER_FIELDS).populate("cooperativeId").populate("reviewedBy", "fullName email");
  if (!updated) throw new apiError(404, "Pending join request not found in your cooperative!");
  return updated;
};

export const getJoinRequests = async (cooperativeId) => {
  return CooperativeJoinRequest.find({ cooperativeId, status: "PENDING" }).populate("workerId", SAFE_WORKER_FIELDS).sort({ createdAt: -1 }).lean();
};
