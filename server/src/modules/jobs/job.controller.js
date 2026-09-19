import mongoose from "mongoose";
import Job from "./job.model.js";
import { Worker } from "../workers/worker.model.js";
import { findBestWorkers, calculateDistanceKm } from "../matching/worker-matching.service.js";
import { reverseGeocode } from "../location/location.service.js";
import { notifyWorkers, notifyWorkersRequestTaken } from "../notifications/notification-delivery.service.js";
import { getEligibleWorker } from "../workers/worker-eligibility.service.js";

const FIXED_RADIUS_KM = 10;
const SERVICES = ["Plumbing", "Electrical", "Carpentry", "Painting", "Cleaning"];
const PUBLIC_WORKER_PROJECTION = "fullName phone email profilePhoto averageRating experienceYears skills";

const normalizeService = (value) => {
  const input = String(value || "").trim().toLowerCase();
  return SERVICES.find((service) => service.toLowerCase() === input) || null;
};

const sanitizeAddress = (address) => {
  if (!address || typeof address !== "object") return { formatted: "Location unavailable" };
  return {
    formatted: address.formatted || "Location detected",
    area: address.area || null,
    city: address.city || null,
    state: address.state || null,
    country: address.country || null,
    pincode: address.pincode || null,
  };
};

const sanitizeWorker = (worker) => {
  if (!worker) return null;
  return {
    id: String(worker._id || worker.id),
    name: worker.fullName || worker.name || "Professional",
    phone: worker.phone || null,
    email: worker.email || null,
    profilePhoto: worker.profilePhoto || null,
    rating: Number(worker.averageRating ?? worker.rating ?? 0),
    experienceYears: Number(worker.experienceYears || 0),
    skills: Array.isArray(worker.skills) ? worker.skills : [],
  };
};

const sanitizeCustomer = (customer) => {
  if (!customer) return null;
  return {
    name: customer.fullname || customer.fullName || "Customer",
    phone: customer.phone || null,
    email: customer.email || null,
    address: customer.address || null,
  };
};

const serializeJobForCustomer = (job) => ({
  id: String(job._id),
  service: job.service,
  description: job.description,
  status: job.status,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
  location: sanitizeAddress(job.location?.address),
  assignedWorker: sanitizeWorker(job.assignedWorkerId),
});

const serializeJobForWorker = (job, distanceKm = null) => ({
  id: String(job._id),
  service: job.service,
  description: job.description,
  status: job.status,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
  location: sanitizeAddress(job.location?.address),
  distanceKm: Number.isFinite(distanceKm) ? Number(distanceKm.toFixed(2)) : null,
  customer: sanitizeCustomer(job.customerId),
});

const normalizeAddressInput = (value) => {
  if (!value || typeof value !== "object") return null;
  const formatted = String(value.formatted || "").trim();
  if (!formatted) return null;
  return sanitizeAddress({
    formatted,
    area: value.area,
    city: value.city,
    state: value.state,
    country: value.country,
    pincode: value.pincode,
  });
};

export const createJob = async (req, res) => {
  try {
    const customerId = req.customer?._id;
    const { service, description, latitude, longitude, locationAddress } = req.body || {};

    if (!customerId) return res.status(401).json({ success: false, message: "Customer authentication required" });

    const cleanService = normalizeService(service);
    const cleanDescription = String(description || "").trim();
    const lat = Number(latitude);
    const lon = Number(longitude);

    if (!cleanService) return res.status(400).json({ success: false, message: "Please select a valid service" });
    if (cleanDescription.length < 3 || cleanDescription.length > 2000) {
      return res.status(400).json({ success: false, message: "Description must be between 3 and 2000 characters" });
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ success: false, message: "Invalid location coordinates" });
    }

    const workers = await findBestWorkers({ serviceName: cleanService, latitude: lat, longitude: lon, limit: 10 });

    let address = normalizeAddressInput(locationAddress);
    if (!address) {
      try {
        address = await reverseGeocode(lat, lon);
      } catch (error) {
        console.warn("Job reverse geocoding fallback:", error.message);
        address = { formatted: "Location detected" };
      }
    }

    const job = await Job.create({
      customerId,
      service: cleanService,
      description: cleanDescription,
      location: {
        type: "Point",
        coordinates: [lon, lat],
        address,
      },
      matchedWorkerIds: workers.map((worker) => worker.workerId),
      assignedWorkerId: null,
      matching: { radiusKm: FIXED_RADIUS_KM, workerCount: workers.length },
      status: "REQUESTED",
    });

    let notifications = [];
    if (workers.length) {
      const distanceByWorker = new Map(workers.map((worker) => [String(worker.workerId), worker.distance]));
      notifications = await notifyWorkers({
        workerIds: workers.map((worker) => worker.workerId),
        requestId: job._id,
        service: cleanService,
        description: cleanDescription,
        locationAddress: address,
        distanceByWorker,
        io: req.app.get("io"),
      });
    }

    return res.status(201).json({
      success: true,
      message: workers.length
        ? `Request sent to ${workers.length} nearby professionals`
        : "No available professionals are currently within 10 km for this service.",
      requestId: String(job._id),
      job: serializeJobForCustomer(job.toObject()),
      workerCount: workers.length,
      matchedWorkers: workers.map((worker) => ({
        name: worker.name,
        distanceKm: worker.distance,
        rating: worker.rating,
        experienceYears: worker.experienceYears,
        skillLevel: worker.skillLevel,
      })),
      notifications: notifications.map(({ workerId, notificationId, success, fcm, socket }) => ({ workerId, notificationId, success, fcm, socket })),
    });
  } catch (error) {
    console.error("Create job error:", error);
    return res.status(500).json({ success: false, message: "Unable to send your request. Please try again." });
  }
};

