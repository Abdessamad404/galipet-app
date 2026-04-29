import { Request, Response } from "express";
import {
  sendMessage,
  getBookingMessages,
  markAsRead,
  getUnreadCount,
  deleteMessage,
} from "./messages.service";
import { success, error } from "../../utils/response";

export const send = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const { booking_id, receiver_id, content } = req.body;

    if (!booking_id || !receiver_id || !content) {
      return error(res, "Tous les champs sont requis", 400);
    }

    const message = await sendMessage(req.user.id, {
      booking_id,
      receiver_id,
      content,
    });

    return success(res, message, 201);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const getByBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const bookingId = req.params.bookingId as string;
    const messages = await getBookingMessages(bookingId, req.user.id);
    return success(res, messages);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const markRead = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const id = req.params.id as string;
    const message = await markAsRead(id, req.user.id);
    return success(res, message);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    if (!req.user) return error(res, "Non autorisé", 401);
    await deleteMessage(req.params.id as string, req.user.id);
    return success(res, { deleted: true });
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const unreadCount = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const result = await getUnreadCount(req.user.id);
    return success(res, result);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};
