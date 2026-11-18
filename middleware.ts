import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/panel-session";

function isScaleMachinePost(pathname: string, method: string): boolean {
  if (method !== "POST") return false;
  if (/^\/api\/branches\/[^/]+\/scale-events\/?$/.test(pathname)) return true;
  if (/^\/api\/branches\/[^/]+\/scale-agent\/(heartbeat|logs)\/?$/.test(pathname)) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/app") ||
    pathname === "/api/app/menu" ||
    pathname === "/api/auth/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/fonts") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  if (isScaleMachinePost(pathname, request.method)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
