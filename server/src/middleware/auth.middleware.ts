import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.util";
import { UnauthorizedError } from "./error.middleware";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    req.user = {
      id: payload.id,
      email: payload.email,
    };

    next();
  } catch (error) {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}
