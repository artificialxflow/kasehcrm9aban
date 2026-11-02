import { jsonResponse } from "@/lib/api-json";

export type ScaleApiBody = {
  ok: boolean;
  id?: string;
  saleId?: string;
  duplicate?: boolean;
  error?: string;
  fields?: Record<string, string>;
};

export function scaleOk(
  id: string,
  init?: { status?: number; saleId?: string; duplicate?: boolean },
) {
  const body: ScaleApiBody = {
    ok: true,
    id,
    ...(init?.saleId ? { saleId: init.saleId } : {}),
    ...(init?.duplicate ? { duplicate: true } : {}),
  };
  return jsonResponse(body, { status: init?.status ?? 201 });
}

export function scaleError(
  error: string,
  status: number,
  fields?: Record<string, string>,
) {
  const body: ScaleApiBody = { ok: false, error, ...(fields ? { fields } : {}) };
  return jsonResponse(body, { status });
}
