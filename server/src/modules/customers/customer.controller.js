import { loginCustomerService } from "./customer-auth.service.js";
import { registerCustomerService } from "./customer-registration.service.js";
import { apiResponse } from "../../shared/utils/api-response.js";
import { asyncErrorHandler } from "../../shared/utils/async-handler.js";
import { Customer } from "./customer.model.js";

const registerCustomer = asyncErrorHandler(async (req, res) => {
  const createdCustomer = await registerCustomerService(req.body);
  return res.status(201).json(new apiResponse(201, createdCustomer, "Customer registered successfully!"));
});

const loginCustomer = asyncErrorHandler(async (req, res) => {
  const { customer, accessToken, refreshToken } = await loginCustomerService(req.body);
  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", maxAge: 15 * 60 * 1000 };
  const refreshOptions = { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 };
  return res.status(200).cookie("customerAccessToken", accessToken, options).cookie("customerRefreshToken", refreshToken, refreshOptions).json(new apiResponse(200, { customer }, "Customer logged in successfully!"));
});

const logoutCustomer = asyncErrorHandler(async (req, res) => {
  if (req.customer) await Customer.findByIdAndUpdate(req.customer._id, { $set: { refreshToken: null } });
  return res.status(200).clearCookie("customerAccessToken").clearCookie("customerRefreshToken").json(new apiResponse(200, null, "Customer logged out successfully!"));
});

export { registerCustomer, loginCustomer, logoutCustomer };
