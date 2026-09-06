import { loginCustomerService } from "../../services/customerService/loginCustomer.service.js";
import { registerCustomerService } from "../../services/customerService/registerCustomerService.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncErrorHandler } from "../../utils/asyncErrorHandler.js";



const registerCustomer = asyncErrorHandler(async (req, res) => {
  const createdCustomer = await registerCustomerService(req.body);

  return res.status(201).json(
    new apiResponse(
      201,
      createdCustomer,
      "Customer registered successfully!"
    )
  );
});




const loginCustomer = asyncErrorHandler(async (req, res) => {
  const { customer, accessToken, refreshToken } =
    await loginCustomerService(req.body);

  const options = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        { customer },
        "Customer logged in successfully!"
      )
    );
});





export {
  registerCustomer,
  loginCustomer,
};