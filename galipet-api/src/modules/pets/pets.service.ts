import supabase from "../../config/supabase";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createPet = async (
  ownerId: string,
  petData: {
    name: string;
    species: string;
    breed?: string;
    age?: number;
    weight?: number;
    notes?: string;
  },
) => {
  const { data, error } = await supabase
    .from("pets")
    .insert({ ...petData, owner_id: ownerId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getMyPets = async (ownerId: string) => {
  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getPetById = async (petId: string, ownerId: string) => {
  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .eq("id", petId)
    .eq("owner_id", ownerId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updatePet = async (
  petId: string,
  ownerId: string,
  updates: {
    name?: string;
    species?: string;
    breed?: string;
    age?: number;
    weight?: number;
    notes?: string;
  },
) => {
  const { data, error } = await supabase
    .from("pets")
    .update(updates)
    .eq("id", petId)
    .eq("owner_id", ownerId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deletePet = async (petId: string, ownerId: string) => {
  // Vérifie qu'aucune réservation active n'est liée à cet animal
  const { count } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("pet_id", petId)
    .in("status", ["pending", "confirmed", "in_progress"]);

  if (count && count > 0) {
    throw new Error(
      "Impossible de supprimer un animal ayant des réservations en cours. Annulez d'abord les réservations associées.",
    );
  }

  const { error } = await supabase
    .from("pets")
    .delete()
    .eq("id", petId)
    .eq("owner_id", ownerId);

  if (error) throw new Error(error.message);
  return { success: true };
};

export const uploadPetPhoto = async (
  petId: string,
  ownerId: string,
  imageBuffer: Buffer,
) => {
  // Vérifie que le pet appartient bien à l'utilisateur
  await getPetById(petId, ownerId);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "galipet/pets",
        public_id: `${petId}_${Date.now()}`,
        resource_type: "image",
      },
      async (error, result) => {
        if (error) return reject(error);

        const { data, error: updateError } = await supabase
          .from("pets")
          .update({ photo_url: result!.secure_url })
          .eq("id", petId)
          .eq("owner_id", ownerId)
          .select()
          .single();

        if (updateError) return reject(updateError);
        resolve(data);
      },
    );

    uploadStream.end(imageBuffer);
  });
};
