import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "@/types/payloads";

function secret(name: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET") {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return new TextEncoder().encode(value);
}

export async function signAccessToken(payload: JWTPayload) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt()
    .setExpirationTime(process.env.ACCESS_TOKEN_EXPIRES_IN || "15m").sign(secret("JWT_ACCESS_SECRET"));
}
export async function signRefreshToken({ userId }: Pick<JWTPayload, "userId">) {
  return new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt()
    .setJti(crypto.randomUUID()).setExpirationTime(process.env.REFRESH_TOKEN_EXPIRES_IN || "7d").sign(secret("JWT_REFRESH_SECRET"));
}
export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret("JWT_ACCESS_SECRET"), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string" || typeof payload.email !== "string" || !["DONANTE", "BENEFICIARIO", "ADMINISTRADOR"].includes(String(payload.role))) return null;
    return { userId: payload.userId, email: payload.email, role: String(payload.role) };
  } catch { return null; }
}
export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret("JWT_REFRESH_SECRET"), { algorithms: ["HS256"] });
    return typeof payload.userId === "string" ? { userId: payload.userId } : null;
  } catch { return null; }
}
