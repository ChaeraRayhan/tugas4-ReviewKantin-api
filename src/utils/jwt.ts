import "dotenv/config";
import jwt from "jsonwebtoken";

export type Role = "admin" | "owner" | "customer";

export interface AuthUser {
  id: number;
  role: Role;
}

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET belum diatur di file .env");
}

const expiresIn = (process.env.JWT_EXPIRES_IN ?? "1h") as jwt.SignOptions["expiresIn"];

const ROLES: Role[] = ["admin", "owner", "customer"];

export function signToken(user: AuthUser): string {
  return jwt.sign({ role: user.role }, secret as string, {
    subject: String(user.id),
    expiresIn,
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, secret as string, { algorithms: ["HS256"] });
  if (
    typeof payload === "string" ||
    !payload.sub ||
    !ROLES.includes(payload.role as Role)
  ) {
    throw new Error("Payload token tidak valid");
  }
  return { id: Number(payload.sub), role: payload.role as Role };
}
