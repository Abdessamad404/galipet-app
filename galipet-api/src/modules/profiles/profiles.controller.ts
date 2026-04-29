import { Request, Response } from "express";
import {
  getProfileById,
  updateProfile,
  uploadAvatar,
  searchProfiles,
  updateFcmToken,
} from "./profiles.service";
import { success, error } from "../../utils/response";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const profile = await getProfileById(id);
    return success(res, profile);
  } catch (err: unknown) {
    return error(res, (err as Error).message, 404);
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const updates = req.body;
    const profile = await updateProfile(req.user.id, updates);
    return success(res, profile);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const uploadMyAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    // Vérifie qu'un fichier est présent
    if (!req.file) {
      return error(res, "Aucun fichier fourni", 400);
    }

    const profile = await uploadAvatar(
      req.user.id,
      req.file.buffer,
      req.file.originalname,
    );
    return success(res, profile);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const patchFcmToken = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }
    const { fcm_token } = req.body;
    await updateFcmToken(req.user.id, fcm_token);
    return success(res, null);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const search = async (req: Request, res: Response) => {
  try {
    const { role, city, service, service_type_id, is_verified, limit, offset } =
      req.query;

    const filters = {
      role: role as "professional" | "both" | undefined,
      city: city as string | undefined,
      service: service as string | undefined,
      service_type_id: service_type_id as string | undefined,
      is_verified:
        is_verified === "true"
          ? true
          : is_verified === "false"
            ? false
            : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    };

    const profiles = await searchProfiles(filters);
    return success(res, profiles);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};
