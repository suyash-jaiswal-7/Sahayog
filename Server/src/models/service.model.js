import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    // Basic service pricing
    basePrice: {
      type: Number,
      min: 0,
      required: true,
    },

    priceUnit: {
      type: String,
      enum: [
        "PER_HOUR",
        "PER_DAY",
        "PER_JOB",
        "PER_VISIT",
      ],
      default: "PER_JOB",
    },

    // Emergency / on-demand service
    emergencyAvailable: {
      type: Boolean,
      default: false,
    },

    // Service availability
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate service + category combination
serviceSchema.index(
  {
    name: 1,
    category: 1,
  },
  {
    unique: true,
  }
);

export const Service = mongoose.model(
  "Service",
  serviceSchema
);