"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messages_controller_1 = require("./messages.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Toutes les routes sont protégées
router.post("/", auth_middleware_1.protect, messages_controller_1.send);
router.get("/booking/:bookingId", auth_middleware_1.protect, messages_controller_1.getByBooking);
router.patch("/:id/read", auth_middleware_1.protect, messages_controller_1.markRead);
router.get("/unread-count", auth_middleware_1.protect, messages_controller_1.unreadCount);
exports.default = router;
