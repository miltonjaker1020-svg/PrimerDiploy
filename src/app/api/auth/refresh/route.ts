import { cookies } from "next/headers";
import { renewSession, tokenCookieOptions } from "@/lib/session";
import { apiError } from "@/lib/api";

export async function POST() {
  try {
    const store = await cookies();
    const token = store.get("refresh_token")?.value;
    const renewed = token ? await renewSession(token) : null;
    if (!renewed) {
      store.delete("access_token"); store.delete("refresh_token");
      return Response.json({ error: "Sesión vencida. Inicia sesión nuevamente" }, { status: 401 });
    }
    store.set("access_token", renewed.accessToken, tokenCookieOptions(renewed.accessToken));
    return Response.json({ message: "Sesión renovada" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
