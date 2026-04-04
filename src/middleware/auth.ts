import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/auth";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: "admin" | "editor" | "viewer";
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization required" });
    }
    const token = authHeader.split(" ")[1];
    const user = verifyAccessToken(token);
    req.user = { userId: user.userId, role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(requiredRoles: Array<"admin" | "editor" | "viewer">) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authorization required" });
    }
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient privileges" });
    }
    next();
  };
}
