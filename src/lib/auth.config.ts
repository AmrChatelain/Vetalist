import type { NextAuthConfig } from "next-auth";

// This file is intentionally free of any Node.js-only imports (Prisma, bcrypt, etc.)
// so it can safely run in the Edge Runtime used by middleware.ts.
// The full auth.ts imports this and adds providers + DB callbacks on top.

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  providers: [], // providers are added in auth.ts

  callbacks: {
    // jwt and session callbacks here only read from the token — no DB calls.
    // DB syncing happens in auth.ts which runs in Node.js only.
    async jwt({ token, user }) {
      if (user) {
        token.id        = user.id;
        token.role      = (user as any).role      ?? "CLIENT";
        token.firstName = (user as any).firstName ?? "";
        token.lastName  = (user as any).lastName  ?? "";
        token.vetStatus = (user as any).vetStatus ?? null;
        token.image     = user.image              ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id        = token.id        as string;
        session.user.role      = token.role      as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName  = token.lastName  as string;
        session.user.image     = token.image     as string;
        session.user.vetStatus = token.vetStatus as string | null;
      }
      return session;
    },
  },
};