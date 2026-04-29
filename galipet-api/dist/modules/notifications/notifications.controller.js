"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unreadCount = exports.markAllRead = exports.markRead = exports.getMine = void 0;
const notifications_service_1 = require("./notifications.service");
const response_1 = require("../../utils/response");
const getMine = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const { limit } = req.query;
        const notifications = await (0, notifications_service_1.getMyNotifications)(req.user.id, limit ? parseInt(limit) : undefined);
        return (0, response_1.success)(res, notifications);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.getMine = getMine;
const markRead = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const id = req.params.id;
        const notification = await (0, notifications_service_1.markAsRead)(id, req.user.id);
        return (0, response_1.success)(res, notification);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.markRead = markRead;
const markAllRead = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const result = await (0, notifications_service_1.markAllAsRead)(req.user.id);
        return (0, response_1.success)(res, result);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.markAllRead = markAllRead;
const unreadCount = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const result = await (0, notifications_service_1.getUnreadCount)(req.user.id);
        return (0, response_1.success)(res, result);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.unreadCount = unreadCount;
