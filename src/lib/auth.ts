import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

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

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, role: true, firstName: true, lastName: true, vetStatus: true }
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.passwordHash!);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          vetStatus: user.vetStatus,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const email = user.email!.toLowerCase();

          const existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (!existingUser) {
            const firstName =
              (profile as any)?.given_name ||
              user.name?.split(" ")[0] ||
              "First";
            const lastName =
              (profile as any)?.family_name ||
              user.name?.split(" ").slice(1).join(" ") ||
              "Last";

            await prisma.user.create({
              data: {
                email,
                firstName,
                lastName,
                image: user.image,
                role: "CLIENT",
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Error during Google sign-in:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // Runs on initial sign-in (credentials or google)
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.image = user.image;
        const nameParts = user.name?.split(" ") || ["", ""];
        token.firstName = (user as any).firstName || nameParts[0];
        token.lastName =
          (user as any).lastName || nameParts.slice(1).join(" ") || "";
      }

      // Only runs ONCE on first Google sign-in.
      // account is null on every subsequent request, so no repeat DB calls.
      if (account?.provider === "google" && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email.toLowerCase() },
            select: { id: true, role: true, firstName: true, lastName: true, vetStatus: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.firstName = dbUser.firstName;
            token.lastName = dbUser.lastName;
            token.vetStatus = dbUser.vetStatus;
          }
        } catch (error) {
          console.error("Failed to fetch user role from DB:", error);
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