import { Request, Response } from "express";
import {
  createPet,
  getMyPets,
  getPetById,
  updatePet,
  deletePet,
  uploadPetPhoto,
} from "./pets.service";
import { success, error } from "../../utils/response";

export const create = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const { name, species, breed, age, weight, notes } = req.body;
    if (!name || !species) {
      return error(res, "Nom et espèce requis", 400);
    }

    const pet = await createPet(req.user.id, {
      name,
      species,
      breed,
      age,
      weight,
      notes,
    });
    return success(res, pet, 201);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const getMine = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const pets = await getMyPets(req.user.id);
    return success(res, pets);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const id = req.params.id as string;
    const pet = await getPetById(id, req.user.id);
    return success(res, pet);
  } catch (err: unknown) {
    return error(res, (err as Error).message, 404);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const id = req.params.id as string;
    const updates = req.body;
    const pet = await updatePet(id, req.user.id, updates);
    return success(res, pet);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const id = req.params.id as string;
    const result = await deletePet(id, req.user.id);
    return success(res, result);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const uploadPhoto = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    if (!req.file) {
      return error(res, "Aucun fichier fourni", 400);
    }

    const id = req.params.id as string;
    const pet = await uploadPetPhoto(id, req.user.id, req.file.buffer);
    return success(res, pet);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};
