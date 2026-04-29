import { Request, Response } from "express";
import {
  createSlot,
  getMySlots,
  getAvailableSlots,
  updateSlot,
  deleteSlot,
} from "./availability.service";
import { success, error } from "../../utils/response";

export const create = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const { date, start_time, end_time } = req.body;
    if (!date || !start_time || !end_time) {
      return error(res, "Date, heure de début et de fin requises", 400);
    }

    const slot = await createSlot(req.user.id, { date, start_time, end_time });
    return success(res, slot, 201);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const getMine = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const slots = await getMySlots(req.user.id);
    return success(res, slots);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const getAvailable = async (req: Request, res: Response) => {
  try {
    const professionalId = req.params.professionalId as string;
    const fromDate = req.query.fromDate as string | undefined;

    const slots = await getAvailableSlots(professionalId, fromDate);
    return success(res, slots);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const id = req.params.id as string;
    const updates = req.body;
    const slot = await updateSlot(id, req.user.id, updates);
    return success(res, slot);
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
    const result = await deleteSlot(id, req.user.id);
    return success(res, result);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};
