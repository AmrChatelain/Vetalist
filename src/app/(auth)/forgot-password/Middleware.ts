import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed", // French (default) has no prefix, English gets /en
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};