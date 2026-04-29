"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyReviews = exports.getProfessionalReviews = exports.createReview = void 0;
const supabase_1 = __importDefault(require("../../config/supabase"));
const createReview = async (reviewerId, reviewData) => {
    // Vérifie que la réservation existe et est complétée
    const { data: booking } = await supabase_1.default
        .from("bookings")
        .select("*")
        .eq("id", reviewData.booking_id)
        .eq("owner_id", reviewerId)
        .single();
    if (!booking) {
        throw new Error("Réservation introuvable");
    }
    if (booking.status !== "completed") {
        throw new Error("Seules les réservations complétées peuvent être notées");
    }
    if (booking.professional_id !== reviewData.professional_id) {
        throw new Error("Le professionnel ne correspond pas à cette réservation");
    }
    // Vérifie qu'il n'y a pas déjà un avis pour cette réservation
    const { data: existingReview } = await supabase_1.default
        .from("reviews")
        .select("*")
        .eq("booking_id", reviewData.booking_id)
        .single();
    if (existingReview) {
        throw new Error("Vous avez déjà noté cette réservation");
    }
    // Crée l'avis
    const { data: review, error } = await supabase_1.default
        .from("reviews")
        .insert({
        booking_id: reviewData.booking_id,
        reviewer_id: reviewerId,
        professional_id: reviewData.professional_id,
        rating: reviewData.rating,
        comment: reviewData.comment,
    })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    // Met à jour la note moyenne du professionnel
    await updateProfessionalRating(reviewData.professional_id);
    return review;
};
exports.createReview = createReview;
// Fonction helper pour mettre à jour la note moyenne d'un professionnel
const updateProfessionalRating = async (professionalId) => {
    const { data: reviews } = await supabase_1.default
        .from("reviews")
        .select("rating")
        .eq("professional_id", professionalId);
    if (!reviews || reviews.length === 0)
        return;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const count = reviews.length;
    await supabase_1.default
        .from("profiles")
        .update({ rating_avg: avg, rating_count: count })
        .eq("id", professionalId);
};
const getProfessionalReviews = async (professionalId, limit = 20, offset = 0) => {
    const { data, error } = await supabase_1.default
        .from("reviews")
        .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url),
      booking:bookings(id, service_type_id)
    `)
        .eq("professional_id", professionalId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getProfessionalReviews = getProfessionalReviews;
const getMyReviews = async (professionalId) => {
    const { data, error } = await supabase_1.default
        .from("reviews")
        .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url),
      booking:bookings(id, service_type_id)
    `)
        .eq("professional_id", professionalId)
        .order("created_at", { ascending: false });
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getMyReviews = getMyReviews;
