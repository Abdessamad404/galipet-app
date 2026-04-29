import { Request, Response } from "express";
import { registerUser, loginUser, getCurrentUser } from "./auth.service";
import { success, error } from "../../utils/response";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, role } = req.body;
    if (!email || !password || !full_name || !role) {
      return error(res, "Tous les champs sont requis", 400);
    }
    const data = await registerUser(email, password, full_name, role);
    return success(res, data, 201);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return error(res, "Email et mot de passe requis", 400);
    }
    const data = await loginUser(email, password);
    return success(res, data);
  } catch (err: unknown) {
    return error(res, (err as Error).message, 401);
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    // req.user est défini par le middleware protect
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }
    const profile = await getCurrentUser(req.user.id);
    return success(res, profile);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};
