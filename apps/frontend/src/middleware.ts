import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/dashboard", "/profile"];
const authRoutes = ["/login", "/signup"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    console.error("[Middleware] AUTH_SECRET is not set!");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Try different cookie names that NextAuth v5 might use
  const cookieNames = [
    "__Secure-authjs.session-token",
    "authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ];

  let token = null;

  // Try each possible cookie name
  for (const cookieName of cookieNames) {
    try {
      token = await getToken({
        req: request,
        secret,
        cookieName,
      });
      if (token) {
        break;
      }
    } catch (error) {
      console.log(
        `[Middleware] Failed to get token with ${cookieName}:`,
        error
      );
    }
  }

  // If still no token, try without specifying cookieName (let NextAuth auto-detect)
  if (!token) {
    try {
      token = await getToken({
        req: request,
        secret,
      });
    } catch (error) {
      console.log("[Middleware] Auto-detection failed:", error);
    }
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If user is authenticated and trying to access auth routes, allow them to continue
  if (token && isAuthRoute) {
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/login", "/signup"],
};