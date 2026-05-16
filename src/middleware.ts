import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const user = req.auth?.user;
  const role = user?.role as string | undefined;
  const vetStatus = user?.vetStatus as string | undefined;

  const path = nextUrl.pathname;

  const isAuthRoute =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password");

  const isOnboardingRoute = path.startsWith("/onboarding");
  const isPendingApprovalRoute = path.startsWith("/pending-approval");
  const isDashboardRoute = path.startsWith("/dashboard");
  const isGenericDashboard = path === "/dashboard";

  // ─── UNAUTHENTICATED ──────────────────────────────────────────────────────
  if (!isLoggedIn) {
    const isBookingRoute = path.startsWith("/book");

    if (
      isDashboardRoute ||
      isOnboardingRoute ||
      isPendingApprovalRoute ||
      isBookingRoute
    ) {
      return Response.redirect(new URL(`/login?callbackUrl=${path}`, nextUrl));
    }
    return undefined;
  }

  // ─── AUTHENTICATED ────────────────────────────────────────────────────────

  // /dashboard → route by role
  if (isGenericDashboard) {
    if (role === "ADMIN")
      return Response.redirect(new URL("/dashboard/admin", nextUrl));
    if (role === "VET")
      return Response.redirect(new URL("/dashboard/vet", nextUrl));
    return Response.redirect(new URL("/dashboard/client", nextUrl));
  }

  // Authenticated users on auth pages → redirect to dashboard
  if (isAuthRoute) {
    if (role === "ADMIN")
      return Response.redirect(new URL("/dashboard/admin", nextUrl));
    if (role === "VET")
      return Response.redirect(new URL("/dashboard/vet", nextUrl));
    return Response.redirect(new URL("/dashboard/client", nextUrl));
  }

  // ─── VET RULES ────────────────────────────────────────────────────────────
  if (role === "VET") {
    // Must complete onboarding first
    if (vetStatus === "PENDING_ONBOARDING" && !isOnboardingRoute) {
      return Response.redirect(new URL("/onboarding", nextUrl));
    }

    // Submitted but awaiting approval → hold on pending page
    if (
      vetStatus === "PENDING_APPROVAL" &&
      !isPendingApprovalRoute &&
      !isOnboardingRoute
    ) {
      return Response.redirect(new URL("/pending-approval", nextUrl));
    }

    // Rejected → force back to onboarding to resubmit, or let them see pending page
    if (
      vetStatus === "REJECTED" &&
      !isPendingApprovalRoute &&
      !isOnboardingRoute
    ) {
      return Response.redirect(new URL("/pending-approval", nextUrl));
    }

    // Block vets from client/admin dashboards
    if (
      path.startsWith("/dashboard/client") ||
      path.startsWith("/dashboard/admin")
    ) {
      return Response.redirect(new URL("/dashboard/vet", nextUrl));
    }
  }

  // ─── CLIENT RULES ─────────────────────────────────────────────────────────
  if (role === "CLIENT") {
    if (
      path.startsWith("/dashboard/vet") ||
      path.startsWith("/dashboard/admin")
    ) {
      return Response.redirect(new URL("/dashboard/client", nextUrl));
    }
    // Clients shouldn't access vet-only pages
    if (isOnboardingRoute || isPendingApprovalRoute) {
      return Response.redirect(new URL("/dashboard/client", nextUrl));
    }
  }

  // ─── ADMIN RULES ──────────────────────────────────────────────────────────
  // Admins can access everything

  return undefined;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|site.webmanifest).*)",
  ],
};
