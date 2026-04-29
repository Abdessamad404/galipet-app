"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.markAsRead = exports.getBookingMessages = exports.sendMessage = void 0;
const supabase_1 = __importDefault(require("../../config/supabase"));
const sendMessage = async (senderId, messageData) => {
    // Vérifie que l'utilisateur fait partie de la réservation
    const { data: booking } = await supabase_1.default
        .from("bookings")
        .select("owner_id, professional_id")
        .eq("id", messageData.booking_id)
        .single();
    if (!booking) {
        throw new Error("Réservation introuvable");
    }
    const isPartOfBooking = booking.owner_id === senderId || booking.professional_id === senderId;
    if (!isPartOfBooking) {
        throw new Error("Vous ne faites pas partie de cette réservation");
    }
    // Vérifie que le receiver fait aussi partie de la réservation
    const isReceiverPartOfBooking = booking.owner_id === messageData.receiver_id ||
        booking.professional_id === messageData.receiver_id;
    if (!isReceiverPartOfBooking) {
        throw new Error("Le destinataire ne fait pas partie de cette réservation");
    }
    const { data, error } = await supabase_1.default
        .from("messages")
        .insert({
        booking_id: messageData.booking_id,
        sender_id: senderId,
        receiver_id: messageData.receiver_id,
        content: messageData.content,
        is_read: false,
    })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.sendMessage = sendMessage;
const getBookingMessages = async (bookingId, userId) => {
    // Vérifie que l'utilisateur fait partie de la réservation
    const { data: booking } = await supabase_1.default
        .from("bookings")
        .select("owner_id, professional_id")
        .eq("id", bookingId)
        .single();
    if (!booking) {
        throw new Error("Réservation introuvable");
    }
    const isPartOfBooking = booking.owner_id === userId || booking.professional_id === userId;
    if (!isPartOfBooking) {
        throw new Error("Non autorisé");
    }
    const { data, error } = await supabase_1.default
        .from("messages")
        .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
      receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url)
    `)
        .eq("booking_id", bookingId)
        .order("sent_at", { ascending: true });
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getBookingMessages = getBookingMessages;
const markAsRead = async (messageId, userId) => {
    // Vérifie que le message est destiné à l'utilisateur
    const { data: message } = await supabase_1.default
        .from("messages")
        .select("receiver_id")
        .eq("id", messageId)
        .single();
    if (!message) {
        throw new Error("Message introuvable");
    }
    if (message.receiver_id !== userId) {
        throw new Error("Non autorisé");
    }
    const { data, error } = await supabase_1.default
        .from("messages")
        .update({ is_read: true })
        .eq("id", messageId)
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.markAsRead = markAsRead;
const getUnreadCount = async (userId) => {
    const { count, error } = await supabase_1.default
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", userId)
        .eq("is_read", false);
    if (error)
        throw new Error(error.message);
    return { unread_count: count || 0 };
};
exports.getUnreadCount = getUnreadCount;
