const buckets = new Map<string, { count: number; resetAt: number }>();

const DEFAULT_PER_MIN = 120;

export function checkScaleEventRateLimit(req: Request): boolean {
  const limit = parseInt(process.env.SCALE_EVENTS_RATE_LIMIT_PER_MIN ?? "", 10);
  const perMin = Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_PER_MIN;

  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = forwarded || req.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const windowMs = 60_000;

  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > perMin) return false;
  return true;
}
