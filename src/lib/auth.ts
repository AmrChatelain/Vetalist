import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { cookies } from "next/headers";
import { authConfig } from "./auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
            passwordHash: true,
            image: true,
            vetProfile: {
              select: { status: true },
            },
          },
        });

        if (!user) return null;
        if (!user.passwordHash) return null; // Google-only account

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
          vetStatus: user.vetProfile?.status ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const email = user.email!.toLowerCase();

          // Read the opaque token — NOT a raw role value
          const cookieStore = await cookies();
          const intentToken = cookieStore.get("pending_role_token")?.value;

          // Default to CLIENT — only override if server-verified token says VET
          let role: "CLIENT" | "VET" = "CLIENT";

          if (intentToken) {
            try {
              const { Redis } = await import("@upstash/redis");
              const redis = new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL!,
                token: process.env.UPSTASH_REDIS_REST_TOKEN!,
              });

              const storedRole = await redis.get<string>(
                `oauth-intent:${intentToken}`,
              );

              // Validate the stored value is exactly one of the two allowed roles
              if (storedRole === "VET" || storedRole === "CLIENT") {
                role = storedRole;
              }

              // Delete immediately — single use token
              await redis.del(`oauth-intent:${intentToken}`);
            } catch {
              // Redis error → default to CLIENT, never crash the auth flow
              role = "CLIENT";
            }
          }

          const existingUser = await db.user.findUnique({
            where: { email },
            select: { id: true, image: true },
          });

          if (!existingUser) {
            const firstName =
              (profile as any)?.given_name ||
              user.name?.split(" ")[0] ||
              "Prénom";
            const lastName =
              (profile as any)?.family_name ||
              user.name?.split(" ").slice(1).join(" ") ||
              "Nom";

            await db.user.create({
              data: {
                email,
                firstName,
                lastName,
                image: user.image,
                role,
              },
            });
          } else if (!existingUser.image && user.image) {
            await db.user.update({
              where: { email },
              data: { image: user.image },
            });
            // Existing user — keep their existing role, never override from cookie
          }

          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger }) {
      // 1. Fresh sign-in — populate token from the user object returned by authorize()
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "CLIENT";
        token.firstName = (user as any).firstName ?? "";
        token.lastName = (user as any).lastName ?? "";
        token.vetStatus = (user as any).vetStatus ?? null;
        token.image = user.image ?? null;
      }

      // 2. For Google sign-in, the user object from the signIn callback doesn't
      //    contain our custom fields yet — fetch them from DB once after OAuth.
      //    Also re-sync when the session is explicitly updated (trigger === "update").
      if (trigger === "signIn" || trigger === "update") {
        if (token.email) {
          try {
            const dbUser = await db.user.findUnique({
              where: { email: token.email.toLowerCase() },
              select: {
                id: true,
                role: true,
                firstName: true,
                lastName: true,
                image: true,
                vetProfile: {
                  select: { status: true },
                },
              },
            });

            if (dbUser) {
              token.id = dbUser.id;
              token.role = dbUser.role;
              token.firstName = dbUser.firstName;
              token.lastName = dbUser.lastName;
              token.image = dbUser.image;
              // vetStatus lives on the vetProfile relation, NOT on User directly
              token.vetStatus = dbUser.vetProfile?.status ?? null;
            }
          } catch (error) {
            console.error("JWT DB sync error:", error);
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.image = token.image as string;
        session.user.vetStatus = token.vetStatus as string | null;
      }
      return session;
    },
  },
});
