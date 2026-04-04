import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "change_me_refresh";

export type JwtUserPayload = {
  userId: number;
  role: "admin" | "editor" | "viewer";
};

export function signAccessToken(payload: JwtUserPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function signRefreshToken(payload: JwtUserPayload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as JwtUserPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtUserPayload;
}
