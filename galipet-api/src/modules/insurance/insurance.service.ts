import supabase from "../../config/supabase";

export const submitLead = async (
  ownerId: string,
  leadData: {
    pet_id: string;
    full_name: string;
    phone: string;
    city: string;
  },
) => {
  // Vérifie que le pet appartient à l'owner
  const { data: pet, error: petError } = await supabase
    .from("pets")
    .select("*")
    .eq("id", leadData.pet_id)
    .eq("owner_id", ownerId)
    .single();

  if (petError || !pet) {
    throw new Error("Animal introuvable");
  }

  const { data, error } = await supabase
    .from("insurance_leads")
    .insert({
      owner_id: ownerId,
      pet_id: leadData.pet_id,
      pet_name: pet.name,
      pet_species: pet.species,
      owner_name: leadData.full_name,
      owner_phone: leadData.phone,
      owner_city: leadData.city,
      status: "new",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getMyLeads = async (ownerId: string) => {
  const { data, error } = await supabase
    .from("insurance_leads")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getAllLeads = async (filters?: {
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  let query = supabase.from("insurance_leads").select("*");

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const updateLeadStatus = async (
  leadId: string,
  status: "new" | "contacted" | "converted" | "rejected",
) => {
  const { data, error } = await supabase
    .from("insurance_leads")
    .update({ status })
    .eq("id", leadId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};
