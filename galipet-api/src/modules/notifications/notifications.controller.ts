import { Request, Response } from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "./notifications.service";
import { success, error } from "../../utils/response";

export const getMine = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const { limit } = req.query;
    const notifications = await getMyNotifications(
      req.user.id,
      limit ? parseInt(limit as string) : undefined,
    );

    return success(res, notifications);
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
    const notification = await markAsRead(id, req.user.id);
    return success(res, notification);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const markAllRead = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const result = await markAllAsRead(req.user.id);
    return success(res, result);
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
