"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMine = exports.getForProfessional = exports.create = void 0;
const reviews_service_1 = require("./reviews.service");
const response_1 = require("../../utils/response");
const create = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const { booking_id, professional_id, rating, comment } = req.body;
        if (!booking_id || !professional_id || !rating) {
            return (0, response_1.error)(res, "Réservation, professionnel et note requis", 400);
        }
        if (rating < 1 || rating > 5) {
            return (0, response_1.error)(res, "La note doit être entre 1 et 5", 400);
        }
        const review = await (0, reviews_service_1.createReview)(req.user.id, {
            booking_id,
            professional_id,
            rating,
            comment,
        });
        return (0, response_1.success)(res, review, 201);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.create = create;
const getForProfessional = async (req, res) => {
    try {
        const professionalId = req.params.professionalId;
        const { limit, offset } = req.query;
        const reviews = await (0, reviews_service_1.getProfessionalReviews)(professionalId, limit ? parseInt(limit) : undefined, offset ? parseInt(offset) : undefined);
        return (0, response_1.success)(res, reviews);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.getForProfessional = getForProfessional;
const getMine = async (req, res) => {
    try {
        if (!req.user) {
            return (0, response_1.error)(res, "Non autorisé", 401);
        }
        const reviews = await (0, reviews_service_1.getMyReviews)(req.user.id);
        return (0, response_1.success)(res, reviews);
    }
    catch (err) {
        return (0, response_1.error)(res, err.message);
    }
};
exports.getMine = getMine;
