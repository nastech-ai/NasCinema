import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  readGeoCountryCodeFromHeaders,
  resolveCountryCodeToTmdbWatchRegion,
} from "@/lib/resolve-country-to-tmdb-watch-region";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);

  if (!request.cookies.has("region")) {
    const raw = readGeoCountryCodeFromHeaders(request.headers);
    if (raw) {
      const region = resolveCountryCodeToTmdbWatchRegion(raw);
      response.cookies.set("region", region, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
