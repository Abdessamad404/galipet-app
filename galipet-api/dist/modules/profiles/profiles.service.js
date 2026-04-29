"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProfiles = exports.uploadAvatar = exports.updateProfile = exports.getProfileById = void 0;
const supabase_1 = __importDefault(require("../../config/supabase"));
const cloudinary_1 = require("cloudinary");
// Configuration Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const getProfileById = async (profileId) => {
    const { data, error } = await supabase_1.default
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getProfileById = getProfileById;
const updateProfile = async (profileId, updates) => {
    const { data, error } = await supabase_1.default
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", profileId)
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.updateProfile = updateProfile;
const uploadAvatar = async (profileId, imageBuffer, fileName) => {
    // Upload vers Cloudinary
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: "galipet/avatars",
            public_id: `${profileId}_${Date.now()}`,
            resource_type: "image",
        }, async (error, result) => {
            if (error)
                return reject(error);
            // Met à jour le profil avec l'URL de l'avatar
            const { data, error: updateError } = await supabase_1.default
                .from("profiles")
                .update({ avatar_url: result.secure_url })
                .eq("id", profileId)
                .select()
                .single();
            if (updateError)
                return reject(updateError);
            resolve(data);
        });
        uploadStream.end(imageBuffer);
    });
};
exports.uploadAvatar = uploadAvatar;
const searchProfiles = async (filters) => {
    let query = supabase_1.default.from("profiles").select("*");
    // Filtre par rôle (professional ou both)
    if (filters.role) {
        query = query.in("role", ["professional", "both"]);
    }
    if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
    }
    if (filters.service_type_id) {
        query = query.contains("service_type_ids", [filters.service_type_id]);
    }
    if (filters.is_verified !== undefined) {
        query = query.eq("is_verified", filters.is_verified);
    }
    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);
    // Tri par note moyenne
    query = query.order("rating_avg", { ascending: false, nullsFirst: false });
    const { data, error } = await query;
    if (error)
        throw new Error(error.message);
    return data;
};
exports.searchProfiles = searchProfiles;
