import mongoose from "mongoose";

const locationAddressSchema = new mongoose.Schema(
  {
    formatted: { type: String, trim: true, maxlength: 500, default: null },
    area: { type: String, trim: true, maxlength: 150, default: null },
    city: { type: String, trim: true, maxlength: 100, default: null },
    state: { type: String, trim: true, maxlength: 100, default: null },
    country: { type: String, trim: true, maxlength: 100, default: null },
    pincode: { type: String, trim: true, maxlength: 20, default: null },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    service: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 2000,
    },

    // Coordinates are retained for geospatial matching only.
    // Never send this field to customer/worker UI responses.
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (value) =>
            Array.isArray(value) &&
            value.length === 2 &&
            value.every(Number.isFinite) &&
            value[0] >= -180 &&
            value[0] <= 180 &&
            value[1] >= -90 &&
            value[1] <= 90,
          message: "Location coordinates must be [longitude, latitude]",
        },
      },
      address: {
        type: locationAddressSchema,
        default: () => ({}),
      },
    },

    assignedWorkerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
      index: true,
    },

    matchedWorkerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
      },
    ],

    matching: {
      radiusKm: { type: Number, default: 10 },
      workerCount: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: [
        "REQUESTED",
        "ASSIGNED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "REQUESTED",
      index: true,
    },
  },
  { timestamps: true }
);

jobSchema.index({ location: "2dsphere" });
jobSchema.index({ customerId: 1, createdAt: -1 });
jobSchema.index({ assignedWorkerId: 1, status: 1 });

export default mongoose.model("Job", jobSchema);
