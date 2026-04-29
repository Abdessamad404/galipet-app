"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = __importDefault(require("../../config/supabase"));
// Génère un token JWT à partir des infos de l'utilisateur
const generateToken = (user) => {
    const payload = { id: user.id, email: user.email, role: user.role };
    const secret = process.env.JWT_SECRET || "default-secret-change-in-production";
    const options = {
        expiresIn: "7d", // 7 jours par défaut
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
const registerUser = async (email, password, full_name, role) => {
    // 1. Crée l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase_1.default.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });
    if (authError)
        throw new Error(authError.message);
    // 2. Crée son profil dans notre table profiles
    const { data: profile, error: profileError } = await supabase_1.default
        .from("profiles")
        .insert({ auth_user_id: authData.user.id, full_name, role })
        .select()
        .single();
    if (profileError)
        throw new Error(profileError.message);
    const token = generateToken({ id: profile.id, email, role });
    return { profile, token };
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    // 1. Connexion via Supabase Auth
    const { data: authData, error: authError } = await supabase_1.default.auth.signInWithPassword({
        email,
        password,
    });
    if (authError)
        throw new Error("Email ou mot de passe incorrect");
    // 2. Récupère le profil depuis notre table
    const { data: profile, error: profileError } = await supabase_1.default
        .from("profiles")
        .select("*")
        .eq("auth_user_id", authData.user.id)
        .single();
    if (profileError)
        throw new Error(profileError.message);
    const token = generateToken({ id: profile.id, email, role: profile.role });
    return { profile, token };
};
exports.loginUser = loginUser;
const getCurrentUser = async (userId) => {
    // Récupère le profil de l'utilisateur connecté
    const { data: profile, error } = await supabase_1.default
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
    if (error)
        throw new Error(error.message);
    return profile;
};
exports.getCurrentUser = getCurrentUser;
