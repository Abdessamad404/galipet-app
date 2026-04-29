import { Request, Response } from "express";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
} from "./bookings.service";
import { success, error } from "../../utils/response";

export const create = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const { professional_id, pet_id, slot_id, service_type, price, notes } =
      req.body;

    if (!professional_id || !pet_id || !slot_id || !service_type) {
      return error(
        res,
        "Professionnel, animal, créneau et type de service requis",
        400,
      );
    }

    const booking = await createBooking(req.user.id, {
      professional_id,
      pet_id,
      slot_id,
      service_type,
      price,
      notes,
    });

    return success(res, booking, 201);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const getMine = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const { asRole } = req.query;
    const role =
      asRole === "professional"
        ? "professional"
        : ("owner" as "owner" | "professional");

    const bookings = await getMyBookings(req.user.id, role);
    return success(res, bookings);
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
    const booking = await getBookingById(id, req.user.id);
    return success(res, booking);
  } catch (err: unknown) {
    return error(res, (err as Error).message, 404);
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const id = req.params.id as string;
    const { status } = req.body;

    if (!["confirmed", "in_progress", "cancelled", "completed"].includes(status)) {
      return error(res, "Statut invalide", 400);
    }

    const booking = await updateBookingStatus(id, req.user.id, status);
    return success(res, booking);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};
