import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken } from "@/lib/jwt";
import { getSession } from "@/lib/auth-helpers";
import { tokenHash } from "@/lib/session";
import { apiError } from "@/lib/api";

export async function POST() {
  try {
    const store = await cookies();
    const refresh = store.get("refresh_token")?.value;
    const session = refresh ? await verifyRefreshToken(refresh) : await getSession();
    if (session) await prisma.user.updateMany({
      where: { id: session.userId, ...(refresh ? { refreshTokenHash: tokenHash(refresh) } : {}) },
      data: { refreshTokenHash: null },
    });
    store.delete("access_token"); store.delete("refresh_token");
    return Response.json({ message: "Sesión cerrada" });
  } catch (error) { return apiError(error); }
}