export const listCustomerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ customerId: req.customer._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("assignedWorkerId", PUBLIC_WORKER_PROJECTION)
      .lean();

    return res.json({ success: true, jobs: jobs.map(serializeJobForCustomer) });
  } catch (error) {
    console.error("List customer jobs error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch service requests" });
  }
};

export const listWorkerRequests = async (req, res) => {
  try {
    const worker = await getEligibleWorker(req.worker?._id);

    // New service requests are visible only to workers who are currently
    // eligible: active + available + member of an ACTIVE cooperative.
    if (!worker) {
      return res.json({ success: true, jobs: [] });
    }

    const workerCoordinates = worker?.location?.coordinates;
    const jobs = await Job.find({ status: "REQUESTED", matchedWorkerIds: worker._id, assignedWorkerId: null })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("customerId", "fullname phone email address")
      .lean();

    const [workerLon, workerLat] = Array.isArray(workerCoordinates) ? workerCoordinates.map(Number) : [NaN, NaN];
    const serialized = jobs.map((job) => {
      const coords = job.location?.coordinates;
      const [jobLon, jobLat] = Array.isArray(coords) ? coords.map(Number) : [NaN, NaN];
      const distance = [workerLat, workerLon, jobLat, jobLon].every(Number.isFinite)
        ? calculateDistanceKm(workerLat, workerLon, jobLat, jobLon)
        : null;
      return serializeJobForWorker(job, distance);
    });

    return res.json({ success: true, jobs: serialized });
  } catch (error) {
    console.error("List worker requests error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch service requests" });
  }
};

export const listWorkerActiveJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ assignedWorkerId: req.worker._id, status: { $in: ["ASSIGNED", "IN_PROGRESS"] } })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("customerId", "fullname phone email address")
      .lean();

    const workerCoordinates = req.worker.location?.coordinates;
    const [workerLon, workerLat] = Array.isArray(workerCoordinates) ? workerCoordinates.map(Number) : [NaN, NaN];
    return res.json({
      success: true,
      jobs: jobs.map((job) => {
        const coords = job.location?.coordinates;
        const [jobLon, jobLat] = Array.isArray(coords) ? coords.map(Number) : [NaN, NaN];
        const distance = [workerLat, workerLon, jobLat, jobLon].every(Number.isFinite)
          ? calculateDistanceKm(workerLat, workerLon, jobLat, jobLon)
          : null;
        return serializeJobForWorker(job, distance);
      }),
    });
  } catch (error) {
    console.error("List worker active jobs error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch active assignments" });
  }
};

