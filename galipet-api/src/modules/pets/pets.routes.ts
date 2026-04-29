import { Router } from "express";
import multer from "multer";
import {
  create,
  getMine,
  getOne,
  update,
  remove,
  uploadPhoto,
} from "./pets.controller";
import { protect } from "../../middleware/auth.middleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Toutes les routes sont protégées
router.post("/", protect, create);
router.get("/", protect, getMine);
router.get("/:id", protect, getOne);
router.put("/:id", protect, update);
router.delete("/:id", protect, remove);
router.post("/:id/photo", protect, upload.single("photo"), uploadPhoto);

export default router;
