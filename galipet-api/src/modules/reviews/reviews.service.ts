import supabase from "../../config/supabase";

export const createReview = async (
  reviewerId: string,
  reviewData: {
    booking_id: string;
    professional_id: string;
    rating: number;
    comment?: string;
  },
) => {
  // Vérifie que la réservation existe et est complétée
  const { data: booking } = await supabase
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
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("*")
    .eq("booking_id", reviewData.booking_id)
    .single();

  if (existingReview) {
    throw new Error("Vous avez déjà noté cette réservation");
  }

  // Crée l'avis
  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      booking_id: reviewData.booking_id,
      reviewer_id: reviewerId,
      reviewee_id: reviewData.professional_id,
      rating: reviewData.rating,
      comment: reviewData.comment,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Met à jour la note moyenne du professionnel
  await updateProfessionalRating(reviewData.professional_id);

  return review;
};

// Fonction helper pour mettre à jour la note moyenne d'un professionnel
const updateProfessionalRating = async (professionalId: string) => {
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewee_id", professionalId);

  if (!reviews || reviews.length === 0) return;

  const avg =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const count = reviews.length;

  await supabase
    .from("profiles")
    .update({ rating_avg: avg, rating_count: count })
    .eq("id", professionalId);
};

export const getProfessionalReviews = async (
  professionalId: string,
  limit = 20,
  offset = 0,
) => {
  // Étape 1 : récupère les reviews brutes
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, reviewer_id, reviewee_id, booking_id")
    .eq("reviewee_id", professionalId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  if (!reviews || reviews.length === 0) return [];

  // Étape 2 : récupère les profils des reviewers en une seule requête
  const reviewerIds = [...new Set(reviews.map((r) => r.reviewer_id))];
  const { data: reviewers } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", reviewerIds);

  const reviewerMap = Object.fromEntries(
    (reviewers ?? []).map((p) => [p.id, p]),
  );

  return reviews.map((r) => ({
    ...r,
    reviewer: reviewerMap[r.reviewer_id] ?? null,
  }));
};

export const getMyReviews = async (professionalId: string) => {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id, rating, comment, created_at, reviewer_id, reviewee_id, booking_id,
      reviewer:profiles!reviewer_id(id, full_name, avatar_url),
      booking:bookings!booking_id(id, service_type)
    `)
    .eq("reviewee_id", professionalId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};