export const acceptJob = async (req, res) => {
  try {
    const workerId = req.worker?._id;
    const jobId = req.params.id;
    if (!workerId || !mongoose.isValidObjectId(jobId)) return res.status(400).json({ success: false, message: "Invalid request" });

    const workerRecord = await getEligibleWorker(workerId);
    if (!workerRecord) {
      return res.status(403).json({
        success: false,
        message: "You must be an available member of an approved active cooperative before accepting service requests.",
      });
    }

    const reservedWorker = await Worker.findOneAndUpdate(
      { _id: workerId, isActive: true, status: "AVAILABLE", cooperativeId: workerRecord.cooperativeId },
      { $set: { status: "BUSY" } },
      { new: true }
    ).select(PUBLIC_WORKER_PROJECTION);

    if (!reservedWorker) return res.status(409).json({ success: false, message: "You are no longer available to accept this request" });

    const job = await Job.findOneAndUpdate(
      { _id: jobId, status: "REQUESTED", assignedWorkerId: null, matchedWorkerIds: workerId },
      { $set: { assignedWorkerId: workerId, status: "ASSIGNED" } },
      { new: true }
    )
      .populate("customerId", "fullname phone email address")
      .populate("assignedWorkerId", PUBLIC_WORKER_PROJECTION)
      .lean();

    if (!job) {
      await Worker.updateOne({ _id: workerId, status: "BUSY" }, { $set: { status: "AVAILABLE" } });
      return res.status(409).json({ success: false, message: "This request has already been accepted by another worker" });
    }

    const worker = sanitizeWorker(job.assignedWorkerId);
    const customer = sanitizeCustomer(job.customerId);
    const customerRoom = `customer:${job.customerId._id}`;
    const otherWorkerIds = (job.matchedWorkerIds || []).filter((id) => String(id) !== String(workerId));
    const io = req.app.get("io");

    if (io) {
      io.to(customerRoom).emit("worker-accepted", {
        requestId: String(job._id),
        worker,
        service: job.service,
        location: sanitizeAddress(job.location?.address),
      });
      await notifyWorkersRequestTaken({ workerIds: otherWorkerIds, requestId: job._id, io });
    }

    return res.json({
      success: true,
      message: "Request accepted successfully",
      job: serializeJobForWorker(job, null),
      worker,
      customer,
    });
  } catch (error) {
    console.error("Accept job error:", error);
    return res.status(500).json({ success: false, message: "Failed to accept request" });
  }
};

export const rejectJob = async (req, res) => {
  try {
    const workerId = req.worker?._id;
    const jobId = req.params.id;
    if (!workerId || !mongoose.isValidObjectId(jobId)) return res.status(400).json({ success: false, message: "Invalid request" });

    const result = await Job.updateOne(
      { _id: jobId, status: "REQUESTED", assignedWorkerId: null, matchedWorkerIds: workerId },
      { $pull: { matchedWorkerIds: workerId } }
    );
    if (!result.modifiedCount) return res.status(409).json({ success: false, message: "This request is no longer available" });
    return res.json({ success: true, message: "Request rejected" });
  } catch (error) {
    console.error("Reject job error:", error);
    return res.status(500).json({ success: false, message: "Failed to reject request" });
  }
};

export const cancelJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id",
      });
    }

    const job = await Job.findOneAndUpdate(
      {
        _id: id,
        customerId: req.customer._id,
        status: { $in: ["REQUESTED", "ASSIGNED", "IN_PROGRESS"] },
      },
      { $set: { status: "CANCELLED" } },
      { new: true }
    )
      .populate("assignedWorkerId", PUBLIC_WORKER_PROJECTION)
      .lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Cancellable request not found",
      });
    }

    // If a worker had already accepted the request, release that worker.
    if (job.assignedWorkerId?._id) {
      await Worker.updateOne(
        {
          _id: job.assignedWorkerId._id,
          status: "BUSY",
        },
        { $set: { status: "AVAILABLE" } }
      );
    }

    const io = req.app.get("io");

    if (io) {
      const matchedWorkerIds = new Set(
        (job.matchedWorkerIds || []).map((workerId) => String(workerId))
      );

      if (job.assignedWorkerId?._id) {
        matchedWorkerIds.add(String(job.assignedWorkerId._id));
      }

      for (const workerId of matchedWorkerIds) {
        io.to(`worker:${workerId}`).emit("request-cancelled", {
          requestId: String(job._id),
          message: "The customer cancelled this request.",
        });
      }

      io.to(`customer:${req.customer._id}`).emit("request-cancelled", {
        requestId: String(job._id),
        message: "Service request cancelled.",
      });
    }

    return res.json({
      success: true,
      message: "Service request cancelled",
      job: serializeJobForCustomer(job),
    });
  } catch (error) {
    console.error("Cancel job error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel request",
    });
  }
};
