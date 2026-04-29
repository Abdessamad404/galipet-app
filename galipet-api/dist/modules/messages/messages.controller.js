"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unreadCount = exports.markRead = exports.getByBooking = exports.send = void 0;
const messages_service_1 = require("./messages.service");
const response_1 = require("../../utils/response");
const send = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const { booking_id, receiver_id, content } = req.body;
        if (!booking_id || !receiver_id || !content) {
            return (0, response_1.error)(res, "Tous les champs sont requis", 400);
        }
        const message = await (0, messages_service_1.sendMessage)(req.user.id, {
            booking_id,
            receiver_id,
            content,
        });
        return (0, response_1.success)(res, message, 201);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.send = send;
const getByBooking = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const bookingId = req.params.bookingId;
        const messages = await (0, messages_service_1.getBookingMessages)(bookingId, req.user.id);
        return (0, response_1.success)(res, messages);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.getByBooking = getByBooking;
const markRead = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const id = req.params.id;
        const message = await (0, messages_service_1.markAsRead)(id, req.user.id);
        return (0, response_1.success)(res, message);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.markRead = markRead;
const unreadCount = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const result = await (0, messages_service_1.getUnreadCount)(req.user.id);
        return (0, response_1.success)(res, result);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.unreadCount = unreadCount;
