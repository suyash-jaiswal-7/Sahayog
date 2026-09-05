import express from "express";
import { matchWorker } from "../controllers/matchingController.js";

const router = express.Router();

router.post("/match", matchWorker);

export default router;