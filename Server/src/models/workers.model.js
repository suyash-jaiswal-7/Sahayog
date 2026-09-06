import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const workerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
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

    password: {
      type: String,
      required: true,
      minlength: 8,
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

    // Worker profile photo
    profilePhoto: {
      type: String,
      default: null,
    },

    // Aadhaar document
    aadhaarCard: {
      type: String,
      default: null,
    },

    // Cooperative association
    cooperativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cooperative",
      default: null,
    },

    // Worker availability
    status: {
      type: String,
      enum: ["AVAILABLE", "BUSY", "OFFLINE", "SUSPENDED"],
      default: "OFFLINE",
    },

    // AI-generated skill level
    skillLevel: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"],
      default: null,
    },

    // Data used by AI
    experienceYears: {
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

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    refreshToken: {
      type: String,
      default: null,
    },


    resetPasswordOtp: {
      type: String,
      default: null,
    },


    resetPasswordOtpExpiry: {
      type: Date,
      default: null,
    },

    
    isResetPasswordOtpVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

workerSchema.index({ location: "2dsphere" });

workerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

workerSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

workerSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
      role: "WORKER",
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

workerSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Worker = mongoose.model("Worker", workerSchema);