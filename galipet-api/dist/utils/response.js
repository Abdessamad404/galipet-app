"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.success = void 0;
const success = (res, data, status = 200) => {
    const body = { success: true, data };
    return res.status(status).json(body);
};
exports.success = success;
const error = (res, message, status = 400) => {
    const body = { success: false, error: message };
    return res.status(status).json(body);
};
exports.error = error;
