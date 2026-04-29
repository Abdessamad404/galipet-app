"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPetPhoto = exports.deletePet = exports.updatePet = exports.getPetById = exports.getMyPets = exports.createPet = void 0;
const supabase_1 = __importDefault(require("../../config/supabase"));
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const createPet = async (ownerId, petData) => {
    const { data, error } = await supabase_1.default
        .from("pets")
        .insert({ ...petData, owner_id: ownerId })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.createPet = createPet;
const getMyPets = async (ownerId) => {
    const { data, error } = await supabase_1.default
        .from("pets")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getMyPets = getMyPets;
const getPetById = async (petId, ownerId) => {
    const { data, error } = await supabase_1.default
        .from("pets")
        .select("*")
        .eq("id", petId)
        .eq("owner_id", ownerId)
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getPetById = getPetById;
const updatePet = async (petId, ownerId, updates) => {
    const { data, error } = await supabase_1.default
        .from("pets")
        .update(updates)
        .eq("id", petId)
        .eq("owner_id", ownerId)
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.updatePet = updatePet;
const deletePet = async (petId, ownerId) => {
    const { error } = await supabase_1.default
        .from("pets")
        .delete()
        .eq("id", petId)
        .eq("owner_id", ownerId);
    if (error)
        throw new Error(error.message);
    return { success: true };
};
exports.deletePet = deletePet;
const uploadPetPhoto = async (petId, ownerId, imageBuffer) => {
    // Vérifie que le pet appartient bien à l'utilisateur
    await (0, exports.getPetById)(petId, ownerId);
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: "galipet/pets",
            public_id: `${petId}_${Date.now()}`,
            resource_type: "image",
        }, async (error, result) => {
            if (error)
                return reject(error);
            const { data, error: updateError } = await supabase_1.default
                .from("pets")
                .update({ photo_url: result.secure_url })
                .eq("id", petId)
                .eq("owner_id", ownerId)
                .select()
                .single();
            if (updateError)
                return reject(updateError);
            resolve(data);
        });
        uploadStream.end(imageBuffer);
    });
};
exports.uploadPetPhoto = uploadPetPhoto;
