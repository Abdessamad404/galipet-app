import { Router } from "express";
import { create, getForProfessional, getMine } from "./reviews.controller";
import { protect } from "../../middleware/auth.middleware";

const router = Router();

// Routes protégées
router.post("/", protect, create);
router.get("/mine", protect, getMine);

// Route publique pour voir les avis d'un professionnel
router.get("/professional/:professionalId", getForProfessional);

export default router;
