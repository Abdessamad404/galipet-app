import { Router } from "express";
import { register, login, me } from "./auth.controller";
import { protect } from "../../middleware/auth.middleware";

const router = Router();

// Routes publiques
router.post("/register", register);
router.post("/login", login);

// Routes protégées
router.get("/me", protect, me);

export default router;
