"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const insurance_controller_1 = require("./insurance.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Toutes les routes sont protégées
router.post("/leads", auth_middleware_1.protect, insurance_controller_1.submit);
router.get("/leads/mine", auth_middleware_1.protect, insurance_controller_1.getMine);
router.get("/leads", auth_middleware_1.protect, insurance_controller_1.getAll);
router.patch("/leads/:id/status", auth_middleware_1.protect, insurance_controller_1.updateStatus);
exports.default = router;
