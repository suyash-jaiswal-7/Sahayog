import { Router } from "express";
import { login, logout, cooperatives, approve, reject } from "./system-admin.controller.js";
import { verifySystemAdminJWT } from "../../shared/middleware/auth.middleware.js";
import { requireSystemAdmin } from "../../shared/middleware/role.middleware.js";

const router = Router();
router.post("/login", login);
router.use(verifySystemAdminJWT, requireSystemAdmin);
router.post("/logout", logout);
router.get("/cooperatives", cooperatives);
router.patch("/cooperatives/:cooperativeId/approve", approve);
router.patch("/cooperatives/:cooperativeId/reject", reject);
export default router;
