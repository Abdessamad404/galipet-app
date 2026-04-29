import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthUser } from "../types";

// On étend le type Request d'Express pour lui ajouter "user"
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "Non autorisé" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Token invalide" });
  }
};

export const authorize = (...roles: AuthUser["role"][]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Accès refusé" });
    }
    next();
  };
