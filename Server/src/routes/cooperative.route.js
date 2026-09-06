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

    type: {
      type: String,
      enum: [
        "LABOUR_COOPERATIVE",
        "LABOUR_COOPERATIVE_SOCIETY",
        "FEDERATION",
      ],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    contact: {
      phone: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
    },

    address: {
      house: {
        type: String,
        trim: true,
      },

      area: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    totalWorkers: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "SUSPENDED", "INACTIVE"],
      default: "PENDING",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

cooperativeSchema.index({ location: "2dsphere" });

const Cooperative = mongoose.model("Cooperative", cooperativeSchema);

export default Cooperative;