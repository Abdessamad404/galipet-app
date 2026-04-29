import { Router } from "express";
import { create, getMine, getOne, updateStatus } from "./bookings.controller";
import { protect } from "../../middleware/auth.middleware";

const router = Router();

// Toutes les routes sont protégées
router.post("/", protect, create);
router.get("/", protect, getMine);
router.get("/:id", protect, getOne);
router.patch("/:id/status", protect, updateStatus);

export default router;
