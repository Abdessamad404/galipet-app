import { Response } from "express";
import { ApiResponse } from "../types";

export const success = <T>(res: Response, data: T, status = 200): Response => {
  const body: ApiResponse<T> = { success: true, data };
  return res.status(status).json(body);
};

export const error = (
  res: Response,
  message: string,
  status = 400,
): Response => {
  const body: ApiResponse<never> = { success: false, error: message };
  return res.status(status).json(body);
};
