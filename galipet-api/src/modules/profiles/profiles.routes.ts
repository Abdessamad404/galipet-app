import { Router } from "express";
import multer from "multer";
import {
  getProfile,
  updateMyProfile,
  uploadMyAvatar,
  search,
  patchFcmToken,
} from "./profiles.controller";
import { protect } from "../../middleware/auth.middleware";

const router = Router();

// Configuration multer pour upload en mémoire
const upload = multer({ storage: multer.memoryStorage() });

// Routes protégées
router.get("/search", protect, search);
router.patch("/me/fcm-token", protect, patchFcmToken);
router.get("/:id", protect, getProfile);
router.put("/me", protect, updateMyProfile);
router.post("/me/avatar", protect, upload.single("avatar"), uploadMyAvatar);

export default router;
