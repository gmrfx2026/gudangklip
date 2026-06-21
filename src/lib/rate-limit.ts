const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const DEFAULTS: Record<string, RateLimitConfig> = {
  auth: { windowMs: 60_000, maxRequests: 5 },      // 5 req/menit untuk login/register
  api: { windowMs: 60_000, maxRequests: 30 },       // 30 req/menit untuk API
  upload: { windowMs: 60_000, maxRequests: 10 },    // 10 upload/menit
  webhook: { windowMs: 1_000, maxRequests: 5 },     // 5 req/detik untuk webhook
};

export function checkRateLimit(
  key: string,
  configKey: keyof typeof DEFAULTS = "api"
): { success: boolean; remaining: number; resetAt: number } {
  const config = DEFAULTS[configKey];
  const now = Date.now();

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs });
    return { success: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60_000).unref();
