import { Router } from "express";
import { verifyCustomerJWT } from "../../shared/middleware/auth.middleware.js";
import { requireCustomer } from "../../shared/middleware/role.middleware.js";
import { reverseGeocodeLocation } from "./location.controller.js";

const router = Router();
router.use(verifyCustomerJWT, requireCustomer);
router.post("/reverse-geocode", reverseGeocodeLocation);
export default router;
