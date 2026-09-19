import { Router } from "express";
import { loginCustomer, registerCustomer, logoutCustomer } from "./customer.controller.js";
import { verifyCustomerJWT } from "../../shared/middleware/auth.middleware.js";
const router = Router();
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.post("/logout", verifyCustomerJWT, logoutCustomer);
export default router;
