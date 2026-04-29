"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const pets_controller_1 = require("./pets.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Toutes les routes sont protégées
router.post("/", auth_middleware_1.protect, pets_controller_1.create);
router.get("/", auth_middleware_1.protect, pets_controller_1.getMine);
router.get("/:id", auth_middleware_1.protect, pets_controller_1.getOne);
router.put("/:id", auth_middleware_1.protect, pets_controller_1.update);
router.delete("/:id", auth_middleware_1.protect, pets_controller_1.remove);
router.post("/:id/photo", auth_middleware_1.protect, upload.single("photo"), pets_controller_1.uploadPhoto);
exports.default = router;
