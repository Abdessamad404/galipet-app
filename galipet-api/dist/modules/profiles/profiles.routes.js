"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const profiles_controller_1 = require("./profiles.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Configuration multer pour upload en mémoire
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Routes protégées
router.get("/search", auth_middleware_1.protect, profiles_controller_1.search);
router.get("/:id", auth_middleware_1.protect, profiles_controller_1.getProfile);
router.put("/me", auth_middleware_1.protect, profiles_controller_1.updateMyProfile);
router.post("/me/avatar", auth_middleware_1.protect, upload.single("avatar"), profiles_controller_1.uploadMyAvatar);
exports.default = router;
