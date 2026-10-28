import { cookies } from "next/headers";
import { verifyAccessToken } from "./jwt";

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) return null;

    const payload = await verifyAccessToken(token);
    return payload;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (session.role !== "ADMINISTRADOR") throw new Error("Forbidden");
  return session;
}
