import dotenv from "dotenv";
dotenv.config();

import supabase from "../config/supabase";

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

const getBookingId = async (ownerEmail: string, proEmail: string, date: string): Promise<string | null> => {
  const ownerId = await getProfileId(ownerEmail);
  const proId = await getProfileId(proEmail);

  const { data } = await supabase
    .from("bookings")
    .select("id")
    .eq("owner_id", ownerId)
    .eq("professional_id", proId)
    .eq("start_date", date)
    .maybeSingle();

  return data?.id ?? null;
};

const seed = async () => {
  console.log("── Fetching profile IDs");
  const [idOwner1, idOwner2, idOwner3, idOwner4, idOwner5, idPro1, idPro2, idPro5, idPro6, idBoth1] =
    await Promise.all([
      getProfileId("owner1@galipet.ma"),
      getProfileId("owner2@galipet.ma"),
      getProfileId("owner3@galipet.ma"),
      getProfileId("owner4@galipet.ma"),
      getProfileId("owner5@galipet.ma"),
      getProfileId("pro1@galipet.ma"),
      getProfileId("pro2@galipet.ma"),
      getProfileId("pro5@galipet.ma"),
      getProfileId("pro6@galipet.ma"),
      getProfileId("both1@galipet.ma"),
    ]);

  console.log("── Fetching booking IDs");
  const [bk1, bk2, bk3, bk4, bk5, bk6, bk7] = await Promise.all([
    getBookingId("owner1@galipet.ma", "pro1@galipet.ma", "2026-03-10"),
    getBookingId("owner2@galipet.ma", "pro2@galipet.ma", "2026-03-20"),
    getBookingId("owner1@galipet.ma", "pro1@galipet.ma", "2026-04-05"),
    getBookingId("owner3@galipet.ma", "pro2@galipet.ma", "2026-04-10"),
    getBookingId("owner4@galipet.ma", "pro5@galipet.ma", "2026-04-15"),
    getBookingId("owner5@galipet.ma", "pro6@galipet.ma", "2026-04-12"),
    getBookingId("owner2@galipet.ma", "both1@galipet.ma", "2026-04-08"),
  ]);

  const reviews = [
    { booking_id: bk1, reviewer_id: idOwner1, reviewee_id: idPro1, rating: 5, comment: "Fatima est exceptionnelle ! Rex était aux petits soins. Je recommande vivement." },
    { booking_id: bk2, reviewer_id: idOwner2, reviewee_id: idPro2, rating: 5, comment: "Karim a été très professionnel et attentionné avec Mimi. Excellent service !" },
    { booking_id: bk3, reviewer_id: idOwner1, reviewee_id: idPro1, rating: 5, comment: "Deuxième fois avec Fatima, toujours aussi parfaite. Rex adore ses promenades !" },
    { booking_id: bk4, reviewer_id: idOwner3, reviewee_id: idPro2, rating: 4, comment: "Très bon service de garde, Max était bien soigné. Quelques petits délais de réponse." },
    { booking_id: bk5, reviewer_id: idOwner4, reviewee_id: idPro5, rating: 4, comment: "Imane fait un toilettage soigné. Nour était propre et sentait bon. Bonne expérience." },
    { booking_id: bk6, reviewer_id: idOwner5, reviewee_id: idPro6, rating: 5, comment: "Yassir est un vrai expert ! Tiger a été diagnostiqué rapidement. Très rassurant." },
    { booking_id: bk7, reviewer_id: idOwner2, reviewee_id: idBoth1, rating: 5, comment: "Leila est adorable et très compétente. Luna était épanouie à son retour !" },
  ].filter((r) => r.booking_id !== null);

  console.log(`── Inserting ${reviews.length} reviews`);

  // Supprime tout et réinsère proprement
  const bookingIds = reviews.map((r) => r.booking_id!);
  await supabase.from("reviews").delete().in("booking_id", bookingIds);

  const { data, error } = await supabase.from("reviews").insert(reviews).select();
  if (error) {
    console.error("Insert error:", error.message);
    process.exit(1);
  }

  for (const r of data ?? []) {
    console.log(`  ✓ review ${r.rating}★ → reviewee ${r.reviewee_id}`);
  }

  // Met à jour les rating_avg / rating_count sur les profils
  console.log("── Updating rating averages");
  const revieweeIds = [...new Set(reviews.map((r) => r.reviewee_id))];
  for (const id of revieweeIds) {
    const { data: allReviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("reviewee_id", id);
    if (!allReviews || allReviews.length === 0) continue;
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await supabase
      .from("profiles")
      .update({ rating_avg: avg, rating_count: allReviews.length })
      .eq("id", id);
    console.log(`  ✓ profile ${id} → avg=${avg.toFixed(2)}, count=${allReviews.length}`);
  }

  console.log("\nDone.");
  process.exit(0);
};

seed();
