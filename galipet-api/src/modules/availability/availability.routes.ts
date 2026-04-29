import { Router } from "express";
import {
  create,
  getMine,
  getAvailable,
  update,
  remove,
} from "./availability.controller";
import { protect } from "../../middleware/auth.middleware";

const router = Router();

// Routes protégées (sauf getAvailable qui peut être public pour que les clients voient les disponibilités)
router.post("/", protect, create);
router.get("/mine", protect, getMine);
router.get("/professional/:professionalId", getAvailable);
router.put("/:id", protect, update);
router.delete("/:id", protect, remove);

export default router;
