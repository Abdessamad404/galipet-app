import { Router } from "express";
import {
  getMine,
  markRead,
  markAllRead,
  unreadCount,
} from "./notifications.controller";
import { protect } from "../../middleware/auth.middleware";

const router = Router();

// Toutes les routes sont protégées
router.get("/", protect, getMine);
router.patch("/:id/read", protect, markRead);
router.patch("/read-all", protect, markAllRead);
router.get("/unread-count", protect, unreadCount);

export default router;
