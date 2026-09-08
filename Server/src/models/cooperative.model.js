import mongoose from "mongoose";

const cooperativeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    address: {
      house: {
        type: String,
        trim: true,
      },
      area: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      pincode: {
        type: String,
        trim: true,
      },
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },


    federationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Federation",
      default: null,
    },

    // Services offered by cooperative
    serviceCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    // Cooperative operational status
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },

    // Emergency / on-demand service support
    emergencyServiceEnabled: {
      type: Boolean,
      default: false,
    },

    // Dashboard summary
    totalWorkers: {
      type: Number,
      min: 0,
      default: 0,
    },

    activeWorkers: {
      type: Number,
      min: 0,
      default: 0,
    },

    verifiedWorkers: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalJobsCompleted: {
      type: Number,
      min: 0,
      default: 0,
    },

    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    // Worker welfare summary
    welfareFund: {
      type: Number,
      min: 0,
      default: 0,
    },

    // AI demand forecasting feature
    demandForecastEnabled: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

cooperativeSchema.index({
  location: "2dsphere",
});

export const Cooperative = mongoose.model(
  "Cooperative",
  cooperativeSchema
);






