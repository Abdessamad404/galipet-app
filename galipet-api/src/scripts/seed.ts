import dotenv from "dotenv";
dotenv.config();

import supabase from "../config/supabase";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin Gali'Pet";

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env");
  process.exit(1);
}

// ─── Auth helpers ────────────────────────────────────────────────────────────

const getOrCreateAuthUser = async (
  email: string,
  password: string,
): Promise<string> => {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (!error) return data.user.id;

  if (error.message.includes("already been registered")) {
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });
    if (listErr) {
      console.error(listErr.message);
      process.exit(1);
    }
    const found = list.users.find(u => u.email === email);
    if (!found) {
      console.error(`Auth user ${email} not found`);
      process.exit(1);
    }
    return found.id;
  }

  console.error(`Auth error for ${email}:`, error.message);
  process.exit(1);
};

const ensureProfile = async (
  userId: string,
  profile: Record<string, unknown>,
): Promise<void> => {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("user_id", userId);
    if (error)
      console.error(`Profile update (${profile.email}):`, error.message);
    else console.log(`  ↺ profile updated: ${profile.email}`);
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .insert({ user_id: userId, ...profile });
  if (error) {
    console.error(`Profile insert (${profile.email}):`, error.message);
    process.exit(1);
  }
  console.log(`  ✓ profile: ${profile.email}`);
};

const getProfileId = async (email: string): Promise<string> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();
  if (error || !data) {
    console.error(`Profile not found: ${email}`);
    process.exit(1);
  }
  return data.id;
};

// ─── Domain helpers ──────────────────────────────────────────────────────────

const ensurePet = async (pet: Record<string, unknown>): Promise<string> => {
  const { data: existing } = await supabase
    .from("pets")
    .select("id")
    .eq("owner_id", pet.owner_id)
    .eq("name", pet.name)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("pets")
    .insert(pet)
    .select("id")
    .single();
  if (error) {
    console.error(`Pet insert (${pet.name}):`, error.message);
    process.exit(1);
  }
  console.log(`  ✓ pet: ${pet.name}`);
  return data.id;
};

const ensureSlot = async (slot: Record<string, unknown>): Promise<string> => {
  const { data: existing } = await supabase
    .from("availability_slots")
    .select("id")
    .eq("professional_id", slot.professional_id)
    .eq("date", slot.date)
    .eq("start_time", slot.start_time)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("availability_slots")
    .insert(slot)
    .select("id")
    .single();
  if (error) {
    console.error(`Slot insert:`, error.message);
    process.exit(1);
  }
  return data.id;
};

const ensureBooking = async (
  booking: Record<string, unknown>,
): Promise<string | null> => {
  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("owner_id", booking.owner_id)
    .eq("availability_slot_id", booking.availability_slot_id)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("bookings")
    .insert(booking)
    .select("id")
    .single();
  if (error) {
    console.error(`Booking insert:`, error.message);
    process.exit(1);
  }
  console.log(`  ✓ booking: ${booking.service_type} (${booking.status})`);
  return data.id;
};

const ensureReview = async (review: Record<string, unknown>): Promise<void> => {
  // Supprime l'ancienne review si elle existe (pour corriger les IDs périmés)
  await supabase.from("reviews").delete().eq("booking_id", review.booking_id);

  const { error } = await supabase.from("reviews").insert(review);
  if (error) {
    console.error(`Review insert:`, error.message);
    process.exit(1);
  }
  const snippet = (review.comment as string).substring(0, 45);
  console.log(`  ✓ review: ${review.rating}★ — "${snippet}..."`);
};

const ensureMessage = async (
  message: Record<string, unknown>,
): Promise<void> => {
  const { data: existing } = await supabase
    .from("messages")
    .select("id")
    .eq("booking_id", message.booking_id)
    .eq("sender_id", message.sender_id)
    .eq("content", message.content)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from("messages").insert(message);
  if (error) {
    console.error(`Message insert:`, error.message);
    process.exit(1);
  }
};

const ensureLead = async (lead: Record<string, unknown>): Promise<void> => {
  const { data: existing } = await supabase
    .from("insurance_leads")
    .select("id")
    .eq("owner_id", lead.owner_id)
    .eq("pet_id", lead.pet_id)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from("insurance_leads").insert(lead);
  if (error) {
    console.error(`Lead insert:`, error.message);
    process.exit(1);
  }
  console.log(`  ✓ lead: ${lead.pet_name} (${lead.status})`);
};

// ─── Seed ────────────────────────────────────────────────────────────────────

