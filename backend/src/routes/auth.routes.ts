import { Router } from "express";
import { AuthController } from "../controllers/auth.controllers";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/login", AuthController.login);
router.post("/signup", AuthController.signup);
router.post("/refresh", AuthController.refresh);
router.get("/me", requireAuth, AuthController.me);
router.post("/logout", AuthController.logout);

export default router;
