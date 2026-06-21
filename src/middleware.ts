import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { getUserRole } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

const publicRoutes = ["/", "/login", "/register", "/campaigns", "/leaderboard"];
const authRoutes = ["/login", "/register"];

const roleRouteMap: Record<string, string[]> = {
  BRAND: ["/brand"],
  CREATOR: ["/clipper"],
  AGENCY: ["/agency"],
  ADMIN: ["/admin"],
};

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  if (
    response.headers.get("location") ||
    (response.status >= 300 && response.status < 400)
  ) {
    return response;
  }

  const session = await auth();
  const role = getUserRole(session);
  const { nextUrl } = request;
  const rawPathname = nextUrl.pathname;

  let locale = routing.defaultLocale;
  let pathname = rawPathname;

  for (const loc of routing.locales) {
    if (loc !== routing.defaultLocale && rawPathname.startsWith(`/${loc}`)) {
      locale = loc;
      pathname = rawPathname.slice(loc.length + 1) || "/";
      break;
    }
  }

  const localePrefix = locale === routing.defaultLocale ? "" : `/${locale}`;

  if (publicRoutes.includes(pathname)) {
    if (session && authRoutes.includes(pathname)) {
      const redirectMap: Record<string, string> = {
        BRAND: "/brand",
        CREATOR: "/clipper",
        AGENCY: "/agency",
        ADMIN: "/admin",
      };
      return NextResponse.redirect(
        new URL(`${localePrefix}${redirectMap[role ?? ""] || "/"}`, nextUrl)
      );
    }
    return response;
  }

  if (!session) {
    return NextResponse.redirect(new URL(`${localePrefix}/login`, nextUrl));
  }

  for (const [routeRole, paths] of Object.entries(roleRouteMap)) {
    if (paths.some((p) => pathname.startsWith(p))) {
      if (role !== routeRole && role !== "ADMIN") {
        return NextResponse.redirect(new URL(`${localePrefix}/`, nextUrl));
      }
      break;
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
