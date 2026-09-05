// ─── In-Memory Sliding-Window Rate Limiter ───────────────────────────────────
//
// Tracks login attempts per IP address.
// 10 attempts per 15-minute window. Simple Map-based, no external deps.
// TODO: Replace with distributed rate limiting (e.g. Redis/Upstash)
// before multi-instance/serverless production deployment.

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

type RateLimitEntry = {
  count: number;
  resetAt: number; // epoch ms
};

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries periodically (every 5 min)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Check whether a request from `ip` is allowed.
 * Returns `{ success: true }` if allowed, or `{ success: false, retryAfterSeconds }`.
 */
export function checkRateLimit(ip: string): {
  success: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const entry = store.get(ip);

  // No entry or window expired → fresh window
  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { success: true };
  }

  // Within window and under limit
  if (entry.count < MAX_ATTEMPTS) {
    entry.count += 1;
    return { success: true };
  }

  // Over limit
  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
  return { success: false, retryAfterSeconds };
}
