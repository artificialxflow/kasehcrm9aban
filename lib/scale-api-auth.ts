/** Optional shared secret for scale bridge POST (header: x-scale-api-key). */
export function verifyScaleApiKey(req: Request): boolean {
  const expected = process.env.SCALE_API_KEY?.trim();
  if (!expected) return true;
  const got = req.headers.get("x-scale-api-key")?.trim();
  return got === expected;
}
