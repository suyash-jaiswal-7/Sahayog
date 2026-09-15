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


    // CUSTOMER
    if (decodedToken.role === "CUSTOMER") {

      const customer = await Customer.findById(
        decodedToken._id
      ).select("-password -refreshToken");

      if (!customer) {
        throw new apiError(
          401,
          "Invalid access token!"
        );
      }

      if (!customer.isActive) {
        throw new apiError(
          403,
          "Customer account is inactive!"
        );
      }

      req.customer = customer;
    }


    // WORKER
    else if (decodedToken.role === "WORKER") {

      const worker = await Worker.findById(
        decodedToken._id
      ).select("-password -refreshToken");

      if (!worker) {
        throw new apiError(
          401,
          "Invalid access token!"
        );
      }

      if (!worker.isActive) {
        throw new apiError(
          403,
          "Worker account is inactive!"
        );
      }

      req.worker = worker;
    }


    // COOPERATIVE ADMIN
    else if (decodedToken.role === "COOPERATIVE_ADMIN") {

      const cooperativeAdmin =
        await CooperativeAdmin.findById(
          decodedToken._id
        ).select("-password -refreshToken");

      if (!cooperativeAdmin) {
        throw new apiError(
          401,
          "Invalid access token!"
        );
      }

      if (!cooperativeAdmin.isActive) {
        throw new apiError(
          403,
          "Cooperative admin account is inactive!"
        );
      }

      req.cooperativeAdmin = cooperativeAdmin;
    }


    else {
      throw new apiError(
        401,
        "Invalid user role!"
      );
    }

    next();

  } catch (error) {

    if (error.statusCode) {
      throw error;
    }

    throw new apiError(
      401,
      "Invalid or expired access token!"
    );
  }
});


export { verifyJWT };