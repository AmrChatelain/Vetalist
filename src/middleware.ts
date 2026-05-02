import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Use the edge-safe authConfig here — no Prisma, no bcrypt.
// The JWT token already contains role and vetStatus from the sign-in flow in auth.ts.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const user      = req.auth?.user;
  const role      = user?.role      as string | undefined;
  const vetStatus = user?.vetStatus as string | undefined;

  const path = nextUrl.pathname;

  const isAuthRoute =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password");

  const isOnboardingRoute   = path.startsWith("/onboarding");
  const isDashboardRoute    = path.startsWith("/dashboard");
  const isGenericDashboard  = path === "/dashboard";

  // ─── UNAUTHENTICATED ────────────────────────────────────────────────────
  if (!isLoggedIn) {
    if (isDashboardRoute || isOnboardingRoute) {
      return Response.redirect(new URL("/login", nextUrl));
    }
    return undefined; // allow
  }

  // ─── AUTHENTICATED ──────────────────────────────────────────────────────

  // /dashboard with no suffix → route to correct dashboard by role
  if (isGenericDashboard) {
    if (role === "ADMIN")  return Response.redirect(new URL("/dashboard/admin",  nextUrl));
    if (role === "VET")    return Response.redirect(new URL("/dashboard/vet",    nextUrl));
    return Response.redirect(new URL("/dashboard/client", nextUrl));
  }

  // Authenticated users visiting login/register → send to their dashboard
  if (isAuthRoute) {
    if (role === "ADMIN")  return Response.redirect(new URL("/dashboard/admin",  nextUrl));
    if (role === "VET")    return Response.redirect(new URL("/dashboard/vet",    nextUrl));
    return Response.redirect(new URL("/dashboard/client", nextUrl));
  }

  // ─── VET ────────────────────────────────────────────────────────────────
  if (role === "VET") {
    // Incomplete onboarding → force to /onboarding
    if (vetStatus === "PENDING_ONBOARDING" && !isOnboardingRoute) {
      return Response.redirect(new URL("/onboarding", nextUrl));
    }
    // Awaiting admin approval → block dashboard
    if (vetStatus === "PENDING_APPROVAL" && isDashboardRoute) {
      return Response.redirect(new URL("/", nextUrl));
    }
    // Block vets from client and admin dashboards
    if (path.startsWith("/dashboard/client") || path.startsWith("/dashboard/admin")) {
      return Response.redirect(new URL("/dashboard/vet", nextUrl));
    }
  }

  // ─── CLIENT ─────────────────────────────────────────────────────────────
  if (role === "CLIENT") {
    // Block clients from vet and admin dashboards
    if (path.startsWith("/dashboard/vet") || path.startsWith("/dashboard/admin")) {
      return Response.redirect(new URL("/dashboard/client", nextUrl));
    }
  }

  // ─── ADMIN ──────────────────────────────────────────────────────────────
  // Admins can access everything

  return undefined; // allow
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|site.webmanifest).*)",
  ],
};