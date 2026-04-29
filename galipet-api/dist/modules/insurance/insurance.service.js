"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLeadStatus = exports.getAllLeads = exports.getMyLeads = exports.submitLead = void 0;
const supabase_1 = __importDefault(require("../../config/supabase"));
const submitLead = async (ownerId, leadData) => {
    // Vérifie que le pet appartient à l'owner
    const { data: pet, error: petError } = await supabase_1.default
        .from("pets")
        .select("*")
        .eq("id", leadData.pet_id)
        .eq("owner_id", ownerId)
        .single();
    if (petError || !pet) {
        throw new Error("Animal introuvable");
    }
    const { data, error } = await supabase_1.default
        .from("insurance_leads")
        .insert({
        owner_id: ownerId,
        pet_id: leadData.pet_id,
        full_name: leadData.full_name,
        email: leadData.email,
        phone: leadData.phone,
        pet_name: pet.name,
        pet_species: pet.species,
        city: leadData.city,
        status: "pending",
    })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.submitLead = submitLead;
const getMyLeads = async (ownerId) => {
    const { data, error } = await supabase_1.default
        .from("insurance_leads")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getMyLeads = getMyLeads;
const getAllLeads = async (filters) => {
    let query = supabase_1.default.from("insurance_leads").select("*");
    if (filters?.status) {
        query = query.eq("status", filters.status);
    }
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
    const { data, error } = await query;
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getAllLeads = getAllLeads;
const updateLeadStatus = async (leadId, status) => {
    const { data, error } = await supabase_1.default
        .from("insurance_leads")
        .update({ status })
        .eq("id", leadId)
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.updateLeadStatus = updateLeadStatus;
