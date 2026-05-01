import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const user = req.auth?.user;
  const userRole = user?.role as string | undefined;
  const vetStatus = user?.vetStatus as string | undefined;

  // DEBUG LOGS
  console.log("--- MIDDLEWARE DEBUG ---");
  console.log("Path:", nextUrl.pathname);
  console.log("Is Logged In:", isLoggedIn);
  console.log("Role:", userRole);
  console.log("Vet Status:", vetStatus);
  console.log("------------------------");

  const isAuthRoute = 
    nextUrl.pathname.startsWith("/login") || 
    nextUrl.pathname.startsWith("/register") || 
    nextUrl.pathname.startsWith("/forgot-password") || 
    nextUrl.pathname.startsWith("/reset-password");

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isOnboardingRoute = nextUrl.pathname.startsWith("/onboarding");

  // 1. UNAUTHENTICATED USERS
  if (!isLoggedIn) {
    if (isDashboardRoute) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    return NextResponse.next();
  }

  // 2. AUTHENTICATED USERS
  if (isLoggedIn) {
    // Redirect from auth pages to appropriate dashboard
    if (isAuthRoute) {
      if (userRole === "ADMIN") return NextResponse.redirect(new URL("/dashboard/admin", nextUrl));
      if (userRole === "VET") return NextResponse.redirect(new URL("/dashboard/vet", nextUrl));
      return NextResponse.redirect(new URL("/dashboard/client", nextUrl));
    }

    // VET SPECIFIC LOGIC: Onboarding & Approval
    if (userRole === "VET") {
      // If they haven't finished onboarding, force them to /onboarding
      if (vetStatus === "PENDING_ONBOARDING" && !isOnboardingRoute) {
        return NextResponse.redirect(new URL("/onboarding", nextUrl));
      }

      // If they are awaiting approval, block dashboard access 
      // (Allowing them to stay on onboarding or a specific 'waiting' page if we had one)
      if (vetStatus === "PENDING_APPROVAL" && isDashboardRoute) {
        // Redirect to home or a dedicated waiting page. 
        // For now, let's send them to the landing page so they don't see an empty dashboard.
        return NextResponse.redirect(new URL("/", nextUrl));
      }

      // If they are fully approved (status is null or 'APPROVED'), allow dashboard access
      // But if they try to access admin routes, redirect them
      if (isDashboardRoute && nextUrl.pathname.startsWith("/dashboard/admin")) {
        return NextResponse.redirect(new URL("/dashboard/client", nextUrl));
      }
    }

    // ADMIN SPECIFIC LOGIC
    if (userRole === "ADMIN") {
      // Prevent Admin from accessing Client/Vet dashboard routes if desired, 
      // but usually Admins can access everything. We'll leave it open for now.
    }

    // CLIENT SPECIFIC LOGIC
    if (userRole === "CLIENT") {
      // Block client from admin or vet routes
      if (nextUrl.pathname.startsWith("/dashboard/admin") || nextUrl.pathname.startsWith("/dashboard/vet")) {
        return NextResponse.redirect(new URL("/dashboard/client", nextUrl));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|site.webmanifest).*)"],
};
