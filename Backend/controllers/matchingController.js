import { detectService } from "../services/aiService.js";
import { findBestWorker } from "../services/matchingService.js";

export const matchWorker = async (req, res) => {
  try {
    const {
      description,
      latitude,
      longitude,
    } = req.body;

    if (
      !description ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "description, latitude and longitude are required",
      });
    }

    
    const aiResult = await detectService(description);

    if (!aiResult.service) {
      return res.status(404).json({
        success: false,
        message: "Could not identify required service",
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
        detectedService: aiResult,
      });
    }

    return res.status(200).json({
      success: true,

      request: {
        description,
        detectedService: aiResult.service,
        confidence: aiResult.confidence,
      },

      matchedWorker: worker,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Matching failed",
      error: error.message,
    });
  }
};