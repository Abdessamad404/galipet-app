"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = exports.getOne = exports.getMine = exports.create = void 0;
const bookings_service_1 = require("./bookings.service");
const response_1 = require("../../utils/response");
const create = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const { professional_id, pet_id, service_type_id, slot_id, price, notes } = req.body;
        if (!professional_id || !pet_id || !service_type_id || !slot_id) {
            return (0, response_1.error)(res, "Professionnel, animal, service et créneau requis", 400);
        }
        const booking = await (0, bookings_service_1.createBooking)(req.user.id, {
            professional_id,
            pet_id,
            service_type_id,
            slot_id,
            price,
            notes,
        });
        return (0, response_1.success)(res, booking, 201);
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
        const { asRole } = req.query;
        const role = asRole === "professional"
            ? "professional"
            : "owner";
        const bookings = await (0, bookings_service_1.getMyBookings)(req.user.id, role);
        return (0, response_1.success)(res, bookings);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.getMine = getMine;
const getOne = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const id = req.params.id;
        const booking = await (0, bookings_service_1.getBookingById)(id, req.user.id);
        return (0, response_1.success)(res, booking);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message, 404);
    }
};
exports.getOne = getOne;
const updateStatus = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const id = req.params.id;
        const { status } = req.body;
        if (!["confirmed", "cancelled", "completed"].includes(status)) {
            return (0, response_1.error)(res, "Statut invalide", 400);
        }
        const booking = await (0, bookings_service_1.updateBookingStatus)(id, req.user.id, status);
        return (0, response_1.success)(res, booking);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.updateStatus = updateStatus;
