"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSlot = exports.updateSlot = exports.getAvailableSlots = exports.getMySlots = exports.createSlot = void 0;
const supabase_1 = __importDefault(require("../../config/supabase"));
const createSlot = async (professionalId, slotData) => {
    // Vérifie que l'utilisateur est un professionnel
    const { data: profile } = await supabase_1.default
        .from("profiles")
        .select("role")
        .eq("id", professionalId)
        .single();
    if (!profile || (profile.role !== "professional" && profile.role !== "both")) {
        throw new Error("Seuls les professionnels peuvent créer des créneaux");
    }
    const { data, error } = await supabase_1.default
        .from("availability_slots")
        .insert({
        professional_id: professionalId,
        start_time: slotData.start_time,
        end_time: slotData.end_time,
        is_booked: false,
    })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.createSlot = createSlot;
const getMySlots = async (professionalId) => {
    const { data, error } = await supabase_1.default
        .from("availability_slots")
        .select("*")
        .eq("professional_id", professionalId)
        .order("start_time", { ascending: true });
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getMySlots = getMySlots;
const getAvailableSlots = async (professionalId, fromDate) => {
    let query = supabase_1.default
        .from("availability_slots")
        .select("*")
        .eq("professional_id", professionalId)
        .eq("is_booked", false);
    if (fromDate) {
        query = query.gte("start_time", fromDate);
    }
    query = query.order("start_time", { ascending: true });
    const { data, error } = await query;
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getAvailableSlots = getAvailableSlots;
const updateSlot = async (slotId, professionalId, updates) => {
    // Vérifie que le slot appartient au professionnel et n'est pas booké
    const { data: slot } = await supabase_1.default
        .from("availability_slots")
        .select("*")
        .eq("id", slotId)
        .eq("professional_id", professionalId)
        .single();
    if (!slot) {
        throw new Error("Créneau non trouvé");
    }
    if (slot.is_booked) {
        throw new Error("Impossible de modifier un créneau déjà réservé");
    }
    const { data, error } = await supabase_1.default
        .from("availability_slots")
        .update(updates)
        .eq("id", slotId)
        .eq("professional_id", professionalId)
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.updateSlot = updateSlot;
const deleteSlot = async (slotId, professionalId) => {
    // Vérifie que le slot n'est pas booké
    const { data: slot } = await supabase_1.default
        .from("availability_slots")
        .select("is_booked")
        .eq("id", slotId)
        .eq("professional_id", professionalId)
        .single();
    if (!slot) {
        throw new Error("Créneau non trouvé");
    }
    if (slot.is_booked) {
        throw new Error("Impossible de supprimer un créneau déjà réservé");
    }
    const { error } = await supabase_1.default
        .from("availability_slots")
        .delete()
        .eq("id", slotId)
        .eq("professional_id", professionalId);
    if (error)
        throw new Error(error.message);
    return { success: true };
};
exports.deleteSlot = deleteSlot;
