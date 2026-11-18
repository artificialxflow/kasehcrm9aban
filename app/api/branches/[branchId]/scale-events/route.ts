import { resolveBranchId } from "@/lib/branch-resolve";
import { jsonResponse } from "@/lib/api-json";
import { verifyScaleApiKey } from "@/lib/scale-api-auth";
import { validateScaleEventBody } from "@/lib/scale-event-validate";
import { scaleError, scaleOk } from "@/lib/scale-api-response";
import { ingestScaleEvent, countScaleEventsSince } from "@/lib/services/scale-integration";
import { checkScaleEventRateLimit } from "@/lib/scale-rate-limit";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { requirePanelAuth } from "@/lib/panel-auth";

type RouteCtx = { params: Promise<{ branchId: string }> };

function parseDateParam(value: string | null): Date | null {
  if (!value?.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(req: Request, ctx: RouteCtx) {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;

  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return scaleError("not_found", 404);

  const url = new URL(req.url);
  const barcode = url.searchParams.get("barcode")?.trim();
  const from = parseDateParam(url.searchParams.get("from"));
  const to = parseDateParam(url.searchParams.get("to"));
  const stats24h = url.searchParams.get("stats24h") === "1";

  const where: Prisma.ScaleIntegrationEventWhereInput = { branchId: branch.id };
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  let events = await prisma.scaleIntegrationEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  if (barcode) {
    events = events.filter((e) => {
      const rp = e.rawPayload as { barcode?: string };
      return (rp.barcode ?? "").includes(barcode);
    });
  }

  const payload: Record<string, unknown> = {
    ok: true,
    branch,
    events: events.slice(0, 50),
  };

  if (stats24h) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    payload.stats = {
      count24h: await countScaleEventsSince(branch.id, since),
    };
  }

  return jsonResponse(payload);
}

export async function POST(req: Request, ctx: RouteCtx) {
  if (!verifyScaleApiKey(req)) return scaleError("unauthorized", 401);
  if (!checkScaleEventRateLimit(req)) {
    return scaleError("rate_limited", 429);
  }

  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return scaleError("not_found", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return scaleError("validation", 422, { body: "invalid_json" });
  }

  const hasKey = Boolean(process.env.SCALE_API_KEY?.trim());
  const validated = validateScaleEventBody(body, {
    requireClientEventId: hasKey,
  });
  if (!validated.ok) {
    return scaleError("validation", 422, validated.fields);
  }

  const result = await ingestScaleEvent(branch.id, validated.data);

  if (result.kind === "duplicate") {
    return scaleOk(result.eventId, {
      status: 200,
      duplicate: true,
      saleId: result.saleInvoiceId ?? undefined,
    });
  }

  if (result.kind === "stored") {
    return scaleOk(result.eventId, { status: 201 });
  }

  if (result.kind === "error") {
    return scaleError(result.code.toLowerCase(), 422, {
      ingest: result.code,
      message: result.messageFa,
    });
  }

  return scaleOk(result.eventId, { status: 201, saleId: result.saleId ?? undefined });
}
