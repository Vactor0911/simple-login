import { Router } from "express";
import { AuthController } from "../controllers/auth.controllers";
import { requireAuth } from "../middleware/auth";
import { verifyCsrfForRefresh, verifyCsrfToken } from "../middleware/csrf";

const router = Router();

router.post("/login", AuthController.login);
router.post("/signup", AuthController.signup);
router.post("/refresh", verifyCsrfForRefresh, AuthController.refresh);
router.post("/logout", requireAuth, AuthController.logout);
router.get("/me", requireAuth, AuthController.me);

export default router;
