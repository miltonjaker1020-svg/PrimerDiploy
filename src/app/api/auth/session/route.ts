import { cookies } from "next/headers";
import { getSession } from "@/lib/auth-helpers";

export async function GET() {
  const session = await getSession();
  const hasRefresh = (await cookies()).has("refresh_token");
  return Response.json(
    session ? { user: { email: session.email, role: session.role } } : { user: null },
    { status: session || !hasRefresh ? 200 : 401, headers: { "Cache-Control": "private, no-store" } },
  );
}
