"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookings_controller_1 = require("./bookings.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Toutes les routes sont protégées
router.post("/", auth_middleware_1.protect, bookings_controller_1.create);
router.get("/", auth_middleware_1.protect, bookings_controller_1.getMine);
router.get("/:id", auth_middleware_1.protect, bookings_controller_1.getOne);
router.patch("/:id/status", auth_middleware_1.protect, bookings_controller_1.updateStatus);
exports.default = router;
