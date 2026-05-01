import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      firstName: string
      lastName: string
      vetStatus?: string | null
    } & DefaultSession["user"]
  }

  // Add this — this is what fixes the auth.ts errors
  interface User {
    id: string
    role: string
    firstName: string
    lastName: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    firstName: string
    lastName: string
    vetStatus?: string | null
  }
}