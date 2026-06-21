import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/register", "/campaigns", "/leaderboard"];
const authRoutes = ["/login", "/register"];

const roleRouteMap: Record<string, string[]> = {
  BRAND: ["/brand"],
  CREATOR: ["/creator"],
  AGENCY: ["/agency"],
  ADMIN: ["/admin"],
};

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const session = req.auth;
  const role = (session?.user as any)?.role;

  if (publicRoutes.includes(pathname)) {
    if (session && authRoutes.includes(pathname)) {
      const redirectMap: Record<string, string> = {
        BRAND: "/brand",
        CREATOR: "/creator",
        AGENCY: "/agency",
        ADMIN: "/admin",
      };
      return NextResponse.redirect(new URL(redirectMap[role] || "/", nextUrl));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  for (const [routeRole, paths] of Object.entries(roleRouteMap)) {
    if (paths.some((p) => pathname.startsWith(p))) {
      if (role !== routeRole && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", nextUrl));
      }
      break;
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
