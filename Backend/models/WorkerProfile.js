import mongoose from "mongoose";

const workerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    cooperativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative",
      default: null
    },

    skills: [
      {
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },

        experienceYears: {
          type: Number,
          required: true,
          min: 0,
        },

        skillLevel: {
          type: String,
          enum: [
            "BEGINNER",
            "INTERMEDIATE",
            "EXPERT",
          ],
          required: true,
        },
      },
    ],

    certifications: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        documentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Document",
          default: null,
        },

        issuedBy: {
          type: String,
          trim: true,
        },

        expiryDate: {
          type: Date,
          default: null,
        },

        verified: {
          type: Boolean,
          default: false,
        },
      },
    ],

    experienceYears: {
      type: Number,
      required: true,
      min: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalJobs: {
      type: Number,
      default: 0,
      min: 0,
    },

    completedJobs: {
      type: Number,
      default: 0,
      min: 0,
    },

    cancelledJobs: {
      type: Number,
      default: 0,
      min: 0,
    },

    firstTimeResolutionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    currentWorkload: {
      type: Number,
      default: 0,
      min: 0,
    },

    verificationStatus: {
      type: String,
      enum: [
        "PENDING",
        "VERIFIED",
        "REJECTED",
      ],
      default: "PENDING",
      required: true,
    },

    workerStatus: {
      type: String,
      enum: [
        "AVAILABLE",
        "BUSY",
        "OFFLINE",
        "SUSPENDED",
      ],
      default: "OFFLINE",
      required: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    profileImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const WorkerProfile = mongoose.model(
  "WorkerProfile",
  workerProfileSchema
);

export default WorkerProfile;