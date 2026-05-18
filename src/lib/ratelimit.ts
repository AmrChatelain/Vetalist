import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// 30 requests per minute — for search suggestions
export const suggestionsRatelimit = new Ratelimit({
  redis,
  limiter:   Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
  prefix:    "vetalist:suggestions",
})

// 10 requests per minute — for booking appointments
export const appointmentsRatelimit = new Ratelimit({
  redis,
  limiter:   Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix:    "vetalist:appointments",
})

// 5 requests per 15 minutes — for password reset
export const passwordResetRatelimit = new Ratelimit({
  redis,
  limiter:   Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix:    "vetalist:password-reset",
})