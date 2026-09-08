import jwt from "jsonwebtoken";
import { Worker } from "../models/workers.model.js";
import { Customer } from "../models/customers.model.js";
import { CooperativeAdmin } from "../models/cooperativeAdmin.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";

const verifyJWT = asyncErrorHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new apiError(
      401,
      "Unauthorized request. Access token is required!"
    );
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (decodedToken.role === "CUSTOMER") {
      const customer = await Customer.findById(decodedToken._id).select(
        "-password -refreshToken"
      );

      if (!customer) {
        throw new apiError(401, "Invalid access token!");
      }

      req.customer = customer;
    }

    else if (decodedToken.role === "WORKER") {
      const worker = await Worker.findById(decodedToken._id).select(
        "-password -refreshToken"
      );

      if (!worker) {
        throw new apiError(401, "Invalid access token!");
      }

      req.worker = worker;
    }

    else if (decodedToken.role === "COOPERATIVE_ADMIN") {
      const cooperativeAdmin = await CooperativeAdmin.findById(
        decodedToken._id
      ).select("-password -refreshToken");

      if (!cooperativeAdmin) {
        throw new apiError(401, "Invalid access token!");
      }

      req.cooperativeAdmin = cooperativeAdmin;
    }

    else {
      throw new apiError(401, "Invalid user role!");
    }

    next();

  } catch (error) {
    throw new apiError(
      401,
      "Invalid or expired access token!"
    );
  }
});

export { verifyJWT };