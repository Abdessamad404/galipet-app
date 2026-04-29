import jwt, { SignOptions } from "jsonwebtoken";
import supabase from "../../config/supabase";
import { AuthUser } from "../../types";

// Génère un token JWT à partir des infos de l'utilisateur
const generateToken = (user: AuthUser): string => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const secret = process.env.JWT_SECRET || "default-secret-change-in-production";
  const options: SignOptions = {
    expiresIn: "7d", // 7 jours par défaut
  };
  return jwt.sign(payload, secret, options);
};

export const registerUser = async (
  email: string,
  password: string,
  full_name: string,
  role: "owner" | "professional" | "both",
) => {
  // 1. Crée l'utilisateur dans Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) throw new Error(authError.message);

  // 2. Crée son profil dans notre table profiles
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({ user_id: authData.user.id, email, full_name, role })
    .select()
    .single();

  if (profileError) throw new Error(profileError.message);

  const token = generateToken({ id: profile.id, email, role });
  return { profile, token };
};

export const loginUser = async (email: string, password: string) => {
  // 1. Connexion via Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) throw new Error("Email ou mot de passe incorrect");

  // 2. Récupère le profil depuis notre table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", authData.user.id)
    .single();

  if (profileError) throw new Error(profileError.message);
  const token = generateToken({ id: profile.id, email, role: profile.role });
  return { profile, token };
};

export const getCurrentUser = async (userId: string) => {
  // Récupère le profil de l'utilisateur connecté
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return profile;
};
