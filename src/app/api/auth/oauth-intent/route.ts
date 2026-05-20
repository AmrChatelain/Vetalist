import { NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import crypto from "crypto"

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const role = body.role === "VET" ? "VET" : "CLIENT"

  // Generate a secure random token
  const token = crypto.randomBytes(32).toString("hex")

  // Store in Redis — expires in 5 minutes, single use
  await redis.set(
    `oauth-intent:${token}`,
    role,
    { ex: 300 } // 5 minutes
  )

  return NextResponse.json({ token })
}