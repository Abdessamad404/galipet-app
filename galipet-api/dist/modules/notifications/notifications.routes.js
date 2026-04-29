"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notifications_controller_1 = require("./notifications.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Toutes les routes sont protégées
router.get("/", auth_middleware_1.protect, notifications_controller_1.getMine);
router.patch("/:id/read", auth_middleware_1.protect, notifications_controller_1.markRead);
router.patch("/read-all", auth_middleware_1.protect, notifications_controller_1.markAllRead);
router.get("/unread-count", auth_middleware_1.protect, notifications_controller_1.unreadCount);
exports.default = router;
