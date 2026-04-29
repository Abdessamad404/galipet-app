"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.uploadMyAvatar = exports.updateMyProfile = exports.getProfile = void 0;
const profiles_service_1 = require("./profiles.service");
const response_1 = require("../../utils/response");
const getProfile = async (req, res) => {
    try {
        const id = req.params.id;
        const profile = await (0, profiles_service_1.getProfileById)(id);
        return (0, response_1.success)(res, profile);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message, 404);
    }
};
exports.getProfile = getProfile;
const updateMyProfile = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const updates = req.body;
        const profile = await (0, profiles_service_1.updateProfile)(req.user.id, updates);
        return (0, response_1.success)(res, profile);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.updateMyProfile = updateMyProfile;
const uploadMyAvatar = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        // Vérifie qu'un fichier est présent
        if (!req.file) {
            return (0, response_1.error)(res, "Aucun fichier fourni", 400);
        }
        const profile = await (0, profiles_service_1.uploadAvatar)(req.user.id, req.file.buffer, req.file.originalname);
        return (0, response_1.success)(res, profile);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.uploadMyAvatar = uploadMyAvatar;
const search = async (req, res) => {
    try {
        const { role, city, service_type_id, is_verified, limit, offset } = req.query;
        const filters = {
            role: role,
            city: city,
            service_type_id: service_type_id,
            is_verified: is_verified === "true"
                ? true
                : is_verified === "false"
                    ? false
                    : undefined,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
        };
        const profiles = await (0, profiles_service_1.searchProfiles)(filters);
        return (0, response_1.success)(res, profiles);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.search = search;
