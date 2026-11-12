import type { NextFunction, Request, RequestHandler, Response } from "express";
import { verifyToken, type AuthUser, type Role } from "../utils/jwt.ts";
import { UnauthorizedError } from "../errors/UnauthorizedError.ts";
import { ForbiddenError } from "../errors/ForbiddenError.ts";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) {
    return next(new UnauthorizedError("Token tidak ditemukan"));
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(
      new UnauthorizedError("Format header Authorization harus: Bearer <token>"),
    );
  }

  try {
    res.locals.user = verifyToken(token);
  } catch {
    return next(new UnauthorizedError("Token tidak valid atau sudah kedaluwarsa"));
  }
  return next();
}

export function requireRole(...roles: Role[]): RequestHandler {
  return (_req: Request, res: Response, next: NextFunction) => {
    const user = getAuthUser(res);
    if (!roles.includes(user.role)) {
      return next(new ForbiddenError("Anda tidak memiliki akses ke endpoint ini"));
    }
    return next();
  };
}

export function getAuthUser(res: Response): AuthUser {
  return res.locals.user as AuthUser;
}
