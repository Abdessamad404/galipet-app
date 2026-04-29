import supabase from "../../config/supabase";
import { v2 as cloudinary } from "cloudinary";

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getProfileById = async (profileId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateProfile = async (
  profileId: string,
  updates: {
    full_name?: string;
    phone?: string;
    city?: string;
    bio?: string;
    service_type_ids?: string[];
    accepts_insurance?: boolean;
    location_text?: string;
    price_per_day?: number;
  },
) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", profileId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const uploadAvatar = async (
  profileId: string,
  imageBuffer: Buffer,
  fileName: string,
) => {
  // Upload vers Cloudinary
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "galipet/avatars",
        public_id: `${profileId}_${Date.now()}`,
        resource_type: "image",
      },
      async (error, result) => {
        if (error) return reject(error);

        // Met à jour le profil avec l'URL de l'avatar
        const { data, error: updateError } = await supabase
          .from("profiles")
          .update({ avatar_url: result!.secure_url })
          .eq("id", profileId)
          .select()
          .single();

        if (updateError) return reject(updateError);
        resolve(data);
      },
    );

    uploadStream.end(imageBuffer);
  });
};

export const searchProfiles = async (filters: {
  role?: "professional" | "both";
  city?: string;
  service?: string;
  service_type_id?: string;
  is_verified?: boolean;
  limit?: number;
  offset?: number;
}) => {
  let query = supabase.from("profiles").select("*");

  // Toujours limiter aux professionnels sauf si un rôle spécifique est demandé
  const roleFilter = filters.role ? [filters.role] : ["professional", "both"];
  query = query.in("role", roleFilter);

  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }

  if (filters.service) {
    query = query.contains("services", [filters.service]);
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
  if (error) throw new Error(error.message);
  return data;
};

export const updateFcmToken = async (userId: string, fcmToken: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({ fcm_token: fcmToken })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};
