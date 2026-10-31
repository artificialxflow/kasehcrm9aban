/** Rial (DB) → Toman for display */
export function rialToToman(rial: bigint | number | string): number {
  const n = typeof rial === "bigint" ? Number(rial) : typeof rial === "string" ? Number(rial) : rial;
  return Math.round(n / 10);
}

export function formatToman(rial: bigint | number | string): string {
  const n = typeof rial === "string" ? Number(rial) : rial;
  return rialToToman(n).toLocaleString("fa-IR");
}

export function formatKgFromGrams(grams: number): string {
  return (grams / 1000).toLocaleString("fa-IR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

export function kgToGrams(kg: number): number {
  return Math.round(kg * 1000);
}

export function lineTotalRial(weightGrams: number, unitPriceRialPerKg: bigint): bigint {
  return (BigInt(weightGrams) * unitPriceRialPerKg) / BigInt(1000);
}
