import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";  // ← add this import
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
    Google({                                        // ← add this block
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
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // 1. Normalize the email to lowercase for a safe comparison
          const email = user.email!.toLowerCase();

          // 2. Check if user already exists using the normalized email
          const existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (!existingUser) {
            // Create new user for first-time Google login
            // We use the name from Google profile
            const firstName = (profile as any)?.given_name || user.name?.split(" ")[0] || "First";
            const lastName = (profile as any)?.family_name || user.name?.split(" ").slice(1).join(" ") || "Last";

            await prisma.user.create({
              data: {
                email, // Use the normalized email here too!
                firstName,
                lastName,
                image: user.image, // This captures the Google profile picture
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

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.image = user.image; // Pass the image to the JWT
        // Handle both standard user object and Google profile name splitting
        const nameParts = user.name?.split(" ") || ["", ""];
        token.firstName = (user as any).firstName || nameParts[0];
        token.lastName = (user as any).lastName || nameParts.slice(1).join(" ") || "";
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.image = token.image as string; // Pass the image to the session
      }
      return session;
    },
  },
});