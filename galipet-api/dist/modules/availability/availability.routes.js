"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const availability_controller_1 = require("./availability.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Routes protégées (sauf getAvailable qui peut être public pour que les clients voient les disponibilités)
router.post("/", auth_middleware_1.protect, availability_controller_1.create);
router.get("/mine", auth_middleware_1.protect, availability_controller_1.getMine);
router.get("/professional/:professionalId", availability_controller_1.getAvailable);
router.put("/:id", auth_middleware_1.protect, availability_controller_1.update);
router.delete("/:id", auth_middleware_1.protect, availability_controller_1.remove);
exports.default = router;
