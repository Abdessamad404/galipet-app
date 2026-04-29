import { Request, Response } from "express";
import {
  createReview,
  getProfessionalReviews,
  getMyReviews,
} from "./reviews.service";
import { success, error } from "../../utils/response";

export const create = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const { booking_id, professional_id, rating, comment } = req.body;

    if (!booking_id || !professional_id || !rating) {
      return error(res, "Réservation, professionnel et note requis", 400);
    }

    if (rating < 1 || rating > 5) {
      return error(res, "La note doit être entre 1 et 5", 400);
    }

    const review = await createReview(req.user.id, {
      booking_id,
      professional_id,
      rating,
      comment,
    });

    return success(res, review, 201);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const getForProfessional = async (req: Request, res: Response) => {
  try {
    const professionalId = req.params.professionalId as string;
    const { limit, offset } = req.query;

    const reviews = await getProfessionalReviews(
      professionalId,
      limit ? parseInt(limit as string) : undefined,
      offset ? parseInt(offset as string) : undefined,
    );

    return success(res, reviews);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const getMine = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const reviews = await getMyReviews(req.user.id);
    return success(res, reviews);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};
