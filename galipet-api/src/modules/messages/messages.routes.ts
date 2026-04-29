import { Router } from "express";
import { send, getByBooking, markRead, unreadCount, remove } from "./messages.controller";
import { protect } from "../../middleware/auth.middleware";

const router = Router();

// Toutes les routes sont protégées
router.post("/", protect, send);
router.get("/booking/:bookingId", protect, getByBooking);
router.patch("/:id/read", protect, markRead);
router.get("/unread-count", protect, unreadCount);
router.delete("/:id", protect, remove);

export default router;
