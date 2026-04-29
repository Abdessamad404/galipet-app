"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.getAvailable = exports.getMine = exports.create = void 0;
const availability_service_1 = require("./availability.service");
const response_1 = require("../../utils/response");
const create = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const { start_time, end_time } = req.body;
        if (!start_time || !end_time) {
            return (0, response_1.error)(res, "Heure de début et de fin requises", 400);
        }
        const slot = await (0, availability_service_1.createSlot)(req.user.id, { start_time, end_time });
        return (0, response_1.success)(res, slot, 201);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.create = create;
const getMine = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const slots = await (0, availability_service_1.getMySlots)(req.user.id);
        return (0, response_1.success)(res, slots);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.getMine = getMine;
const getAvailable = async (req, res) => {
    try {
        const professionalId = req.params.professionalId;
        const fromDate = req.query.fromDate;
        const slots = await (0, availability_service_1.getAvailableSlots)(professionalId, fromDate);
        return (0, response_1.success)(res, slots);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.getAvailable = getAvailable;
const update = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const id = req.params.id;
        const updates = req.body;
        const slot = await (0, availability_service_1.updateSlot)(id, req.user.id, updates);
        return (0, response_1.success)(res, slot);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.update = update;
const remove = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const id = req.params.id;
        const result = await (0, availability_service_1.deleteSlot)(id, req.user.id);
        return (0, response_1.success)(res, result);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.remove = remove;
