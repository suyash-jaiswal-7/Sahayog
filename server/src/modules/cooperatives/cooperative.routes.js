import { Router } from "express";
import { registerCooperativeController } from "./cooperative.controller.js";
const router = Router();
router.post("/register", registerCooperativeController);
export default router;
