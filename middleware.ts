import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight first-line guard for /admin.
 * The authoritative session + permission checks happen server-side in
 * app/admin/(panel)/layout.tsx and every /api/admin route.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = !!req.cookies.get("ag_session")?.value;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/admin/login" && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
