import supabase from "../../config/supabase";

export const createBooking = async (
  ownerId: string,
  bookingData: {
    professional_id: string;
    pet_id: string;
    slot_id: string;
    service_type: string;
    price?: number;
    notes?: string;
  },
) => {
  // 1. Vérifie que le slot existe et n'est pas déjà booké
  const { data: slot, error: slotError } = await supabase
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
  const { data: pet } = await supabase
    .from("pets")
    .select("*")
    .eq("id", bookingData.pet_id)
    .eq("owner_id", ownerId)
    .single();

  if (!pet) {
    throw new Error("Animal introuvable");
  }

  // 3. Crée la réservation
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      owner_id: ownerId,
      professional_id: bookingData.professional_id,
      pet_id: bookingData.pet_id,
      availability_slot_id: bookingData.slot_id,
      start_date: slot.date,
      end_date: slot.date,
      service_type: bookingData.service_type,
      total_price: bookingData.price,
      notes: bookingData.notes,
      status: "pending",
    })
    .select()
    .single();

  if (bookingError) throw new Error(bookingError.message);

  // 4. Marque le slot comme booké
  await supabase
    .from("availability_slots")
    .update({ is_booked: true })
    .eq("id", bookingData.slot_id);

  return booking;
};

export const getMyBookings = async (
  userId: string,
  role: "owner" | "professional",
) => {
  let query = supabase.from("bookings").select(`
      *,
      owner:profiles!bookings_owner_id_fkey(id, full_name, avatar_url),
      professional:profiles!bookings_professional_id_fkey(id, full_name, avatar_url),
      pet:pets(id, name, species, photo_url)
    `);

  if (role === "owner") {
    query = query.eq("owner_id", userId);
  } else {
    query = query.eq("professional_id", userId);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const getBookingById = async (bookingId: string, userId: string) => {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      owner:profiles!bookings_owner_id_fkey(id, full_name, avatar_url, phone),
      professional:profiles!bookings_professional_id_fkey(id, full_name, avatar_url, phone),
      pet:pets(id, name, species, breed, photo_url)
    `)
    .eq("id", bookingId)
    .or(`owner_id.eq.${userId},professional_id.eq.${userId}`)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateBookingStatus = async (
  bookingId: string,
  userId: string,
  status: "confirmed" | "in_progress" | "cancelled" | "completed",
) => {
  // Récupère la réservation
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    throw new Error("Réservation introuvable");
  }

  // Seul le professionnel peut confirmer, démarrer ou marquer comme complété
  if ((status === "confirmed" || status === "in_progress" || status === "completed") &&
      booking.professional_id !== userId) {
    throw new Error("Seul le professionnel peut modifier ce statut");
  }

  // Owner ou professional peuvent annuler
  if (status === "cancelled") {
    if (booking.owner_id !== userId && booking.professional_id !== userId) {
      throw new Error("Non autorisé");
    }

    // Libère le créneau
    await supabase
      .from("availability_slots")
      .update({ is_booked: false })
      .eq("id", booking.availability_slot_id);
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};
