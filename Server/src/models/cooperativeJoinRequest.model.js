import mongoose from "mongoose";

const cooperativeJoinRequestSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },

    cooperativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative",
      required: true,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CooperativeAdmin",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Same worker cannot have multiple pending requests
cooperativeJoinRequestSchema.index(
  { workerId: 1, cooperativeId: 1, status: 1 }
);

export const CooperativeJoinRequest = mongoose.model(
  "CooperativeJoinRequest",
  cooperativeJoinRequestSchema
);