"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatus = exports.getBookingById = exports.getMyBookings = exports.createBooking = void 0;
const supabase_1 = __importDefault(require("../../config/supabase"));
const createBooking = async (ownerId, bookingData) => {
    // 1. Vérifie que le slot existe et n'est pas déjà booké
    const { data: slot, error: slotError } = await supabase_1.default
        .from("availability_slots")
        .select("*")
        .eq("id", bookingData.slot_id)
        .eq("professional_id", bookingData.professional_id)
        .single();
    if (slotError || !slot) {
        throw new Error("Créneau introuvable");
    }
    if (slot.is_booked) {
        throw new Error("Ce créneau est déjà réservé");
    }
    // 2. Vérifie que le pet appartient bien à l'owner
    const { data: pet } = await supabase_1.default
        .from("pets")
        .select("*")
        .eq("id", bookingData.pet_id)
        .eq("owner_id", ownerId)
        .single();
    if (!pet) {
        throw new Error("Animal introuvable");
    }
    // 3. Crée la réservation
    const { data: booking, error: bookingError } = await supabase_1.default
        .from("bookings")
        .insert({
        owner_id: ownerId,
        professional_id: bookingData.professional_id,
        pet_id: bookingData.pet_id,
        service_type_id: bookingData.service_type_id,
        slot_id: bookingData.slot_id,
        price: bookingData.price,
        notes: bookingData.notes,
        status: "pending",
    })
        .select()
        .single();
    if (bookingError)
        throw new Error(bookingError.message);
    // 4. Marque le slot comme booké
    await supabase_1.default
        .from("availability_slots")
        .update({ is_booked: true })
        .eq("id", bookingData.slot_id);
    return booking;
};
exports.createBooking = createBooking;
const getMyBookings = async (userId, role) => {
    let query = supabase_1.default.from("bookings").select(`
      *,
      owner:profiles!bookings_owner_id_fkey(id, full_name, avatar_url),
      professional:profiles!bookings_professional_id_fkey(id, full_name, avatar_url),
      pet:pets(id, name, species, photo_url)
    `);
    if (role === "owner") {
        query = query.eq("owner_id", userId);
    }
    else {
        query = query.eq("professional_id", userId);
    }
    query = query
        .is("deleted_at", null)
        .order("booked_at", { ascending: false });
    const { data, error } = await query;
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getMyBookings = getMyBookings;
const getBookingById = async (bookingId, userId) => {
    const { data, error } = await supabase_1.default
        .from("bookings")
        .select(`
      *,
      owner:profiles!bookings_owner_id_fkey(id, full_name, avatar_url, phone),
      professional:profiles!bookings_professional_id_fkey(id, full_name, avatar_url, phone),
      pet:pets(id, name, species, breed, photo_url)
    `)
        .eq("id", bookingId)
        .or(`owner_id.eq.${userId},professional_id.eq.${userId}`)
        .is("deleted_at", null)
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getBookingById = getBookingById;
const updateBookingStatus = async (bookingId, userId, status) => {
    // Récupère la réservation
    const { data: booking } = await supabase_1.default
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();
    if (!booking) {
        throw new Error("Réservation introuvable");
    }
    // Seul le professionnel peut confirmer ou marquer comme complété
    if ((status === "confirmed" || status === "completed") &&
        booking.professional_id !== userId) {
        throw new Error("Seul le professionnel peut modifier ce statut");
    }
    // Owner ou professional peuvent annuler
    if (status === "cancelled") {
        if (booking.owner_id !== userId && booking.professional_id !== userId) {
            throw new Error("Non autorisé");
        }
        // Libère le créneau
        await supabase_1.default
            .from("availability_slots")
            .update({ is_booked: false })
            .eq("id", booking.slot_id);
    }
    const { data, error } = await supabase_1.default
        .from("bookings")
        .update({ status })
        .eq("id", bookingId)
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.updateBookingStatus = updateBookingStatus;
