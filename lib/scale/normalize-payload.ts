/** Trim padded ASCII weight lines like "     90  " → weightGrams */
export function normalizeRawAsciiWeight(barcode: string): number | null {
  const trimmed = barcode.trim();
  if (!trimmed) return null;
  if (trimmed.includes("|")) return null;
  const n = parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}
