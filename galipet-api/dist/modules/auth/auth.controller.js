"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.login = exports.register = void 0;
const auth_service_1 = require("./auth.service");
const response_1 = require("../../utils/response");
const register = async (req, res) => {
    try {
        const { email, password, full_name, role } = req.body;
        if (!email || !password || !full_name || !role) {
            return (0, response_1.error)(res, "Tous les champs sont requis", 400);
        }
        const data = await (0, auth_service_1.registerUser)(email, password, full_name, role);
        return (0, response_1.success)(res, data, 201);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return (0, response_1.error)(res, "Email et mot de passe requis", 400);
        }
        const data = await (0, auth_service_1.loginUser)(email, password);
        return (0, response_1.success)(res, data);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message, 401);
    }
};
exports.login = login;
const me = async (req, res) => {
    try {
        // req.user est défini par le middleware protect
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const profile = await (0, auth_service_1.getCurrentUser)(req.user.id);
        return (0, response_1.success)(res, profile);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.me = me;
