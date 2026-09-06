import { Router } from "express";

import {
  loginCustomer,
  registerCustomer,
} from "../controller/customer/customer.controller.js";

const customerRouter = Router();

customerRouter.post("/register", registerCustomer);
customerRouter.post("/login", loginCustomer);

export default customerRouter;