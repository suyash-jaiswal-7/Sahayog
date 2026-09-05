import User from "../models/User.js";
import WorkerProfile from "../models/WorkerProfile.js";
import Service from "../models/Service.js";
import { calculateDistance } from "../utils/distance.js";

export const findBestWorker = async ({
  serviceName,
  latitude,
  longitude,
}) => {

  
  const service = await Service.findOne({
    name: serviceName,
    isActive: true,
  });

  if (!service) {
    throw new Error("Service not found");
  }

  
  const workers = await WorkerProfile.find({
    "skills.serviceId": service._id,

    verificationStatus: "VERIFIED",

    workerStatus: "AVAILABLE",
  }).populate("userId");

  if (workers.length === 0) {
    return null;
  }

  
  const matchedWorkers = workers.map((worker) => {

    const user = worker.userId;

    const [workerLongitude, workerLatitude] =
      user.location.coordinates;

    const distance = calculateDistance(
      latitude,
      longitude,
      workerLatitude,
      workerLongitude
    );

    
    const skill = worker.skills.find(
      (skill) =>
        skill.serviceId.toString() ===
        service._id.toString()
    );

    let skillScore = 0;

    if (skill) {
      if (skill.skillLevel === "BEGINNER") {
        skillScore = 50;
      }

      if (skill.skillLevel === "INTERMEDIATE") {
        skillScore = 75;
      }

      if (skill.skillLevel === "EXPERT") {
        skillScore = 100;
      }
    }

    
    const distanceScore =
      Math.max(0, 100 - distance * 10);

    
    const ratingScore =
      (worker.rating / 5) * 100;

    
    const experienceScore =
      Math.min(worker.experienceYears * 10, 100);

    
    const availabilityScore =
      worker.workerStatus === "AVAILABLE"
        ? 100
        : 0;

    
    const finalScore =
      skillScore * 0.40 +
      distanceScore * 0.30 +
      ratingScore * 0.15 +
      experienceScore * 0.10 +
      availabilityScore * 0.05;

    return {
      workerId: user._id,
      name: user.name,
      phone: user.phone,

      distance: Number(distance.toFixed(2)),

      skillLevel: skill?.skillLevel,

      rating: worker.rating,

      experienceYears: worker.experienceYears,

      score: Number(finalScore.toFixed(2)),
    };
  });

  
  matchedWorkers.sort(
    (a, b) => b.score - a.score
  );

  return matchedWorkers[0];
};