const seed = async () => {
  // ── 1. Users & profiles ──────────────────────────────────────────────────
  console.log("\n── Users & profiles");

  await ensureProfile(await getOrCreateAuthUser(ADMIN_EMAIL, ADMIN_PASSWORD), {
    email: ADMIN_EMAIL,
    full_name: ADMIN_NAME,
    role: "admin",
  });

  // Owners
  await ensureProfile(
    await getOrCreateAuthUser("owner1@galipet.ma", "Owner1234!"),
    {
      email: "owner1@galipet.ma",
      full_name: "Youssef Bennani",
      role: "owner",
      city: "Casablanca",
      phone: "0661234567",
      bio: "Amoureux des animaux, je cherche des professionnels de confiance pour Rex et Simba.",
    },
  );
  await ensureProfile(
    await getOrCreateAuthUser("owner2@galipet.ma", "Owner1234!"),
    {
      email: "owner2@galipet.ma",
      full_name: "Aicha Ouali",
      role: "owner",
      city: "Rabat",
      phone: "0662345678",
      bio: "Propriétaire de Mimi et Luna, toujours à la recherche du meilleur soin.",
    },
  );
  await ensureProfile(
    await getOrCreateAuthUser("owner3@galipet.ma", "Owner1234!"),
    {
      email: "owner3@galipet.ma",
      full_name: "Omar Benjelloun",
      role: "owner",
      city: "Casablanca",
      phone: "0663456789",
    },
  );
  await ensureProfile(
    await getOrCreateAuthUser("owner4@galipet.ma", "Owner1234!"),
    {
      email: "owner4@galipet.ma",
      full_name: "Sara Idrissi",
      role: "owner",
      city: "Marrakech",
      phone: "0664012345",
      bio: "Passionnée par les chats. Je voyage souvent et ai besoin de gardiens fiables.",
    },
  );
  await ensureProfile(
    await getOrCreateAuthUser("owner5@galipet.ma", "Owner1234!"),
    {
      email: "owner5@galipet.ma",
      full_name: "Mehdi Alami",
      role: "owner",
      city: "Tanger",
      phone: "0665123456",
    },
  );

  // Professionals
  await ensureProfile(
    await getOrCreateAuthUser("pro1@galipet.ma", "Pro1234!"),
    {
      email: "pro1@galipet.ma",
      full_name: "Fatima Zahra El Idrissi",
      role: "professional",
      city: "Rabat",
      phone: "0666234567",
      bio: "Spécialiste en garde et toilettage avec 5 ans d'expérience. Je traite chaque animal comme le mien.",
      services: ["garde", "toilettage", "promenade"],
      is_verified: true,
      rating_avg: 4.8,
      rating_count: 15,
      accepts_insurance: true,
      location_text: "Hay Riad, Rabat",
      price_per_day: 150,
    },
  );
  await ensureProfile(
    await getOrCreateAuthUser("pro2@galipet.ma", "Pro1234!"),
    {
      email: "pro2@galipet.ma",
      full_name: "Karim Benali",
      role: "professional",
      city: "Casablanca",
      phone: "0667345678",
      bio: "Vétérinaire diplômé et gardien expérimenté, disponible 7j/7. Urgences acceptées.",
      services: ["veterinaire", "garde"],
      is_verified: true,
      rating_avg: 4.6,
      rating_count: 22,
      accepts_insurance: true,
      location_text: "Maarif, Casablanca",
      price_per_day: 200,
    },
  );
  await ensureProfile(
    await getOrCreateAuthUser("pro3@galipet.ma", "Pro1234!"),
    {
      email: "pro3@galipet.ma",
      full_name: "Nadia Cherkaoui",
      role: "professional",
      city: "Marrakech",
      phone: "0668456789",
      bio: "Toiletteuse professionnelle certifiée et dresseuse. Spécialiste petites races.",
      services: ["toilettage", "dressage"],
      is_verified: false,
      rating_avg: 4.2,
      rating_count: 7,
      location_text: "Guéliz, Marrakech",
      price_per_day: 120,
    },
  );
  await ensureProfile(
    await getOrCreateAuthUser("pro4@galipet.ma", "Pro1234!"),
    {
      email: "pro4@galipet.ma",
      full_name: "Hassan Tazi",
      role: "professional",
      city: "Fès",
      phone: "0669567890",
      bio: "Promeneur et gardien passionné par les animaux depuis 3 ans. Grands espaces disponibles.",
      services: ["promenade", "garde"],
      is_verified: false,
      price_per_day: 80,
    },
  );
  await ensureProfile(
    await getOrCreateAuthUser("pro5@galipet.ma", "Pro1234!"),
    {
      email: "pro5@galipet.ma",
      full_name: "Imane Rachidi",
      role: "professional",
      city: "Tanger",
      phone: "0660678901",
      bio: "Spécialiste en toilettage et garde à domicile. Douceur et professionnalisme garantis.",
      services: ["toilettage", "promenade", "garde"],
      is_verified: true,
      rating_avg: 4.0,
      rating_count: 9,
      accepts_insurance: false,
      location_text: "Centre-ville, Tanger",
      price_per_day: 100,
    },
  );
  await ensureProfile(
    await getOrCreateAuthUser("pro6@galipet.ma", "Pro1234!"),
    {
      email: "pro6@galipet.ma",
      full_name: "Yassir Ouazzani",
      role: "professional",
      city: "Casablanca",
      phone: "0661789012",
      bio: "Vétérinaire et dresseur certifié. 8 ans d'expérience en comportementalisme animal.",
      services: ["veterinaire", "dressage"],
      is_verified: true,
      rating_avg: 4.9,
      rating_count: 31,
      accepts_insurance: true,
      location_text: "Anfa, Casablanca",
      price_per_day: 250,
    },
  );

  // Both role (owner + professional)
  await ensureProfile(
    await getOrCreateAuthUser("both1@galipet.ma", "Both1234!"),
    {
      email: "both1@galipet.ma",
      full_name: "Leila Naciri",
      role: "both",
      city: "Rabat",
      phone: "0662890123",
      bio: "Propriétaire de Coco et professionnelle de la garde animale. Je comprends vos besoins car je suis aussi de votre côté !",
      services: ["garde", "toilettage"],
      is_verified: true,
      rating_avg: 4.7,
      rating_count: 11,
      location_text: "Agdal, Rabat",
      price_per_day: 130,
    },
  );

  // ── 2. Resolve profile IDs ───────────────────────────────────────────────
  console.log("\n── Resolving profile IDs");
  const [
    idOwner1,
    idOwner2,
    idOwner3,
    idOwner4,
    idOwner5,
    idPro1,
    idPro2,
    idPro3,
    idPro4,
    idPro5,
    idPro6,
    idBoth1,
  ] = await Promise.all([
    getProfileId("owner1@galipet.ma"),
    getProfileId("owner2@galipet.ma"),
    getProfileId("owner3@galipet.ma"),
    getProfileId("owner4@galipet.ma"),
    getProfileId("owner5@galipet.ma"),
    getProfileId("pro1@galipet.ma"),
    getProfileId("pro2@galipet.ma"),
    getProfileId("pro3@galipet.ma"),
    getProfileId("pro4@galipet.ma"),
    getProfileId("pro5@galipet.ma"),
    getProfileId("pro6@galipet.ma"),
    getProfileId("both1@galipet.ma"),
  ]);

  // ── 3. Pets ──────────────────────────────────────────────────────────────
  console.log("\n── Pets");
  const petRex = await ensurePet({
    owner_id: idOwner1,
    name: "Rex",
    species: "dog",
    breed: "Berger Allemand",
    age: 3,
    weight: 30,
  });
  const petSimba = await ensurePet({
    owner_id: idOwner1,
    name: "Simba",
    species: "cat",
    breed: "Siamois",
    age: 1,
    weight: 4,
  });
  const petMimi = await ensurePet({
    owner_id: idOwner2,
    name: "Mimi",
    species: "cat",
    breed: "Persan",
    age: 2,
    weight: 4,
  });
  const petLuna = await ensurePet({
    owner_id: idOwner2,
    name: "Luna",
    species: "dog",
    breed: "Chihuahua",
    age: 5,
    weight: 3,
  });
  const petMax = await ensurePet({
    owner_id: idOwner3,
    name: "Max",
    species: "dog",
    breed: "Labrador",
    age: 4,
    weight: 28,
  });
  const petBella = await ensurePet({
    owner_id: idOwner3,
    name: "Bella",
    species: "dog",
    breed: "Caniche",
    age: 2,
    weight: 8,
  });
  const petNour = await ensurePet({
    owner_id: idOwner4,
    name: "Nour",
    species: "cat",
    breed: "Angora",
    age: 3,
    weight: 5,
  });
  const petZara = await ensurePet({
    owner_id: idOwner4,
    name: "Zara",
    species: "dog",
    breed: "Spitz",
    age: 4,
    weight: 7,
  });
  const petTiger = await ensurePet({
    owner_id: idOwner5,
    name: "Tiger",
    species: "dog",
    breed: "Rottweiler",
    age: 2,
    weight: 40,
  });
  const petCoco = await ensurePet({
    owner_id: idBoth1,
    name: "Coco",
    species: "other",
    age: 5,
    weight: 1,
  });

  // ── 4. Availability slots ────────────────────────────────────────────────
  console.log("\n── Availability slots");

  // Past slots (booked — completed/cancelled)
  const slotPro1Past1 = await ensureSlot({
    professional_id: idPro1,
    date: "2026-03-10",
    start_time: "09:00",
    end_time: "17:00",
    is_booked: true,
  });
  const slotPro1Past2 = await ensureSlot({
    professional_id: idPro1,
    date: "2026-04-05",
    start_time: "09:00",
    end_time: "17:00",
    is_booked: true,
  });
  const slotPro2Past1 = await ensureSlot({
    professional_id: idPro2,
    date: "2026-03-20",
    start_time: "10:00",
    end_time: "18:00",
    is_booked: true,
  });
  const slotPro2Past2 = await ensureSlot({
    professional_id: idPro2,
    date: "2026-04-10",
    start_time: "10:00",
    end_time: "18:00",
    is_booked: true,
  });
  const slotPro3Past = await ensureSlot({
    professional_id: idPro3,
    date: "2026-04-20",
    start_time: "09:00",
    end_time: "13:00",
    is_booked: true,
  });
  const slotPro5Past = await ensureSlot({
    professional_id: idPro5,
    date: "2026-04-15",
    start_time: "08:00",
    end_time: "14:00",
    is_booked: true,
  });
  const slotPro6Past = await ensureSlot({
    professional_id: idPro6,
    date: "2026-04-12",
    start_time: "09:00",
    end_time: "12:00",
    is_booked: true,
  });
  const slotBoth1Past = await ensureSlot({
    professional_id: idBoth1,
    date: "2026-04-08",
    start_time: "10:00",
    end_time: "16:00",
    is_booked: true,
  });

  // Today — in_progress
  const slotPro2Today = await ensureSlot({
    professional_id: idPro2,
    date: "2026-04-28",
    start_time: "10:00",
    end_time: "18:00",
    is_booked: true,
  });
  const slotPro6Today = await ensureSlot({
    professional_id: idPro6,
    date: "2026-04-28",
    start_time: "09:00",
    end_time: "13:00",
    is_booked: true,
  });

  // Upcoming — confirmed / pending
  const slotPro1Fut1 = await ensureSlot({
    professional_id: idPro1,
    date: "2026-05-05",
    start_time: "09:00",
    end_time: "17:00",
    is_booked: true,
  });
  const slotPro1Fut2 = await ensureSlot({
    professional_id: idPro1,
    date: "2026-05-12",
    start_time: "09:00",
    end_time: "17:00",
    is_booked: true,
  });
  const slotPro2Fut = await ensureSlot({
    professional_id: idPro2,
    date: "2026-05-06",
    start_time: "10:00",
    end_time: "18:00",
    is_booked: true,
  });
  const slotPro3Fut = await ensureSlot({
    professional_id: idPro3,
    date: "2026-05-08",
    start_time: "09:00",
    end_time: "13:00",
    is_booked: true,
  });
  const slotPro4Fut = await ensureSlot({
    professional_id: idPro4,
    date: "2026-05-07",
    start_time: "08:00",
    end_time: "12:00",
    is_booked: true,
  });
  const slotPro5Fut = await ensureSlot({
    professional_id: idPro5,
    date: "2026-05-10",
    start_time: "08:00",
    end_time: "14:00",
    is_booked: true,
  });
  const slotBoth1Fut = await ensureSlot({
    professional_id: idBoth1,
    date: "2026-05-09",
    start_time: "10:00",
    end_time: "16:00",
    is_booked: true,
  });

  // Free upcoming slots (visible when browsing a pro's profile)
  // pro1 — Fatima Zahra (garde, toilettage, promenade) — Rabat
  for (const [date, start, end] of [
    ["2026-05-15", "09:00", "17:00"],
    ["2026-05-17", "09:00", "13:00"],
    ["2026-05-20", "14:00", "18:00"],
    ["2026-05-22", "09:00", "17:00"],
    ["2026-05-24", "09:00", "13:00"],
    ["2026-05-27", "09:00", "17:00"],
    ["2026-05-29", "14:00", "18:00"],
    ["2026-06-02", "09:00", "17:00"],
    ["2026-06-05", "09:00", "13:00"],
    ["2026-06-09", "09:00", "17:00"],
    ["2026-06-12", "14:00", "18:00"],
    ["2026-06-16", "09:00", "17:00"],
  ]) {
    await ensureSlot({ professional_id: idPro1, date, start_time: start, end_time: end, is_booked: false });
  }

  // pro2 — Karim Benali (veterinaire, garde) — Casablanca
  for (const [date, start, end] of [
    ["2026-05-14", "10:00", "18:00"],
    ["2026-05-16", "10:00", "14:00"],
    ["2026-05-19", "10:00", "18:00"],
    ["2026-05-21", "10:00", "14:00"],
    ["2026-05-23", "10:00", "18:00"],
    ["2026-05-26", "10:00", "18:00"],
    ["2026-05-28", "10:00", "14:00"],
    ["2026-06-02", "10:00", "18:00"],
    ["2026-06-04", "10:00", "14:00"],
    ["2026-06-08", "10:00", "18:00"],
    ["2026-06-11", "10:00", "14:00"],
    ["2026-06-15", "10:00", "18:00"],
  ]) {
    await ensureSlot({ professional_id: idPro2, date, start_time: start, end_time: end, is_booked: false });
  }

  // pro3 — Nadia Cherkaoui (toilettage, dressage) — Marrakech
  for (const [date, start, end] of [
    ["2026-05-13", "09:00", "13:00"],
    ["2026-05-15", "14:00", "18:00"],
    ["2026-05-17", "09:00", "13:00"],
    ["2026-05-19", "14:00", "18:00"],
    ["2026-05-21", "09:00", "13:00"],
    ["2026-05-23", "14:00", "18:00"],
    ["2026-05-26", "09:00", "13:00"],
    ["2026-05-28", "14:00", "18:00"],
    ["2026-06-01", "09:00", "13:00"],
    ["2026-06-03", "14:00", "18:00"],
    ["2026-06-06", "09:00", "13:00"],
    ["2026-06-10", "14:00", "18:00"],
  ]) {
    await ensureSlot({ professional_id: idPro3, date, start_time: start, end_time: end, is_booked: false });
  }

  // pro4 — Hassan Tazi (promenade, garde) — Fès
  for (const [date, start, end] of [
    ["2026-05-11", "08:00", "12:00"],
    ["2026-05-13", "08:00", "12:00"],
    ["2026-05-16", "08:00", "12:00"],
    ["2026-05-18", "08:00", "12:00"],
    ["2026-05-20", "08:00", "12:00"],
    ["2026-05-23", "08:00", "12:00"],
    ["2026-05-25", "08:00", "12:00"],
    ["2026-05-27", "08:00", "16:00"],
    ["2026-06-01", "08:00", "12:00"],
    ["2026-06-03", "08:00", "12:00"],
    ["2026-06-06", "08:00", "12:00"],
    ["2026-06-10", "08:00", "16:00"],
  ]) {
    await ensureSlot({ professional_id: idPro4, date, start_time: start, end_time: end, is_booked: false });
  }

  // pro5 — Imane Rachidi (toilettage, promenade, garde) — Tanger
  for (const [date, start, end] of [
    ["2026-05-15", "09:00", "15:00"],
    ["2026-05-18", "09:00", "15:00"],
    ["2026-05-20", "09:00", "13:00"],
    ["2026-05-22", "09:00", "15:00"],
    ["2026-05-25", "09:00", "15:00"],
    ["2026-05-27", "09:00", "13:00"],
    ["2026-05-29", "09:00", "15:00"],
    ["2026-06-01", "09:00", "15:00"],
    ["2026-06-03", "09:00", "13:00"],
    ["2026-06-06", "09:00", "15:00"],
    ["2026-06-09", "09:00", "15:00"],
    ["2026-06-13", "09:00", "13:00"],
  ]) {
    await ensureSlot({ professional_id: idPro5, date, start_time: start, end_time: end, is_booked: false });
  }

  // pro6 — Yassir Ouazzani (veterinaire, dressage) — Casablanca
  for (const [date, start, end] of [
    ["2026-05-13", "09:00", "13:00"],
    ["2026-05-15", "14:00", "18:00"],
    ["2026-05-19", "09:00", "13:00"],
    ["2026-05-21", "14:00", "18:00"],
    ["2026-05-25", "09:00", "13:00"],
    ["2026-05-27", "14:00", "18:00"],
    ["2026-05-29", "09:00", "13:00"],
    ["2026-06-02", "14:00", "18:00"],
    ["2026-06-04", "09:00", "13:00"],
    ["2026-06-08", "14:00", "18:00"],
    ["2026-06-11", "09:00", "13:00"],
    ["2026-06-15", "14:00", "18:00"],
  ]) {
    await ensureSlot({ professional_id: idPro6, date, start_time: start, end_time: end, is_booked: false });
  }

  // both1 — Leila Naciri (garde, toilettage) — Rabat
  for (const [date, start, end] of [
    ["2026-05-14", "10:00", "16:00"],
    ["2026-05-16", "10:00", "16:00"],
    ["2026-05-18", "10:00", "14:00"],
    ["2026-05-21", "10:00", "16:00"],
    ["2026-05-23", "10:00", "14:00"],
    ["2026-05-25", "10:00", "16:00"],
    ["2026-05-28", "10:00", "16:00"],
    ["2026-06-01", "10:00", "16:00"],
    ["2026-06-04", "10:00", "14:00"],
    ["2026-06-08", "10:00", "16:00"],
    ["2026-06-11", "10:00", "14:00"],
    ["2026-06-15", "10:00", "16:00"],
  ]) {
    await ensureSlot({ professional_id: idBoth1, date, start_time: start, end_time: end, is_booked: false });
  }

  // ── 5. Bookings ──────────────────────────────────────────────────────────
  console.log("\n── Bookings");

  // completed
  const bk1 = await ensureBooking({
    owner_id: idOwner1,
    professional_id: idPro1,
    pet_id: petRex,
    availability_slot_id: slotPro1Past1,
    service_type: "garde",
    total_price: 150,
    status: "completed",
    start_date: "2026-03-10",
    end_date: "2026-03-10",
  });
  const bk2 = await ensureBooking({
    owner_id: idOwner2,
    professional_id: idPro2,
    pet_id: petMimi,
    availability_slot_id: slotPro2Past1,
    service_type: "veterinaire",
    total_price: 200,
    status: "completed",
    start_date: "2026-03-20",
    end_date: "2026-03-20",
  });
  const bk3 = await ensureBooking({
    owner_id: idOwner1,
    professional_id: idPro1,
    pet_id: petRex,
    availability_slot_id: slotPro1Past2,
    service_type: "promenade",
    total_price: 100,
    status: "completed",
    start_date: "2026-04-05",
    end_date: "2026-04-05",
  });
  const bk4 = await ensureBooking({
    owner_id: idOwner3,
    professional_id: idPro2,
    pet_id: petMax,
    availability_slot_id: slotPro2Past2,
    service_type: "garde",
    total_price: 200,
    status: "completed",
    start_date: "2026-04-10",
    end_date: "2026-04-10",
  });
  const bk5 = await ensureBooking({
    owner_id: idOwner4,
    professional_id: idPro5,
    pet_id: petNour,
    availability_slot_id: slotPro5Past,
    service_type: "toilettage",
    total_price: 120,
    status: "completed",
    start_date: "2026-04-15",
    end_date: "2026-04-15",
  });
  const bk6 = await ensureBooking({
    owner_id: idOwner5,
    professional_id: idPro6,
    pet_id: petTiger,
    availability_slot_id: slotPro6Past,
    service_type: "veterinaire",
    total_price: 250,
    status: "completed",
    start_date: "2026-04-12",
    end_date: "2026-04-12",
  });
  const bk7 = await ensureBooking({
    owner_id: idOwner2,
    professional_id: idBoth1,
    pet_id: petLuna,
    availability_slot_id: slotBoth1Past,
    service_type: "garde",
    total_price: 130,
    status: "completed",
    start_date: "2026-04-08",
    end_date: "2026-04-08",
  });

  // cancelled
  await ensureBooking({
    owner_id: idOwner3,
    professional_id: idPro3,
    pet_id: petMax,
    availability_slot_id: slotPro3Past,
    service_type: "toilettage",
    total_price: 180,
    status: "cancelled",
    notes: "Annulé par le propriétaire",
    start_date: "2026-04-20",
    end_date: "2026-04-20",
  });

  // in_progress (today: 2026-04-28)
  const bk8 = await ensureBooking({
    owner_id: idOwner2,
    professional_id: idPro2,
    pet_id: petLuna,
    availability_slot_id: slotPro2Today,
    service_type: "garde",
    total_price: 200,
    status: "in_progress",
    start_date: "2026-04-28",
    end_date: "2026-04-28",
  });
  const bk9 = await ensureBooking({
    owner_id: idOwner3,
    professional_id: idPro6,
    pet_id: petBella,
    availability_slot_id: slotPro6Today,
    service_type: "dressage",
    total_price: 220,
    status: "in_progress",
    start_date: "2026-04-28",
    end_date: "2026-04-28",
  });

  // confirmed
  const bk10 = await ensureBooking({
    owner_id: idOwner1,
    professional_id: idPro1,
    pet_id: petRex,
    availability_slot_id: slotPro1Fut1,
    service_type: "garde",
    total_price: 150,
    status: "confirmed",
    start_date: "2026-05-05",
    end_date: "2026-05-05",
  });
  const bk11 = await ensureBooking({
    owner_id: idOwner4,
    professional_id: idPro3,
    pet_id: petZara,
    availability_slot_id: slotPro3Fut,
    service_type: "toilettage",
    total_price: 180,
    status: "confirmed",
    start_date: "2026-05-08",
    end_date: "2026-05-08",
  });
  const bk12 = await ensureBooking({
    owner_id: idOwner5,
    professional_id: idBoth1,
    pet_id: petTiger,
    availability_slot_id: slotBoth1Fut,
    service_type: "garde",
    total_price: 130,
    status: "confirmed",
    start_date: "2026-05-09",
    end_date: "2026-05-09",
  });

  // pending
  await ensureBooking({
    owner_id: idOwner2,
    professional_id: idPro4,
    pet_id: petMimi,
    availability_slot_id: slotPro4Fut,
    service_type: "promenade",
    total_price: 120,
    status: "pending",
    start_date: "2026-05-07",
    end_date: "2026-05-07",
  });
  await ensureBooking({
    owner_id: idOwner3,
    professional_id: idPro1,
    pet_id: petBella,
    availability_slot_id: slotPro1Fut2,
    service_type: "toilettage",
    total_price: 150,
    status: "pending",
    start_date: "2026-05-12",
    end_date: "2026-05-12",
  });
  await ensureBooking({
    owner_id: idOwner1,
    professional_id: idPro5,
    pet_id: petSimba,
    availability_slot_id: slotPro5Fut,
    service_type: "toilettage",
    total_price: 120,
    status: "pending",
    start_date: "2026-05-10",
    end_date: "2026-05-10",
  });
  await ensureBooking({
    owner_id: idOwner3,
    professional_id: idPro2,
    pet_id: petMax,
    availability_slot_id: slotPro2Fut,
    service_type: "veterinaire",
    total_price: 200,
    status: "pending",
    start_date: "2026-05-06",
    end_date: "2026-05-06",
  });

  // ── 6. Reviews ───────────────────────────────────────────────────────────
  console.log("\n── Reviews");

  if (bk1)
    await ensureReview({
      booking_id: bk1,
      reviewer_id: idOwner1,
      reviewee_id: idPro1,
      rating: 5,
      comment:
        "Fatima est exceptionnelle ! Rex était aux petits soins. Je recommande vivement.",
    });
  if (bk2)
    await ensureReview({
      booking_id: bk2,
      reviewer_id: idOwner2,
      reviewee_id: idPro2,
      rating: 5,
      comment:
        "Karim a été très professionnel et attentionné avec Mimi. Excellent service !",
    });
  if (bk3)
    await ensureReview({
      booking_id: bk3,
      reviewer_id: idOwner1,
      reviewee_id: idPro1,
      rating: 5,
      comment:
        "Deuxième fois avec Fatima, toujours aussi parfaite. Rex adore ses promenades !",
    });
  if (bk4)
    await ensureReview({
      booking_id: bk4,
      reviewer_id: idOwner3,
      reviewee_id: idPro2,
      rating: 4,
      comment:
        "Très bon service de garde, Max était bien soigné. Quelques petits délais de réponse.",
    });
  if (bk5)
    await ensureReview({
      booking_id: bk5,
      reviewer_id: idOwner4,
      reviewee_id: idPro5,
      rating: 4,
      comment:
        "Imane fait un toilettage soigné. Nour était propre et sentait bon. Bonne expérience.",
    });
  if (bk6)
    await ensureReview({
      booking_id: bk6,
      reviewer_id: idOwner5,
      reviewee_id: idPro6,
      rating: 5,
      comment:
        "Yassir est un vrai expert ! Tiger a été diagnostiqué rapidement. Très rassurant.",
    });
  if (bk7)
    await ensureReview({
      booking_id: bk7,
      reviewer_id: idOwner2,
      reviewee_id: idBoth1,
      rating: 5,
      comment:
        "Leila est adorable et très compétente. Luna était épanouie à son retour !",
    });

  // ── 7. Messages ──────────────────────────────────────────────────────────
  console.log("\n── Messages");

  if (bk8) {
    await ensureMessage({
      booking_id: bk8,
      sender_id: idOwner2,
      receiver_id: idPro2,
      content: "Bonjour Karim, Luna est bien arrivée ?",
      is_read: true,
      sent_at: "2026-04-28T09:15:00Z",
    });
    await ensureMessage({
      booking_id: bk8,
      sender_id: idPro2,
      receiver_id: idOwner2,
      content:
        "Oui, elle est arrivée ! Elle joue déjà avec les autres chiens, tout va bien 🐶",
      is_read: true,
      sent_at: "2026-04-28T09:30:00Z",
    });
    await ensureMessage({
      booking_id: bk8,
      sender_id: idOwner2,
      receiver_id: idPro2,
      content: "Super ! À quelle heure je peux venir la chercher ?",
      is_read: true,
      sent_at: "2026-04-28T10:00:00Z",
    });
    await ensureMessage({
      booking_id: bk8,
      sender_id: idPro2,
      receiver_id: idOwner2,
      content: "Je serai disponible à partir de 17h30.",
      is_read: false,
      sent_at: "2026-04-28T10:05:00Z",
    });
  }
  if (bk9) {
    await ensureMessage({
      booking_id: bk9,
      sender_id: idPro6,
      receiver_id: idOwner3,
      content:
        "Bonjour Omar ! Bella a très bien commencé sa séance. Elle est vraiment intelligente.",
      is_read: true,
      sent_at: "2026-04-28T09:45:00Z",
    });
    await ensureMessage({
      booking_id: bk9,
      sender_id: idOwner3,
      receiver_id: idPro6,
      content: "Parfait ! On travaille sur quelles commandes aujourd'hui ?",
      is_read: true,
      sent_at: "2026-04-28T10:10:00Z",
    });
    await ensureMessage({
      booking_id: bk9,
      sender_id: idPro6,
      receiver_id: idOwner3,
      content:
        "Assis, couché et rappel. Elle progresse vite, vous allez être surpris 😊",
      is_read: false,
      sent_at: "2026-04-28T10:20:00Z",
    });
  }
  if (bk10) {
    await ensureMessage({
      booking_id: bk10,
      sender_id: idOwner1,
      receiver_id: idPro1,
      content:
        "Bonjour Fatima ! Avez-vous besoin d'informations particulières pour le 5 mai ?",
      is_read: true,
      sent_at: "2026-04-26T14:00:00Z",
    });
    await ensureMessage({
      booking_id: bk10,
      sender_id: idPro1,
      receiver_id: idOwner1,
      content:
        "Non, Rex est un habitué 😊. Apportez juste sa gamelle et sa laisse préférée.",
      is_read: true,
      sent_at: "2026-04-26T14:30:00Z",
    });
    await ensureMessage({
      booking_id: bk10,
      sender_id: idOwner1,
      receiver_id: idPro1,
      content: "Parfait, merci ! À lundi.",
      is_read: true,
      sent_at: "2026-04-26T14:35:00Z",
    });
  }
  if (bk11) {
    await ensureMessage({
      booking_id: bk11,
      sender_id: idOwner4,
      receiver_id: idPro3,
      content:
        "Bonjour Nadia, Zara a un nœud derrière l'oreille droite. Pouvez-vous y faire attention ?",
      is_read: true,
      sent_at: "2026-04-27T09:00:00Z",
    });
    await ensureMessage({
      booking_id: bk11,
      sender_id: idPro3,
      receiver_id: idOwner4,
      content: "Bien sûr ! Je le note. À jeudi 😊",
      is_read: false,
      sent_at: "2026-04-27T09:20:00Z",
    });
  }
  if (bk12) {
    await ensureMessage({
      booking_id: bk12,
      sender_id: idOwner5,
      receiver_id: idBoth1,
      content:
        "Bonjour Leila, Tiger peut être nerveux avec les inconnus. Comment vous adaptez-vous ?",
      is_read: true,
      sent_at: "2026-04-27T11:00:00Z",
    });
    await ensureMessage({
      booking_id: bk12,
      sender_id: idBoth1,
      receiver_id: idOwner5,
      content:
        "Pas de souci ! Je ferai une première rencontre courte avant le 9 mai pour qu'il me découvre.",
      is_read: true,
      sent_at: "2026-04-27T11:20:00Z",
    });
    await ensureMessage({
      booking_id: bk12,
      sender_id: idOwner5,
      receiver_id: idBoth1,
      content: "Bonne idée ! On peut faire ça samedi matin ?",
      is_read: false,
      sent_at: "2026-04-27T11:25:00Z",
    });
  }

  // ── 8. Insurance leads ───────────────────────────────────────────────────
  console.log("\n── Insurance leads");

  await ensureLead({
    owner_id: idOwner1,
    pet_id: petRex,
    pet_name: "Rex",
    pet_species: "chien",
    owner_name: "Youssef Bennani",
    owner_phone: "0661234567",
    owner_city: "Casablanca",
    status: "new",
  });
  await ensureLead({
    owner_id: idOwner2,
    pet_id: petMimi,
    pet_name: "Mimi",
    pet_species: "chat",
    owner_name: "Aicha Ouali",
    owner_phone: "0662345678",
    owner_city: "Rabat",
    status: "contacted",
  });
  await ensureLead({
    owner_id: idOwner3,
    pet_id: petMax,
    pet_name: "Max",
    pet_species: "chien",
    owner_name: "Omar Benjelloun",
    owner_phone: "0663456789",
    owner_city: "Casablanca",
    status: "converted",
  });
  await ensureLead({
    owner_id: idOwner4,
    pet_id: petNour,
    pet_name: "Nour",
    pet_species: "chat",
    owner_name: "Sara Idrissi",
    owner_phone: "0664012345",
    owner_city: "Marrakech",
    status: "new",
  });
  await ensureLead({
    owner_id: idOwner4,
    pet_id: petZara,
    pet_name: "Zara",
    pet_species: "chien",
    owner_name: "Sara Idrissi",
    owner_phone: "0664012345",
    owner_city: "Marrakech",
    status: "rejected",
  });
  await ensureLead({
    owner_id: idOwner5,
    pet_id: petTiger,
    pet_name: "Tiger",
    pet_species: "chien",
    owner_name: "Mehdi Alami",
    owner_phone: "0665123456",
    owner_city: "Tanger",
    status: "contacted",
  });
  await ensureLead({
    owner_id: idOwner1,
    pet_id: petSimba,
    pet_name: "Simba",
    pet_species: "chat",
    owner_name: "Youssef Bennani",
    owner_phone: "0661234567",
    owner_city: "Casablanca",
    status: "new",
  });
  await ensureLead({
    owner_id: idBoth1,
    pet_id: petCoco,
    pet_name: "Coco",
    pet_species: "autre",
    owner_name: "Leila Naciri",
    owner_phone: "0662890123",
    owner_city: "Rabat",
    status: "contacted",
  });

  // ── Done ─────────────────────────────────────────────────────────────────
  console.log("\n── Credentials");
  console.log(`  admin  : ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(
    "  ─ Owners ──────────────────────────────────────────────────────────────────────",
  );
  console.log(
    "  owner1 : owner1@galipet.ma / Owner1234!  (Youssef, Casablanca)  Rex + Simba",
  );
  console.log(
    "  owner2 : owner2@galipet.ma / Owner1234!  (Aicha, Rabat)         Mimi + Luna",
  );
  console.log(
    "  owner3 : owner3@galipet.ma / Owner1234!  (Omar, Casablanca)     Max + Bella",
  );
  console.log(
    "  owner4 : owner4@galipet.ma / Owner1234!  (Sara, Marrakech)      Nour + Zara",
  );
  console.log(
    "  owner5 : owner5@galipet.ma / Owner1234!  (Mehdi, Tanger)        Tiger",
  );
  console.log(
    "  ─ Professionals ───────────────────────────────────────────────────────────────",
  );
  console.log(
    "  pro1   : pro1@galipet.ma   / Pro1234!    (Fatima, Rabat)        garde toilettage promenade  ✅ assurance",
  );
  console.log(
    "  pro2   : pro2@galipet.ma   / Pro1234!    (Karim, Casablanca)    vétérinaire garde           ✅ assurance",
  );
  console.log(
    "  pro3   : pro3@galipet.ma   / Pro1234!    (Nadia, Marrakech)     toilettage dressage",
  );
  console.log(
    "  pro4   : pro4@galipet.ma   / Pro1234!    (Hassan, Fès)          promenade garde",
  );
  console.log(
    "  pro5   : pro5@galipet.ma   / Pro1234!    (Imane, Tanger)        toilettage promenade garde  ✅",
  );
  console.log(
    "  pro6   : pro6@galipet.ma   / Pro1234!    (Yassir, Casablanca)   vétérinaire dressage        ✅ assurance",
  );
  console.log(
    "  ─ Both ────────────────────────────────────────────────────────────────────────",
  );
  console.log(
    "  both1  : both1@galipet.ma  / Both1234!   (Leila, Rabat)         garde toilettage            ✅  + owner of Coco",
  );
  process.exit(0);
};

seed();
