"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = exports.getAll = exports.getMine = exports.submit = void 0;
const insurance_service_1 = require("./insurance.service");
const response_1 = require("../../utils/response");
const submit = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const { pet_id, full_name, email, phone, city } = req.body;
        if (!pet_id || !full_name || !email || !phone || !city) {
            return (0, response_1.error)(res, "Tous les champs sont requis", 400);
        }
        const lead = await (0, insurance_service_1.submitLead)(req.user.id, {
            pet_id,
            full_name,
            email,
            phone,
            city,
        });
        return (0, response_1.success)(res, lead, 201);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.submit = submit;
const getMine = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const leads = await (0, insurance_service_1.getMyLeads)(req.user.id);
        return (0, response_1.success)(res, leads);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.getMine = getMine;
const getAll = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        // Cette route pourrait être restreinte aux admins dans une vraie app
        const { status, limit, offset } = req.query;
        const leads = await (0, insurance_service_1.getAllLeads)({
            status: status,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
        });
        return (0, response_1.success)(res, leads);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.getAll = getAll;
const updateStatus = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const id = req.params.id;
        const { status } = req.body;
        if (!["pending", "contacted", "converted", "rejected"].includes(status)) {
            return (0, response_1.error)(res, "Statut invalide", 400);
        }
        const lead = await (0, insurance_service_1.updateLeadStatus)(id, status);
        return (0, response_1.success)(res, lead);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.updateStatus = updateStatus;
