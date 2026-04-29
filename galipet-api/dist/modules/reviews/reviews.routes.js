"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviews_controller_1 = require("./reviews.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Routes protégées
router.post("/", auth_middleware_1.protect, reviews_controller_1.create);
router.get("/mine", auth_middleware_1.protect, reviews_controller_1.getMine);
// Route publique pour voir les avis d'un professionnel
router.get("/professional/:professionalId", reviews_controller_1.getForProfessional);
exports.default = router;
