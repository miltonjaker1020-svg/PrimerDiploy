import { decodeJwt } from "jose";
import { createHash } from "node:crypto";
import { prisma } from "./prisma";
import { signAccessToken, verifyRefreshToken } from "./jwt";

export const sessionCookieOptions = {
  httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/",
};
// These options are used only with tokens just signed by this application.
export function tokenCookieOptions(token: string) {
  return { ...sessionCookieOptions, expires: new Date((decodeJwt(token).exp ?? 0) * 1000) };
}
export const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function renewSession(refreshToken: string) {
  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, email: true, role: true, refreshTokenHash: true } });
  if (!user?.refreshTokenHash || user.refreshTokenHash !== tokenHash(refreshToken)) return null;
  const session = { userId: user.id, email: user.email, role: user.role };
  return { session, accessToken: await signAccessToken(session) };
}
