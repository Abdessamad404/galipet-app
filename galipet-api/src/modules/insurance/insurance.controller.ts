import { Request, Response } from "express";
import {
  submitLead,
  getMyLeads,
  getAllLeads,
  updateLeadStatus,
} from "./insurance.service";
import { success, error } from "../../utils/response";

export const submit = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const { pet_id, full_name, phone, city } = req.body;

    if (!pet_id || !full_name || !phone || !city) {
      return error(res, "Tous les champs sont requis", 400);
    }

    const lead = await submitLead(req.user.id, {
      pet_id,
      full_name,
      phone,
      city,
    });

    return success(res, lead, 201);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const getMine = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const leads = await getMyLeads(req.user.id);
    return success(res, leads);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const { status, limit, offset } = req.query;

    const leads = await getAllLeads({
      status: status as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    return success(res, leads);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, "Non autorisé", 401);
    }

    const id = req.params.id as string;
    const { status } = req.body;

    if (!["new", "contacted", "converted", "rejected"].includes(status)) {
      return error(res, "Statut invalide", 400);
    }

    const lead = await updateLeadStatus(id, status);
    return success(res, lead);
  } catch (err: unknown) {
    return error(res, (err as Error).message);
  }
};
