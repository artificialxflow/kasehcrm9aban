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

/** ورودی UI به تومان/کیلو → رشتهٔ ریال برای API */
export function tomanPerKgToRialString(toman: string | number): string {
  const t = typeof toman === "string" ? parseFloat(toman.replace(/,/g, "")) : toman;
  if (!Number.isFinite(t) || t <= 0) throw new Error("INVALID_TOMAN");
  return String(Math.round(t * 10));
}

export function rialPerKgToTomanInput(rial: bigint | number | string | null | undefined): string {
  if (rial == null || rial === "") return "";
  return String(Math.round(Number(rial) / 10));
}

export function lineTotalRial(weightGrams: number, unitPriceRialPerKg: bigint): bigint {
  return (BigInt(weightGrams) * unitPriceRialPerKg) / BigInt(1000);
}
