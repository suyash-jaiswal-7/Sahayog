import Job from "../models/Job.js";
import Service from "../models/Service.js";
import { detectService } from "../services/aiService.js";
import { findBestWorker } from "../services/matchingService.js";

export const createJob = async (req, res) => {
  try {
    const {
      customerId,
      description,
      latitude,
      longitude,
    } = req.body;

    

    if (
      !customerId ||
      !description ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "customerId, description, latitude and longitude are required",
      });
    }

    

    const aiResult = await detectService(description);

    if (!aiResult.service) {
      return res.status(400).json({
        success: false,
        message: "Could not identify required service",
      });
    }

    

    const service = await Service.findOne({
      name: aiResult.service,
      isActive: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    

    const worker = await findBestWorker({
      serviceName: aiResult.service,
      latitude: Number(latitude),
      longitude: Number(longitude),
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "No suitable worker available",
        detectedService: aiResult.service,
      });
    }

    
  

    const job = await Job.create({
      customerId,

      serviceId: service._id,

      description,

      location: {
        type: "Point",
        coordinates: [
          Number(longitude),
          Number(latitude),
        ],
      },

      assignedWorkerId: worker.workerId,

      status: "ASSIGNED",
    });

    

    return res.status(201).json({
      success: true,

      message: "Job created and worker assigned",

      job: {
        id: job._id,
        description: job.description,
        service: aiResult.service,
        status: job.status,
      },

      worker: {
        id: worker.workerId,
        name: worker.name,
        phone: worker.phone,
        distance: worker.distance,
        skillLevel: worker.skillLevel,
        rating: worker.rating,
        experienceYears: worker.experienceYears,
        matchingScore: worker.score,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message,
    });
  }
};