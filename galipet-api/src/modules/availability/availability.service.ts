import supabase from "../../config/supabase";

export const createSlot = async (
  professionalId: string,
  slotData: {
    date: string;
    start_time: string;
    end_time: string;
  },
) => {
  // Vérifie que l'utilisateur est un professionnel
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", professionalId)
    .single();

  if (!profile || (profile.role !== "professional" && profile.role !== "both")) {
    throw new Error("Seuls les professionnels peuvent créer des créneaux");
  }

  const { data, error } = await supabase
    .from("availability_slots")
    .insert({
      professional_id: professionalId,
      date: slotData.date,
      start_time: slotData.start_time,
      end_time: slotData.end_time,
      is_booked: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getMySlots = async (professionalId: string) => {
  const { data, error } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("professional_id", professionalId)
    .order("start_time", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

export const getAvailableSlots = async (
  professionalId: string,
  fromDate?: string,
) => {
  const today = fromDate ?? new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("professional_id", professionalId)
    .eq("is_booked", false)
    .gte("date", today)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

export const updateSlot = async (
  slotId: string,
  professionalId: string,
  updates: {
    start_time?: string;
    end_time?: string;
  },
) => {
  // Vérifie que le slot appartient au professionnel et n'est pas booké
  const { data: slot } = await supabase
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

  const { data, error } = await supabase
    .from("availability_slots")
    .update(updates)
    .eq("id", slotId)
    .eq("professional_id", professionalId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteSlot = async (slotId: string, professionalId: string) => {
  // Vérifie que le slot n'est pas booké
  const { data: slot } = await supabase
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

  const { error } = await supabase
    .from("availability_slots")
    .delete()
    .eq("id", slotId)
    .eq("professional_id", professionalId);

  if (error) throw new Error(error.message);
  return { success: true };
};
