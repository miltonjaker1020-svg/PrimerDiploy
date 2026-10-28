import { NextResponse, type NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { renewSession, tokenCookieOptions } from "@/lib/session";
import { canAccessPath, safeReturnPath } from "@/lib/access-rules";

export async function proxy(request: NextRequest) {
  let session = await verifyAccessToken(request.cookies.get("access_token")?.value ?? "");
  let newToken: string | undefined;
  if (!session) {
    const refresh = request.cookies.get("refresh_token")?.value;
    const renewed = refresh ? await renewSession(refresh) : null;
    if (renewed) { session = renewed.session; newToken = renewed.accessToken; }
  }
  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", safeReturnPath(request.nextUrl.pathname + request.nextUrl.search));
    return NextResponse.redirect(login);
  }
  if (!canAccessPath(request.nextUrl.pathname, session.role)) return NextResponse.redirect(new URL("/dashboard", request.url));


  if (newToken) request.cookies.set("access_token", newToken);
  const headers = new Headers(request.headers);
  headers.set("cookie", request.cookies.toString());
  const response = NextResponse.next({ request: { headers } });
  if (newToken) response.cookies.set("access_token", newToken, tokenCookieOptions(newToken));
  return response;
}
export const config = { matcher: ["/dashboard/:path*", "/admin/:path*", "/donation/:path*", "/request/:path*"] };
