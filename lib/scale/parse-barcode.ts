/**
 * Stub parser for RADIN scale barcode / manual pipe-delimited payload.
 * Format: PLU|weightGrams|unitPriceRialPerKg
 * Example: POT001|225|1289000
 */
export type ParsedScaleBarcode = {
  pluCode: string;
  weightGrams: number;
  unitPriceRialPerKg: bigint;
};

export function parseScaleBarcode(raw: string): ParsedScaleBarcode | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const parts = trimmed.split("|").map((p) => p.trim());
  if (parts.length < 3) return null;

  const [pluCode, weightStr, priceStr] = parts;
  const weightGrams = parseInt(weightStr, 10);
  const unitPriceRialPerKg = BigInt(priceStr);

  if (!pluCode || !Number.isFinite(weightGrams) || weightGrams <= 0) return null;
  if (unitPriceRialPerKg <= BigInt(0)) return null;

  return { pluCode, weightGrams, unitPriceRialPerKg };
}
