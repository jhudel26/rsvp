import { NextResponse } from "next/server";

const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now > current.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function rateLimitResponse() {
  return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
}
